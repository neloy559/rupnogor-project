import { NextRequest } from 'next/server';
import { authenticateRequest, requireAdmin } from '@/lib/auth-helpers';
import { productService } from '@/services';
import { successResponse, errorResponse, withCacheHeaders } from '@/shared/helpers/api-response';
import { AppError, getErrorDetails } from '@/lib/errors';
import { validateBody, updateProductSchema } from '@/shared/validators';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await productService.getDetail(id);
    if (!result) {
      return errorResponse('Product not found', 404);
    }
    const response = successResponse(result);
    return withCacheHeaders(response, 300);
  } catch (error: unknown) {
    console.error('GET /api/products/[id] error:', error);
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const validation = validateBody(updateProductSchema, body);
    if (!validation.success) {
      return errorResponse(validation.errors.join(', '), 400);
    }
    const result = await productService.updateProduct(id, validation.data);
    if (!result) {
      return errorResponse('Product not found', 404);
    }
    return successResponse(result);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await productService.deleteProduct(id);
    if (!result) {
      return errorResponse('Product not found', 404);
    }
    return successResponse(result);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}