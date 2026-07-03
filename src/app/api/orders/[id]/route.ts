import { NextRequest } from 'next/server';
import { authenticateRequest, requireAdmin } from '@/lib/auth-helpers';
import { orderService } from '@/services';
import { successResponse, errorResponse, noCacheResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { updateOrderStatusSchema, validateBody } from '@/shared/validators';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id] — get single order with items
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const { id } = await params;
    const order = await orderService.getOrder(id, payload.userId, payload.role);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return successResponse(order, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

// PUT /api/orders/[id] — admin: update order status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const raw = await request.json();
    const parsed = validateBody(updateOrderStatusSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const order = await orderService.updateOrderStatus(id, parsed.data.status);
    return successResponse(order, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}