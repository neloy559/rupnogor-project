import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class AddressRepository extends BaseRepository {
  findByUser(userId: string) {
    return this.db.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  findById(id: string) {
    return this.db.address.findUnique({ where: { id } });
  }

  findByIdAndUser(id: string, userId: string) {
    return this.db.address.findFirst({ where: { id, userId } });
  }

  create(data: {
    label?: string;
    fullName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    postalCode?: string;
    isDefault: boolean;
    userId: string;
  }) {
    return this.db.address.create({ data });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.db.address.update({
      where: { id },
      data: data as Record<string, unknown>,
    });
  }

  delete(id: string) {
    return this.db.address.delete({ where: { id } });
  }

  clearDefaults(tx: Prisma.TransactionClient, userId: string) {
    return tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}