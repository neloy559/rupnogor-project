import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { reviewService } from '@/services';
import { successResponse, errorResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { createReviewSchema, validateBody } from '@/shared/validators';

// GET /api/reviews?productId= — get reviews for a product (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    const reviews = await reviewService.getByProduct(productId);
    return successResponse(reviews);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

// POST /api/reviews — create review and update product rating
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const raw = await request.json();
    const parsed = validateBody(createReviewSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const review = await reviewService.createReview(payload.userId, parsed.data);
    return successResponse(review, { status: 201 });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}