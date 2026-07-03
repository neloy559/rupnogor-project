import { BaseRepository } from './base.repository';

export class CartRepository extends BaseRepository {
  findUserCart(userId: string) {
    return this.db.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findItem(userId: string, productId: string) {
    return this.db.cartItem.findFirst({
      where: { userId, productId },
    });
  }

  addItem(userId: string, productId: string, quantity: number) {
    return this.db.cartItem.create({
      data: { userId, productId, quantity },
      include: { product: true },
    });
  }

  updateQuantity(id: string, quantity: number) {
    return this.db.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });
  }

  deleteItem(id: string) {
    return this.db.cartItem.delete({ where: { id } });
  }

  deleteByUserAndProducts(userId: string, productIds: string[]) {
    return this.db.cartItem.deleteMany({
      where: { userId, productId: { in: productIds } },
    });
  }
}