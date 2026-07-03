import { UserRole } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository {
  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  create(data: { email: string; password: string; name?: string | null; phone?: string | null; role?: UserRole }) {
    return this.db.user.create({ data });
  }
}