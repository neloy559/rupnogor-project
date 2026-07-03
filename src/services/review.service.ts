import { Prisma } from '@prisma/client';
import { AppError } from '@/lib/errors';
import { ReviewRepository } from '@/repositories/review.repository';

export class ReviewService {
  constructor(private reviewRepo: ReviewRepository) {}

  async getByProduct(productId: string) {
    return this.reviewRepo.findByProduct(productId);
  }

  async createReview(userId: string, data: { productId: string; rating: number; text?: string }) {
    const { productId, rating, text } = data;
    if (!productId) throw AppError.badRequest('Product ID is required');
    if (!rating || rating < 1 || rating > 5) throw AppError.badRequest('Rating is required and must be between 1 and 5');

    // Check duplicate
    const existing = await this.reviewRepo.findUserReview(userId, productId);
    if (existing) throw AppError.conflict('You have already reviewed this product');

    return this.reviewRepo.getDb().$transaction(async (tx: Prisma.TransactionClient) => {
      const review = await tx.review.create({
        data: { userId, productId, rating, text },
        include: { user: { select: { id: true, name: true } } },
      });

      const stats = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: Math.round((stats._avg.rating ?? 0) * 100) / 100,
          reviewCount: stats._count.rating,
        },
      });

      return review;
    });
  }
}