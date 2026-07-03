import { Prisma, OrderStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class OrderRepository extends BaseRepository {
  findById(id: string) {
    return this.db.order.findUnique({
      where: { id },
      include: { orderItems: true, user: { select: { id: true, name: true, email: true } } },
    });
  }

  findByUser(userId: string, statusFilter?: string) {
    const where: Record<string, unknown> = { userId };
    if (statusFilter) where.status = statusFilter;
    return this.db.order.findMany({
      where,
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(statusFilter?: string) {
    const where: Record<string, unknown> = {};
    if (statusFilter) where.status = statusFilter;
    return this.db.order.findMany({
      where,
      include: { orderItems: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByOrderNumber(orderNumber: string) {
    return this.db.order.findUnique({ where: { orderNumber } });
  }

  createWithItems(tx: Prisma.TransactionClient, data: {
    orderNumber: string;
    userId: string;
    total: number;
    address: string;
    orderItemsData: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      color?: string;
      size?: string;
      image?: string | null;
    }[];
  }) {
    return tx.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        total: data.total,
        address: data.address,
        orderItems: { create: data.orderItemsData },
      },
      include: { orderItems: true },
    });
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.db.order.update({
      where: { id },
      data: { status },
      include: { orderItems: true },
    });
  }
}