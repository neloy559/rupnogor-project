import { Prisma } from '@prisma/client';
import { AppError } from '@/lib/errors';
import { OrderRepository } from '@/repositories/order.repository';
import { CartRepository } from '@/repositories/cart.repository';
import { ProductRepository } from '@/repositories/product.repository';
import { AddressRepository } from '@/repositories/address.repository';
import { OrderStatus } from '@prisma/client';
import { VALID_ORDER_STATUSES } from '@/shared/constants/order-statuses';

function generateOrderNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `RL-${num}`;
}

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private cartRepo: CartRepository,
    private productRepo: ProductRepository,
    private addressRepo: AddressRepository,
  ) {}

  async listOrders(userId: string, role: string, statusFilter?: string) {
    if (role === 'admin') {
      return this.orderRepo.findAll(statusFilter);
    }
    return this.orderRepo.findByUser(userId, statusFilter);
  }

  async getOrder(id: string, userId: string, role: string) {
    const order = await this.orderRepo.findById(id);
    if (!order) return null;
    if (role !== 'admin' && order.userId !== userId) return null;
    return order;
  }

  async createOrder(userId: string, items: { productId: string; quantity: number; color?: string; size?: string }[], addressId: string) {
    // Verify address
    const address = await this.addressRepo.findByIdAndUser(addressId, userId);
    if (!address) throw AppError.notFound('Address not found');

    // Validate products and stock
    const productIds = items.map((i) => i.productId);
    const products = await this.productRepo.findManyByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const orderItemsData: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      color?: string;
      size?: string;
      image?: string | null;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw AppError.notFound(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw AppError.badRequest(`Insufficient stock for ${product.name}`);

      // MongoDB stores images as array — take first element
      const images: string[] = Array.isArray(product.images) ? product.images : [];
      orderItemsData.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        image: images[0] || null,
      });
      total += product.price * item.quantity;
    }

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    while (await this.orderRepo.findByOrderNumber(orderNumber)) {
      orderNumber = generateOrderNumber();
    }

    const addressJson = JSON.stringify({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      apartment: address.apartment,
      city: address.city,
      postalCode: address.postalCode,
    });

    // Single transaction: create order + decrement stock + clear cart
    const order = await this.productRepo.getDb().$transaction(async (tx: Prisma.TransactionClient) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          total,
          address: addressJson,
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId, productId: { in: productIds } },
      });

      return newOrder;
    });

    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    if (!VALID_ORDER_STATUSES.includes(status)) {
      throw AppError.badRequest('Invalid status value');
    }
    const order = await this.orderRepo.findById(id);
    if (!order) throw AppError.notFound('Order not found');
    return this.orderRepo.updateStatus(id, status as OrderStatus);
  }
}