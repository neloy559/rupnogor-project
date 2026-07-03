import { WishlistRepository } from '@/repositories/wishlist.repository';

export class WishlistService {
  constructor(private wishlistRepo: WishlistRepository) {}

  async getWishlist(userId: string) {
    return this.wishlistRepo.findUserWishlist(userId);
  }

  async addToWishlist(userId: string, productId: string) {
    const existing = await this.wishlistRepo.findItem(userId, productId);
    if (existing) {
      return this.wishlistRepo.findById(existing.id);
    }
    return this.wishlistRepo.addItem(userId, productId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const existing = await this.wishlistRepo.findItem(userId, productId);
    if (!existing) throw new Error('Item not found in wishlist');
    await this.wishlistRepo.deleteItem(existing.id);
    return { success: true };
  }

  async checkWishlist(userId: string, productId: string) {
    const existing = await this.wishlistRepo.findItem(userId, productId);
    return { wishlisted: !!existing };
  }
}