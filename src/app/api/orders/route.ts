import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { orderService } from '@/services';
import { successResponse, errorResponse, noCacheResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { createOrderSchema, validateBody } from '@/shared/validators';

// GET /api/orders — list orders (user's own, or all if admin)
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || undefined;

    const orders = await orderService.listOrders(payload.userId, payload.role, statusFilter);
    return successResponse(orders, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

// POST /api/orders — create order from cart items
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const raw = await request.json();
    const parsed = validateBody(createOrderSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const order = await orderService.createOrder(
      payload.userId,
      parsed.data.items,
      parsed.data.addressId,
    );
    return successResponse(order, { status: 201, headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}