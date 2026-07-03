import { CategoryRepository } from '@/repositories/category.repository';

export class CategoryService {
  constructor(private categoryRepo: CategoryRepository) {}

  async getAll() {
    return this.categoryRepo.findAll();
  }

  async create(data: { name: string; icon?: string; color?: string; sortOrder?: number }) {
    return this.categoryRepo.create({
      name: data.name,
      icon: data.icon || null,
      color: data.color || null,
      sortOrder: data.sortOrder ?? 0,
    });
  }
}