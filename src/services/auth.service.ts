import { AppError } from '@/lib/errors';
import { UserRepository } from '@/repositories/user.repository';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Authenticate via Supabase, then look up the app-level User record.
   * Returns the user data + Supabase access_token.
   */
  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw AppError.badRequest('Email and password are required');
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      const status = error?.status === 400 ? 400 : 401;
      throw new AppError(error?.message || 'Invalid email or password', status);
    }

    const dbUser = await this.userRepo.findByEmail(data.user.email!);
    if (!dbUser) {
      throw AppError.unauthorized('User record not found. Please contact support.');
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
      token: data.session.access_token,
    };
  }

  /**
   * Register via Supabase Auth, then create the app-level User record.
   * Returns the user data + Supabase access_token (if session available).
   */
  async register(
    email: string,
    password: string,
    name?: string,
    phone?: string,
  ): Promise<AuthResult> {
    if (!email || !password) {
      throw AppError.badRequest('Email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw AppError.badRequest('Invalid email format');
    }

    if (password.length < 6) {
      throw AppError.badRequest('Password must be at least 6 characters');
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || null, phone: phone || null },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        throw AppError.conflict('User with this email already exists');
      }
      throw AppError.badRequest(error.message);
    }

    if (!data.user) {
      throw AppError.badRequest('Registration failed');
    }

    // Create the app-level User record (role, profile fields)
    let dbUser;
    try {
      dbUser = await this.userRepo.create({
        email,
        password: '', // Password managed by Supabase
        name: name || null,
        phone: phone || null,
        role: 'customer',
      });
    } catch (dbError: unknown) {
      if (
        dbError &&
        typeof dbError === 'object' &&
        'code' in dbError &&
        (dbError as { code: string }).code === 'P2002'
      ) {
        // Unique constraint — clean up the Supabase user we just created
        await supabase.auth.admin.deleteUser(data.user.id).catch(() => {});
        throw AppError.conflict('User with this email already exists');
      }
      throw dbError;
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
      token: data.session?.access_token || '',
    };
  }

  /**
   * Get the authenticated user's profile from the app database.
   * Used by the /auth/me endpoint.
   */
  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.unauthorized('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}