import { NextRequest } from 'next/server';
import { authenticateRequest, requireAdmin } from '@/lib/auth-helpers';
import { productService } from '@/services';
import { successResponse, errorResponse, withCacheHeaders } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { validateBody, createProductSchema } from '@/shared/validators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const payload = await authenticateRequest(request);

    const result = await productService.getList({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      badge: searchParams.get('badge') || undefined,
      status: searchParams.get('status') || undefined,
      limit: parseInt(searchParams.get('limit') || '20', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
      sort: searchParams.get('sort') || undefined,
      isAdmin: payload?.role === 'admin',
    });

    const response = successResponse(result);
    return withCacheHeaders(response, 60);
  } catch (error: unknown) {
    console.error('GET /api/products error:', error);
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const validation = validateBody(createProductSchema, body);
    if (!validation.success) {
      return errorResponse(validation.errors.join(', '), 400);
    }
    const result = await productService.createProduct(validation.data as Record<string, unknown>);
    return successResponse(result, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/products error:', error);
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}