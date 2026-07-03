import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { productService } from '@/services';
import { successResponse, errorResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { batchOperationSchema, validateBody } from '@/shared/validators';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const raw = await request.json();

    const parsed = validateBody(batchOperationSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const result = await productService.batchOperation(parsed.data.action, parsed.data.products);
    return successResponse(result);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}