import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { cartService } from '@/services';
import { successResponse, errorResponse, noCacheResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { updateCartSchema, validateBody } from '@/shared/validators';

/** PUT — update cart item quantity; remove the item if quantity <= 0 */
export async function PUT(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const raw = await request.json();
    const parsed = validateBody(updateCartSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const result = await cartService.updateQuantity(
      payload.userId,
      parsed.data.productId,
      parsed.data.quantity,
    );
    return successResponse(result, { headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}