import { NextRequest } from 'next/server';
import { authService } from '@/services';
import { successResponse, errorResponse, noCacheResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { registerSchema, validateBody } from '@/shared/validators';

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = validateBody(registerSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const result = await authService.register(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name,
      parsed.data.phone,
    );
    return successResponse(result, { status: 201, headers: noCacheResponse() });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}