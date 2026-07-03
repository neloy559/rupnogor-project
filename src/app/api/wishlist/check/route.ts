import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { wishlistService } from '@/services';
import { successResponse, errorResponse, noCacheResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';

/** GET — check whether a product is in the user's wishlist */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return errorResponse('productId query parameter is required', 400);
    }

    const result = await wishlistService.checkWishlist(payload.userId, productId);
    return successResponse(result, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}