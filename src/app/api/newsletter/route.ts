import { NextRequest } from 'next/server';
import { newsletterService } from '@/services';
import { successResponse, errorResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { subscribeSchema, validateBody } from '@/shared/validators';

// POST /api/newsletter — subscribe email (public)
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = validateBody(subscribeSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const result = await newsletterService.subscribe(parsed.data.email);
    return successResponse(result);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}