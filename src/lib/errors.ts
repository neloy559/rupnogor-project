/**
 * Application-level error with HTTP status code.
 * All service/repository/business-logic errors should throw AppError
 * so that route handlers can extract a safe status + message.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /** Convenience factory methods */
  static badRequest(message = 'Bad request'): AppError {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Access denied'): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict'): AppError {
    return new AppError(message, 409);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500);
  }
}

/** Type guard to check if an unknown value is an AppError */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extract a safe { message, statusCode } from any thrown value.
 * Used in route catch blocks to build consistent error responses.
 */
export function getErrorDetails(error: unknown): { message: string; statusCode: number } {
  if (isAppError(error)) {
    return { message: error.message, statusCode: error.statusCode };
  }

  // Prisma unique constraint violation (P2002)
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  ) {
    return { message: 'A record with this value already exists', statusCode: 409 };
  }

  // Prisma not found (P2025)
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  ) {
    return { message: 'Record not found', statusCode: 404 };
  }

  // Plain Error with a `.status` property (legacy pattern from requireAdmin)
  if (error instanceof Error && 'status' in error) {
    const status = (error as Error & { status: number }).status;
    if (typeof status === 'number' && status >= 400 && status < 600) {
      return { message: error.message, statusCode: status };
    }
  }

  // Standard Error
  if (error instanceof Error) {
    // Don't leak internal error details to the client
    return { message: 'Internal server error', statusCode: 500 };
  }

  // Unknown type
  return { message: 'Internal server error', statusCode: 500 };
}