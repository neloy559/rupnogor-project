import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { wishlistService } from '@/services';
import { successResponse, errorResponse, noCacheResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { wishlistItemSchema, validateBody } from '@/shared/validators';

/** GET — return user's wishlist items with product info */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const items = await wishlistService.getWishlist(payload.userId);
    return successResponse({ items }, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

/** POST — add product to wishlist (ignore if already exists) */
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const raw = await request.json();
    const parsed = validateBody(wishlistItemSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const item = await wishlistService.addToWishlist(payload.userId, parsed.data.productId);
    return successResponse(item, { status: 201, headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

/** DELETE — remove product from wishlist */
export async function DELETE(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const raw = await request.json();
    const parsed = validateBody(wishlistItemSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const result = await wishlistService.removeFromWishlist(payload.userId, parsed.data.productId);
    return successResponse(result, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}