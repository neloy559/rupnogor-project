import { Prisma, ProductStatus } from '@prisma/client';
import { ProductRepository } from '@/repositories/product.repository';
import { formatProduct } from '@/shared/helpers/product-formatter';

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async getList(params: {
    search?: string;
    category?: string;
    badge?: string;
    status?: string;
    limit?: number;
    offset?: number;
    sort?: string;
    isAdmin?: boolean;
  }) {
    const {
      search = '',
      category = '',
      badge = '',
      status = 'active',
      limit = 20,
      offset = 0,
      sort = 'newest',
      isAdmin = false,
    } = params;

    const where: Prisma.ProductWhereInput = {};

    if (status && status !== 'all') {
      where.status = isAdmin ? (status as ProductStatus) : 'active';
    } else if (!isAdmin) {
      where.status = 'active';
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      // Filter by category name via the related Category model
      where.categoryRef = { name: category };
    }

    if (badge) {
      where.badge = badge;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === 'price_asc'
        ? { price: 'asc' }
        : sort === 'price_desc'
          ? { price: 'desc' }
          : sort === 'popular'
            ? { reviewCount: 'desc' }
            : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.productRepo.findMany({ where, orderBy, limit, offset }),
      this.productRepo.count(where),
    ]);

    return {
      products: products.map((p) => formatProduct(p as unknown as Record<string, unknown>)),
      total,
    };
  }

  async getDetail(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) return null;
    return formatProduct(product as unknown as Record<string, unknown>);
  }

  async updateProduct(id: string, body: Record<string, unknown>) {
    const existing = await this.productRepo.findById(id);
    if (!existing) return null;

    const updateData: Record<string, unknown> = {};
    const fields = ['name', 'description', 'price', 'comparePrice', 'sku', 'categoryId', 'stock', 'status', 'badge', 'rating', 'reviewCount'] as const;
    for (const field of fields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // Array fields — pass through directly (MongoDB stores as arrays)
    for (const arrField of ['images', 'colors', 'colorNames', 'sizes'] as const) {
      if (body[arrField] !== undefined) {
        updateData[arrField] = body[arrField];
      }
    }

    const updated = await this.productRepo.update(id, updateData);
    return formatProduct(updated as unknown as Record<string, unknown>);
  }

  async createProduct(body: Record<string, unknown>) {
    const data = this.buildProductData(body);
    const created = await this.productRepo.create(data);
    return formatProduct(created as unknown as Record<string, unknown>);
  }

  async deleteProduct(id: string) {
    // Soft delete — sets isDeleted: true, data is never removed from DB
    const existing = await this.productRepo.findById(id);
    if (!existing) return null;
    const deleted = await this.productRepo.softDelete(id);
    return formatProduct(deleted as unknown as Record<string, unknown>);
  }

  async batchOperation(action: 'create' | 'update' | 'delete', products: Record<string, unknown>[]) {
    if (action === 'create') {
      const items = products.map((p) => this.buildProductData(p));
      const created = await this.productRepo.batchCreate(items);
      return { products: created, count: created.length };
    }

    if (action === 'update') {
      const items = products
        .filter((p) => p.id)
        .map((p) => {
          const data: Record<string, unknown> = {};
          const fields = ['name', 'description', 'price', 'comparePrice', 'sku', 'categoryId', 'stock', 'status', 'badge', 'rating', 'reviewCount'] as const;
          for (const field of fields) {
            if (p[field] !== undefined) data[field] = p[field];
          }
          for (const arrField of ['images', 'colors', 'colorNames', 'sizes'] as const) {
            if (p[arrField] !== undefined) {
              data[arrField] = p[arrField];
            }
          }
          return { id: p.id as string, data };
        });
      const updated = await this.productRepo.batchUpdate(items);
      return { products: updated, count: updated.length };
    }

    if (action === 'delete') {
      const ids = products.filter((p) => p.id).map((p) => p.id as string);
      // Batch soft delete — marks all as isDeleted: true
      const deleted = await this.productRepo.batchSoftDelete(ids);
      return { products: deleted, count: deleted.length };
    }

    throw new Error('Invalid action');
  }

  private buildProductData(product: Record<string, unknown>): Record<string, unknown> {
    const data: Record<string, unknown> = {
      name: product.name as string,
      description: product.description as string,
      price: product.price as number,
      sku: product.sku as string,
    };
    if (product.comparePrice !== undefined) data.comparePrice = product.comparePrice;
    if (product.categoryId !== undefined) data.categoryId = product.categoryId;
    for (const arrField of ['images', 'colors', 'colorNames', 'sizes'] as const) {
      if (product[arrField] !== undefined) {
        data[arrField] = product[arrField];
      }
    }
    if (product.stock !== undefined) data.stock = product.stock;
    if (product.status !== undefined) data.status = product.status;
    if (product.badge !== undefined) data.badge = product.badge;
    if (product.rating !== undefined) data.rating = product.rating;
    if (product.reviewCount !== undefined) data.reviewCount = product.reviewCount;
    return data;
  }
}