'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/store/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Pencil, Trash2, Plus, ChevronLeft, ChevronRight,
  Package, Loader2, X, Save
} from 'lucide-react';

const PAGE_SIZE = 4;
const CATEGORY_FILTERS = ['All', 'Clothing', 'Jewelry', 'Bags', 'Beauty'];
const STATUS_OPTIONS = ['active', 'draft', 'archived'] as const;
const BADGE_OPTIONS = ['', 'New', 'Trending', 'Sale', 'Limited'];
const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

type ProductStatus = 'active' | 'draft' | 'archived';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  price: number;
  comparePrice?: number | null;
  description: string;
  stock: number;
  status: ProductStatus;
  badge?: string | null;
  images: string[];
  colors: string[];
  colorNames: string[];
  sizes: string[];
}

interface FormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  sku: string;
  stock: string;
  status: ProductStatus;
  badge: string;
  images: string;
  colors: string;
  colorNames: string;
  sizes: string[];
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  sku: '',
  stock: '0',
  status: 'active',
  badge: '',
  images: '',
  colors: '',
  colorNames: '',
  sizes: [],
};

function productToForm(p: Product): FormData {
  return {
    name: p.name,
    description: p.description,
    price: String(p.price),
    comparePrice: p.comparePrice ? String(p.comparePrice) : '',
    sku: p.sku,
    stock: String(p.stock),
    status: p.status,
    badge: p.badge || '',
    images: p.images.join(', '),
    colors: p.colors.join(', '),
    colorNames: p.colorNames.join(', '),
    sizes: p.sizes,
  };
}

function getStockInfo(stock: number) {
  if (stock === 0) return { label: 'Out of Stock', color: 'bg-rl-error-container text-rl-on-error-container' };
  if (stock <= 3) return { label: `Low Stock (${stock})`, color: 'bg-rl-tertiary-fixed text-rl-on-tertiary-fixed-variant' };
  return { label: 'In Stock', color: 'bg-rl-secondary-container text-rl-on-secondary-container' };
}

// ─── Product Form Drawer ──────────────────────────────────────────────────────

