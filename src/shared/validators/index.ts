import { z } from 'zod';

// ─── Auth ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  phone: z.string().optional(),
});

// ─── Cart ───────────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive().default(1),
});

export const updateCartSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().min(0, 'quantity must be 0 or greater'),
});

export const removeFromCartSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});

// ─── Order ──────────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  addressId: z.string().min(1, 'Address ID is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(1, 'Status is required'),
});

// ─── Address ────────────────────────────────────────────────────────────────

export const createAddressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  street: z.string().min(1, 'Street is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial().extend({
  id: z.string().min(1, 'Address ID is required'),
});

// ─── Category ───────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// ─── Banner ─────────────────────────────────────────────────────────────────

export const createBannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  link: z.string().optional(),
  image: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const updateBannerSchema = createBannerSchema.partial().extend({
  id: z.string().min(1, 'Banner ID is required'),
});

// ─── Review ─────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  text: z.string().optional(),
});

// ─── Wishlist ───────────────────────────────────────────────────────────────

export const wishlistItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});

// ─── Newsletter ─────────────────────────────────────────────────────────────

export const subscribeSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

// ─── Product Batch ──────────────────────────────────────────────────────────

export const batchOperationSchema = z.object({
  action: z.enum(['create', 'update', 'delete']),
  products: z.array(z.record(z.string(), z.unknown())).min(1, 'Products array is required'),
});

// ─── Product Update ──────────────────────────────────────────────────────────

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  status: z.string().optional(),
  badge: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  colorNames: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
});

// ─── Product Create ──────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  comparePrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().nullable().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  badge: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  colorNames: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
});

// ─── Helper ─────────────────────────────────────────────────────────────────

/**
 * Parse a request body against a Zod schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateBody<T>(schema: z.ZodType<T>, body: unknown):
  | { success: true; data: T }
  | { success: false; errors: string[] } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((issue) => issue.message);
  return { success: false, errors };
}