import { BaseRepository } from './base.repository';

export class CategoryRepository extends BaseRepository {
  findAll() {
    return this.db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  create(data: { name: string; icon?: string | null; color?: string | null; sortOrder?: number }) {
    return this.db.category.create({ data });
  }
}