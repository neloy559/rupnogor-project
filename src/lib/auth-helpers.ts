import { AppError } from '@/lib/errors';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import type { TokenPayload } from '@/shared/types/auth.types';

/**
 * Authenticate a request by first checking the Supabase session cookie,
 * then falling back to the legacy Bearer token approach.
 * Returns null if not authenticated.
 */
export async function authenticateRequest(request: Request): Promise<TokenPayload | null> {
  // ── Strategy 1: Supabase session (cookie-based) ──────────────────────
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.email) {
      // Fetch the role from the application database
      const { db } = await import('@/lib/db');
      const dbUser = await db.user.findUnique({
        where: { email: user.email },
        select: { id: true, role: true },
      });

      if (dbUser) {
        return {
          userId: dbUser.id,
          email: user.email,
          role: dbUser.role,
        };
      }
    }
  } catch {
    // Supabase not configured or other error — fall through to legacy auth
  }

  // ── Strategy 2: Legacy Bearer token (backward compatibility) ─────────
  const token = getTokenFromHeader(request);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload as TokenPayload;
}

/**
 * Require admin role. Throws AppError if not authenticated or not admin.
 * Returns the token payload on success.
 */
export async function requireAdmin(request: Request): Promise<TokenPayload> {
  const payload = await authenticateRequest(request);
  if (!payload) {
    throw AppError.unauthorized('Authentication required');
  }
  if (payload.role !== 'admin') {
    throw AppError.forbidden('Admin access required');
  }
  return payload;
}