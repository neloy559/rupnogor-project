import { NextRequest } from 'next/server';
import { authenticateRequest, requireAdmin } from '@/lib/auth-helpers';
import { bannerService } from '@/services';
import { successResponse, errorResponse } from '@/shared/helpers/api-response';
import { getErrorDetails } from '@/lib/errors';
import { createBannerSchema, updateBannerSchema, validateBody } from '@/shared/validators';

// GET /api/banners — active public banners (or all if admin)
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    if (payload && payload.role === 'admin') {
      const banners = await bannerService.getAllBanners();
      return successResponse(banners);
    }

    const banners = await bannerService.getPublicBanners();
    return successResponse(banners);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

// POST /api/banners — admin: create banner
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const raw = await request.json();
    const parsed = validateBody(createBannerSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const banner = await bannerService.create(parsed.data);
    return successResponse(banner, { status: 201 });
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

// PUT /api/banners — admin: update banner
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);

    const raw = await request.json();
    const parsed = validateBody(updateBannerSchema, raw);
    if (!parsed.success) {
      return errorResponse(parsed.errors.join(', '), 400);
    }

    const { id, ...fields } = parsed.data;
    const banner = await bannerService.update(id, fields);
    return successResponse(banner);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}

// DELETE /api/banners?id= — admin: delete banner
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Banner ID is required', 400);
    }

    const result = await bannerService.delete(id);
    return successResponse(result);
  } catch (error: unknown) {
    const { message, statusCode } = getErrorDetails(error);
    return errorResponse(message, statusCode);
  }
}