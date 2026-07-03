import { BaseRepository } from './base.repository';

export class WishlistRepository extends BaseRepository {
  findUserWishlist(userId: string) {
    return this.db.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findItem(userId: string, productId: string) {
    return this.db.wishlistItem.findFirst({
      where: { userId, productId },
    });
  }

  addItem(userId: string, productId: string) {
    return this.db.wishlistItem.create({
      data: { userId, productId },
      include: { product: true },
    });
  }

  deleteItem(id: string) {
    return this.db.wishlistItem.delete({ where: { id } });
  }

  findById(id: string) {
    return this.db.wishlistItem.findUnique({
      where: { id },
      include: { product: true },
    });
  }
}