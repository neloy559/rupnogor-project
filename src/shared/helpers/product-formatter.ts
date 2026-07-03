import { parseJsonField } from './json-field';

/**
 * Takes a raw product row (from any DB) and ensures JSON fields are arrays.
 * For MongoDB these are already arrays, but this provides backward compatibility
 * for any edge case where they come as strings.
 * Also flattens categoryRef.name into a top-level `category` field for convenience.
 */
export function formatProduct(row: Record<string, unknown>) {
  const categoryRef = row.categoryRef as { name?: string } | null | undefined;
  return {
    ...row,
    category: categoryRef?.name || '',
    images: parseJsonField<string[]>(row.images, []),
    colors: parseJsonField<string[]>(row.colors, []),
    colorNames: parseJsonField<string[]>(row.colorNames, []),
    sizes: parseJsonField<string[]>(row.sizes, []),
  };
}