import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ProductRepository extends BaseRepository {
  findById(id: string) {
    // Exclude soft-deleted products from detail lookups
    return this.db.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        reviews: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  findMany(params: {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    limit: number;
    offset: number;
  }) {
    const { where, orderBy, limit, offset } = params;
    return this.db.product.findMany({
      // Always exclude soft-deleted products from all list queries
      where: { ...where, isDeleted: false },
      orderBy,
      take: limit,
      skip: offset,
    });
  }

  count(where?: Prisma.ProductWhereInput) {
    // Always exclude soft-deleted products from counts
    return this.db.product.count({ where: { ...where, isDeleted: false } });
  }

  create(data: Record<string, unknown>) {
    return this.db.product.create({ data: data as Prisma.ProductCreateInput });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.db.product.update({
      where: { id },
      data: data as Prisma.ProductUpdateInput,
    });
  }

  /** Soft delete — marks isDeleted: true, never removes from DB */
  softDelete(id: string) {
    return this.db.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  batchCreate(items: Record<string, unknown>[]) {
    return this.db.$transaction(
      items.map((item) => this.db.product.create({ data: item as Prisma.ProductCreateInput }))
    );
  }

  batchUpdate(items: { id: string; data: Record<string, unknown> }[]) {
    return this.db.$transaction(
      items.map((item) =>
        this.db.product.update({
          where: { id: item.id },
          data: item.data as Prisma.ProductUpdateInput,
        })
      )
    );
  }

  /** Batch soft delete — marks all given ids as isDeleted: true */
  batchSoftDelete(ids: string[]) {
    return this.db.$transaction(
      ids.map((id) =>
        this.db.product.update({
          where: { id },
          data: { isDeleted: true },
        })
      )
    );
  }

  decrementStock(productId: string, quantity: number) {
    return this.db.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  }

  findManyByIds(ids: string[]) {
    // Only return non-deleted products (e.g. for cart/order validation)
    return this.db.product.findMany({
      where: { id: { in: ids }, isDeleted: false },
    });
  }

  updateRating(productId: string, rating: number, reviewCount: number) {
    return this.db.product.update({
      where: { id: productId },
      data: { rating, reviewCount },
    });
  }
}