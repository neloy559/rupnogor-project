# RupNogor — Bangladeshi Fashion E-Commerce

A premium fashion e-commerce platform for the RupNogor brand — sarees, fusion wear, handcrafted jewelry, and accessories. Built with Next.js 16 App Router, MongoDB Atlas, and Supabase Auth. Responsive Material Design 3-inspired UI for both mobile and desktop.

---

## Tech Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| Framework    | Next.js 16 (App Router, Turbopack, TypeScript)  |
| Styling      | Tailwind CSS 4 + custom MD3 color tokens         |
| State        | Zustand 5 (`useAuth`, `useCart`)                |
| Database     | MongoDB Atlas via Prisma 6 (11 models)           |
| Auth         | Supabase Auth (primary) + JWT via `jose` (fallback) |
| Validation   | Zod 4                                            |
| Architecture | Repository → Service → API Route (OOP)           |
| Icons        | lucide-react                                     |
| Caching      | `Cache-Control` headers on API routes + assets   |
| Deployment   | Vercel (frontend + API) + MongoDB Atlas           |

---

## Features

**Customer**
- Browse products by category, filter by badge (Trending, New, Sale)
- **Search** — Real-time product search from navbar or dedicated search page
- Product detail with color/size variant selection
- Persistent cart (server-side, DB-backed)
- Wishlist (requires auth)
- Checkout with saved address selection
- Order history and tracking

**Admin** (`/admin/*`)
- Product management (create, edit, delete with **soft delete** — data preserved)
- Order management with status updates
- Homepage banner management

---

## Architecture

### Layered Backend

```
API Route (thin handler)
  → Service (business logic, OOP class)
  → Repository (data access, OOP class)
  → Prisma
  → MongoDB Atlas
```

All services and repositories are instantiated as singletons in `src/services/index.ts`.

### Routing

| URL                          | Layout      | Auth Required |
| ---------------------------- | ----------- | ------------- |
| `/`                          | ShopLayout  | No            |
| `/products/:id`              | ShopLayout  | No            |
| `/cart`                      | ShopLayout  | No            |
| `/search`                    | ShopLayout  | No            |
| `/checkout`                  | ShopLayout  | Yes           |
| `/order-success?orderId=xxx` | ShopLayout  | Yes           |
| `/wishlist`                  | ShopLayout  | Yes           |
| `/account`                   | ShopLayout  | Yes           |
| `/account/addresses/new`     | ShopLayout  | Yes           |
| `/auth`                      | AuthLayout  | No            |
| `/admin/products`            | AdminLayout | Admin only    |
| `/admin/orders`              | AdminLayout | Admin only    |
| `/admin/banners`             | AdminLayout | Admin only    |

### Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (shop)/                 # Customer-facing pages
│   ├── auth/                   # Login / Register / Forgot password
│   ├── admin/                  # Admin panel pages
│   └── api/                    # REST API route handlers
├── components/
│   ├── layout/                 # MobileHeader, DesktopNav, BottomTabBar, AdminLayout
│   ├── pages/                  # One component per page (all 'use client')
│   ├── providers/              # AuthProvider
│   └── ui/                     # Skeleton, Toast, Toaster
├── services/                   # Business logic (OOP classes)
├── repositories/               # Data access layer (OOP classes, extend BaseRepository)
├── shared/
│   ├── types/                  # TypeScript interfaces for all entities
│   ├── constants/              # ROUTES, order statuses, product defaults
│   └── helpers/                # api-response.ts, json-field.ts, product-formatter.ts
├── store/                      # Zustand stores (use-auth.ts, use-cart.ts)
├── hooks/                      # use-mobile, use-toast
└── lib/                        # db.ts, auth.ts, auth-helpers.ts, errors.ts, utils.ts

prisma/
├── schema.prisma               # 11 models (MongoDB provider)
└── seed.ts                     # Demo data — admin + customer + 14 products + orders

public/
├── brand-logo.png
├── banner-slide-{1-4}.png
├── lookbook-*.png
└── products/                   # Product images
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (for auth)
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster

### 1. Clone and install

```bash
git clone https://github.com/your-username/rupnogor.git
cd rupnogor
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
# Supabase — from Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# MongoDB Atlas — from Atlas Dashboard → Connect → Drivers
DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rupnogor?retryWrites=true&w=majority

# JWT secret — used as fallback auth (min 32 chars)
JWT_SECRET=your-jwt-secret-minimum-32-characters-long

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

```bash
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema to MongoDB Atlas
npx prisma db seed        # Seed demo data
```

### 4. Run

```bash
npm run dev               # → http://localhost:3000
```

### Demo Credentials

| Role     | Email               | Password    |
| -------- | ------------------- | ----------- |
| Admin    | admin@rupnogor.bd   | admin123    |
| Customer | farhana@example.com | customer123 |

> **Note:** The admin account also needs `role: "admin"` set in Supabase user metadata.
> Go to Supabase Dashboard → Authentication → Users → find the admin user → Edit → add `{ "role": "admin" }` to `app_metadata`.

---

## API Routes

All routes are under `/api/`. Auth-required routes expect a valid Supabase session cookie or `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/auth/login` | None | Login, returns JWT + user |
| POST | `/api/auth/register` | None | Register new account |
| GET | `/api/auth/me` | Required | Fetch authenticated user |
| GET | `/api/products` | Optional | List products (search, category, badge, sort, pagination) |
| GET/PUT/DELETE | `/api/products/[id]` | Admin for mutations | Single product CRUD |
| POST | `/api/products/batch` | Admin | Batch operations |
| GET | `/api/categories` | None | All categories |
| GET/POST/DELETE | `/api/cart` | Required | Cart management |
| PUT | `/api/cart/update` | Required | Update cart item quantity |
| GET/POST | `/api/orders` | Required | List / create orders |
| GET/PATCH | `/api/orders/[id]` | Required | Single order / update status |
| GET/POST/DELETE | `/api/wishlist` | Required | Wishlist management |
| GET | `/api/wishlist/check` | Required | Check if product is wishlisted |
| GET/POST/DELETE | `/api/addresses` | Required | Address management |
| GET/POST/DELETE | `/api/banners` | Admin for mutations | Banner management |
| GET/POST | `/api/reviews` | Auth for POST | Product reviews |
| POST | `/api/newsletter` | None | Newsletter signup |

---

## Key Patterns

### Navigation

```tsx
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';

<Link href={ROUTES.PRODUCT(product.id)}>View Product</Link>
```

### Auth state

```tsx
import { useAuth } from '@/store/use-auth';
const { user, token, logout } = useAuth();
```

### Error handling

```ts
import { AppError } from '@/lib/errors';
throw AppError.notFound('Product not found');
throw AppError.unauthorized('Authentication required');
```

---

## Caching Strategy

| Resource | Cache-Control |
| -------- | ------------- |
| Static images (banner, lookbook, product) | `public, max-age=86400, stale-while-revalidate=604800` |
| Brand logo, `/_next/static/*` | `public, max-age=31536000, immutable` |
| `GET /api/products` | `s-maxage=60, stale-while-revalidate=300` |
| `GET /api/categories` | `s-maxage=3600` |
| Cart / Orders / Wishlist | `private, no-store` |

---

## Build & Deploy

```bash
npm run build   # Runs prisma generate + next build
npm run start   # Production server on port 3000
```

Recommended deployment: **Vercel** (zero-config for Next.js). Set all environment variables in the Vercel project dashboard.

---

## Database Scripts

```bash
npm run db:push       # Push schema changes (no migration history)
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Create a migration (development)
npm run db:reset      # Reset database (destructive — dev only)
```
