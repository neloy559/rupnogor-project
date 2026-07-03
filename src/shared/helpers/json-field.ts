/**
 * Safely parse a JSON field from the database (stored as a string).
 * Returns the fallback if the value is not a valid JSON string.
 */
export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return value as T;
  }
  return fallback;
}