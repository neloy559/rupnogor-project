import { NextResponse } from 'next/server';

/**
 * Return a successful JSON response.
 */
export function successResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/**
 * Return an error JSON response.
 */
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Add s-maxage / stale-while-revalidate cache headers to a response.
 */
export function withCacheHeaders(response: NextResponse, maxAge: number, swr?: number) {
  const swrVal = swr ?? Math.round(maxAge * 5);
  response.headers.set('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=${swrVal}`);
  return response;
}

/**
 * Return a no-cache response for private / dynamic data.
 */
export function noCacheResponse() {
  return new Headers({
    'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  });
}