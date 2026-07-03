import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { categoryService } from '@/services';
import { successResponse, errorResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { createCategorySchema, validateBody } from '@/shared/validators';

// GET /api/categories — list all categories (public)
export async function GET() {
  try {
    const categories = await categoryService.getAll();
    return successResponse(categories);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

// POST /api/categories — admin: create category
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const raw = await request.json();
    const parsed = validateBody(createCategorySchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const category = await categoryService.create(parsed.data);
    return successResponse(category, { status: 201 });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}