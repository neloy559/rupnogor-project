import { Prisma } from '@prisma/client';
import { AppError } from '@/lib/errors';
import { AddressRepository } from '@/repositories/address.repository';

export class AddressService {
  constructor(private addressRepo: AddressRepository) {}

  async getAddresses(userId: string) {
    return this.addressRepo.findByUser(userId);
  }

  async createAddress(userId: string, data: {
    label?: string;
    fullName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    postalCode?: string;
    isDefault?: boolean;
  }) {
    return this.addressRepo.getDb().$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: {
          label: data.label || null,
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          apartment: data.apartment || null,
          city: data.city,
          postalCode: data.postalCode || null,
          isDefault: data.isDefault ?? false,
          userId,
        },
      });
    });
  }

  async updateAddress(userId: string, data: {
    id: string;
    label?: string;
    fullName?: string;
    phone?: string;
    street?: string;
    apartment?: string;
    city?: string;
    postalCode?: string;
    isDefault?: boolean;
  }) {
    const existing = await this.addressRepo.findByIdAndUser(data.id, userId);
    if (!existing) throw AppError.notFound('Address not found');

    return this.addressRepo.getDb().$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const { id, isDefault, ...updateData } = data;
      return tx.address.update({
        where: { id },
        data: {
          ...updateData,
          ...(isDefault !== undefined ? { isDefault } : {}),
        },
      });
    });
  }

  async deleteAddress(userId: string, id: string) {
    const existing = await this.addressRepo.findByIdAndUser(id, userId);
    if (!existing) throw AppError.notFound('Address not found');
    await this.addressRepo.delete(id);
    return { success: true };
  }
}