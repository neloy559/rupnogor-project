import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class BannerRepository extends BaseRepository {
  findPublic() {
    return this.db.banner.findMany({
      where: { isActive: true, isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.db.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.db.banner.findUnique({ where: { id } });
  }

  create(data: {
    title: string;
    link?: string;
    image?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    isActive?: boolean;
    isPublic?: boolean;
  }) {
    return this.db.banner.create({ data });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.db.banner.update({
      where: { id },
      data: data as Prisma.BannerUpdateInput,
    });
  }

  delete(id: string) {
    return this.db.banner.delete({ where: { id } });
  }
}