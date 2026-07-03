import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { cartService } from '@/services';
import { successResponse, errorResponse, noCacheResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { addToCartSchema, removeFromCartSchema, validateBody } from '@/shared/validators';

/** GET — return user's cart items with product info, cartCount, cartTotal */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const result = await cartService.getCart(payload.userId);
    return successResponse(result, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

/** POST — add item to cart or increment quantity if already exists */
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const raw = await request.json();
    const parsed = validateBody(addToCartSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const item = await cartService.addToCart(payload.userId, parsed.data.productId, parsed.data.quantity);
    return successResponse(item, { status: 201, headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

/** DELETE — remove an item from the cart */
export async function DELETE(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const raw = await request.json();
    const parsed = validateBody(removeFromCartSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const result = await cartService.removeFromCart(payload.userId, parsed.data.productId);
    return successResponse(result, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}