import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ReviewRepository extends BaseRepository {
  findByProduct(productId: string) {
    return this.db.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findUserReview(userId: string, productId: string) {
    return this.db.review.findFirst({
      where: { userId, productId },
    });
  }

  create(data: { userId: string; productId: string; rating: number; text?: string }) {
    return this.db.review.create({
      data,
      include: { user: { select: { id: true, name: true } } },
    });
  }

  getProductStats(tx: Prisma.TransactionClient, productId: string) {
    return tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
  }
}