interface ProductFormProps {
  open: boolean;
  editProduct: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProductFormDrawer({ open, editProduct, onClose, onSaved }: ProductFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = !!editProduct;

  useEffect(() => {
    if (open) {
      setForm(editProduct ? productToForm(editProduct) : EMPTY_FORM);
    }
  }, [open, editProduct]);

  const set = (field: keyof FormData, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const headers = { ...useAuth.getState().getAuthHeaders(), 'Content-Type': 'application/json' };
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        sku: form.sku.trim(),
        stock: parseInt(form.stock, 10),
        status: form.status,
        badge: form.badge || null,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
        colorNames: form.colorNames.split(',').map((s) => s.trim()).filter(Boolean),
        sizes: form.sizes,
      };

      const url = isEdit ? `/api/products/${editProduct!.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save product');
      }
      toast({ title: isEdit ? 'Product Updated' : 'Product Created', description: `"${form.name}" has been saved.` });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Product' : 'Add New Product'}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-rl-surface z-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rl-outline-variant/50 shrink-0">
          <h2 className="text-lg font-bold text-rl-on-surface">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-rl-surface-container-high transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-rl-on-surface-variant" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="pf-name" className="text-sm font-medium text-rl-on-surface">Product Name <span className="text-rl-error">*</span></label>
            <input id="pf-name" type="text" required value={form.name} onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
              placeholder="e.g. Pure Muslin Saree"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="pf-desc" className="text-sm font-medium text-rl-on-surface">Description <span className="text-rl-error">*</span></label>
            <textarea id="pf-desc" required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-rl-primary/50 resize-none"
              placeholder="Brief product description…"
            />
          </div>

          {/* Price + Compare Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pf-price" className="text-sm font-medium text-rl-on-surface">Price (৳) <span className="text-rl-error">*</span></label>
              <input id="pf-price" type="number" required min={1} step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
                placeholder="1200"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pf-compare" className="text-sm font-medium text-rl-on-surface">Compare Price (৳)</label>
              <input id="pf-compare" type="number" min={1} step="0.01" value={form.comparePrice} onChange={(e) => set('comparePrice', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
                placeholder="1500"
              />
            </div>
          </div>

          {/* SKU + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pf-sku" className="text-sm font-medium text-rl-on-surface">SKU <span className="text-rl-error">*</span></label>
              <input id="pf-sku" type="text" required value={form.sku} onChange={(e) => set('sku', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
                placeholder="RN-SAR-001"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pf-stock" className="text-sm font-medium text-rl-on-surface">Stock</label>
              <input id="pf-stock" type="number" min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
              />
            </div>
          </div>

          {/* Status + Badge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pf-status" className="text-sm font-medium text-rl-on-surface">Status</label>
              <select id="pf-status" value={form.status} onChange={(e) => set('status', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pf-badge" className="text-sm font-medium text-rl-on-surface">Badge</label>
              <select id="pf-badge" value={form.badge} onChange={(e) => set('badge', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b || '— None —'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-rl-on-surface">Sizes</p>
            <div className="flex flex-wrap gap-2">
              {SIZE_PRESETS.map((size) => (
                <button type="button" key={size} onClick={() => toggleSize(size)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-rl-primary text-rl-on-primary border-rl-primary'
                      : 'border-rl-outline-variant text-rl-on-surface-variant hover:bg-rl-surface-container-high'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Image URLs */}
          <div className="space-y-1.5">
            <label htmlFor="pf-images" className="text-sm font-medium text-rl-on-surface">Image URLs</label>
            <textarea id="pf-images" rows={2} value={form.images} onChange={(e) => set('images', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-rl-primary/50 resize-none"
              placeholder="/products/product-saree-muslin.png, /products/product-saree-rose.png"
            />
            <p className="text-xs text-rl-on-surface-variant">Comma-separated URLs or /public paths</p>
          </div>

          {/* Colors */}
          <div className="space-y-1.5">
            <label htmlFor="pf-colors" className="text-sm font-medium text-rl-on-surface">Color Hex Codes</label>
            <input id="pf-colors" type="text" value={form.colors} onChange={(e) => set('colors', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
              placeholder="#E8C4A0, #D4A0A0"
            />
          </div>

          {/* Color Names */}
          <div className="space-y-1.5">
            <label htmlFor="pf-colornames" className="text-sm font-medium text-rl-on-surface">Color Names</label>
            <input id="pf-colornames" type="text" value={form.colorNames} onChange={(e) => set('colorNames', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-rl-surface-container-high border border-rl-outline-variant/50 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-rl-primary/50"
              placeholder="Ivory, Rose"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-rl-outline-variant/50 flex items-center justify-end gap-3 shrink-0 bg-rl-surface">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-rl-on-surface-variant hover:bg-rl-surface-container-high transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button type="submit" form="product-form" disabled={saving}
            className="bg-rl-primary text-rl-on-primary px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-rl-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminProductsPage() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const headers = useAuth.getState().getAuthHeaders();
      const params = new URLSearchParams();
      params.set('status', 'all');
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String((currentPage - 1) * PAGE_SIZE));
      if (activeFilter !== 'All') params.set('category', activeFilter);
      const res = await fetch(`/api/products?${params.toString()}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilter, toast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const headers = useAuth.getState().getAuthHeaders();
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Deleted', description: 'Product has been removed.' });
      fetchProducts();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => { setEditProduct(null); setDrawerOpen(true); };
  const openEdit = (product: Product) => { setEditProduct(product); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditProduct(null); };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-rl-on-surface">Product Management</h1>
        <button onClick={openCreate} className="bg-rl-primary text-rl-on-primary px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-rl-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {CATEGORY_FILTERS.map((filter) => (
          <button key={filter} onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-rl-primary text-rl-on-primary'
                : 'bg-rl-surface-container-high text-rl-on-surface-variant hover:bg-rl-surface-container-highest'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-rl-primary animate-spin" />
            <span className="ml-2 text-sm text-rl-on-surface-variant">Loading products…</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Package className="w-10 h-10 text-rl-on-surface-variant/40 mb-3" />
            <p className="text-sm text-rl-on-surface-variant">No products found</p>
            <button onClick={openCreate} className="mt-4 text-sm text-rl-primary font-medium hover:underline">
              Add your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-rl-outline-variant/50">
                  <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 sm:px-6 py-3">Image</th>
                  <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 py-3">Product Name</th>
                  <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 py-3 hidden md:table-cell">Stock Status</th>
                  <th className="text-right text-xs font-semibold text-rl-on-surface-variant px-4 sm:px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockInfo = getStockInfo(product.stock);
                  return (
                    <tr key={product.id} className="border-b border-rl-outline-variant/30 last:border-0 hover:bg-rl-surface-container-low/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-50 overflow-hidden">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-rl-on-surface">{product.name}</p>
                        <p className="text-xs text-rl-on-surface-variant">SKU: {product.sku}</p>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-sm text-rl-on-surface-variant">{product.category || '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-rl-on-surface">৳ {product.price.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${stockInfo.color}`}>
                          {stockInfo.label}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(product)} className="p-2 rounded-lg hover:bg-rl-surface-container-high transition-colors" aria-label={`Edit ${product.name}`}>
                            <Pencil className="w-4 h-4 text-rl-on-surface-variant" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                            className="p-2 rounded-lg hover:bg-rl-error-container hover:text-rl-on-error-container transition-colors disabled:opacity-50"
                            aria-label={`Delete ${product.name}`}
                          >
                            {deleting === product.id
                              ? <Loader2 className="w-4 h-4 text-rl-on-surface-variant animate-spin" />
                              : <Trash2 className="w-4 h-4 text-rl-on-surface-variant" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-rl-outline-variant/50">
          <p className="text-xs text-rl-on-surface-variant">
            {total > 0 ? `Showing ${showingFrom}–${showingTo} of ${total} products` : 'No products'}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rl-surface-container-high transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-rl-on-surface-variant" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) { pageNum = i + 1; }
              else if (currentPage <= 3) { pageNum = i + 1; }
              else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
              else { pageNum = currentPage - 2 + i; }
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                    currentPage === pageNum
                      ? 'bg-rl-primary text-rl-on-primary'
                      : 'text-rl-on-surface-variant hover:bg-rl-surface-container-high'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rl-surface-container-high transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-rl-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      {/* FAB for mobile */}
      <button onClick={openCreate} aria-label="Add new product"
        className="fixed bottom-6 right-6 w-14 h-14 bg-rl-primary text-rl-on-primary rounded-full shadow-xl flex items-center justify-center hover:bg-rl-primary/90 active:scale-95 transition-all z-30 group"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Product form drawer */}
      <ProductFormDrawer
        open={drawerOpen}
        editProduct={editProduct}
        onClose={closeDrawer}
        onSaved={fetchProducts}
      />
    </div>
  );
}
