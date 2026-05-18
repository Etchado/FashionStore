# Fashion Store — Technical Documentation

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication](#authentication)
3. [Database Schema](#database-schema)
4. [State Management](#state-management)
5. [Pages](#pages)
6. [Components](#components)
7. [Routing](#routing)
8. [Internationalization](#internationalization)
9. [Currency System](#currency-system)
10. [Loyalty Points System](#loyalty-points-system)
11. [Admin Access](#admin-access)
12. [Row Level Security](#row-level-security)

---

## Architecture Overview

The application is a single-page React app (SPA) with Supabase as its entire backend — database, authentication, and row-level security (RLS) policies.

```
Browser
  └── React SPA (Vite)
        ├── React Router — client-side routing
        ├── Context API — global state (auth, cart, wishlist, etc.)
        └── Supabase JS Client
              ├── Auth — session management
              └── Database — PostgreSQL via REST API
```

On startup, `ProductsContext` attempts to fetch products from Supabase. If the DB is unreachable or empty, it falls back to the local `src/data/products.js` dataset silently — the user sees no error.

All pages are lazy-loaded via `React.lazy` and wrapped in `Suspense` with a spinner fallback, keeping the initial bundle small.

---

## Authentication

**File:** `src/context/AuthContext.jsx`

Uses Supabase Auth. On mount, the context calls `supabase.auth.getSession()` to restore an existing session, then subscribes to `onAuthStateChange` to keep the `user` state in sync across tabs.

| Method | Description |
|---|---|
| `signIn(email, password)` | Email/password sign in |
| `signUp(email, password)` | Email/password registration |
| `signInWithGoogle()` | OAuth via Google |
| `signOut()` | Clears session |
| `isAdmin` | `true` if `user.email === VITE_ADMIN_EMAIL` |

When a new user signs up, the Supabase trigger `on_auth_user_created` automatically inserts a row into `public.profiles`.

**Auth modal** (`src/components/auth/AuthModal.jsx`) handles both sign-in and sign-up modes, with Zod validation and error messages surfaced per field.

---

## Database Schema

**File:** `supabase/schema.sql`

### products
| Column | Type | Notes |
|---|---|---|
| id | text | Primary key (e.g. `p1`, `w1`, `a1`) |
| name | text | |
| brand | text | |
| category | text | `perfumes`, `watches`, `accessories` |
| price | numeric | |
| original_price | numeric | Nullable — shows discount if set |
| rating | numeric | Auto-updated by trigger |
| review_count | int | Auto-updated by trigger |
| badges | text[] | e.g. `{BESTSELLER, NEW}` |
| in_stock | boolean | |
| stock_count | int | |
| image | text | Primary image URL |
| images | text[] | Gallery image URLs |
| description | text | |
| notes | text | Scent notes (perfumes) |
| specs | jsonb | Key-value spec sheet |
| sku | text | |

### product_variants
Each product can have multiple size/color variants with individual pricing and stock.

### profiles
Auto-created on signup via a PostgreSQL trigger. Stores `email` and `full_name`.

### orders
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | Nullable (guest checkout) |
| order_number | text | e.g. `AU-123456` |
| status | text | `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled` |
| total | numeric | |
| shipping_info | jsonb | Full shipping address |

### order_items
Line items linked to an order. Stores a snapshot of product name, variant, price, and quantity at time of purchase.

### wishlists
Composite primary key `(user_id, product_id)` — one row per saved product per user.

### reviews
Star rating (1–5) and optional comment per product per user. Inserting or deleting a review fires the `review_rating_update` trigger, which recalculates the product's `rating` and `review_count`.

### loyalty_points
One row per user storing their current points balance.

### loyalty_history
Append-only log of every points transaction with a `reason` string (e.g. `"Order AU-123456"`).

### stock_notifications
Stores email addresses to notify when a product comes back in stock. Unique on `(product_id, email)`.

---

## State Management

All global state is managed via React Context. There is no Redux or Zustand.

### CartContext
**File:** `src/context/CartContext.jsx`

- Persists to `localStorage` automatically on every change
- `addItem(product, variant, qty)` — adds or increments an item
- `removeItem(key)` — removes by composite key `productId-variantId`
- `updateQty(key, qty)` — updates quantity, removes if qty < 1
- `clearCart()` — empties the cart (called after successful checkout)
- Exposes `count`, `subtotal`, `open`, `setOpen`

### WishlistContext
**File:** `src/context/WishlistContext.jsx`

- Guest users: stored in `localStorage`
- Logged-in users: synced to `wishlists` table in Supabase
- On login, local wishlist is merged with DB wishlist and re-uploaded
- `toggle(productId)` — adds or removes, updates DB if authenticated

### ProductsContext
**File:** `src/context/ProductsContext.jsx`

- On mount, fetches from `products` table joined with `product_variants`
- Maps snake_case DB fields to camelCase for consistency across components
- Falls back to `LOCAL_PRODUCTS` from `src/data/products.js` if DB is empty or fails
- Exposes `getProduct(id)` and `getByCategory(category)`

### CompareContext
**File:** `src/context/CompareContext.jsx`

- Holds up to 3 products for side-by-side comparison
- `toggle(product)` — adds or removes from compare list
- `isComparing(id)` — returns boolean

### CurrencyContext
**File:** `src/context/CurrencyContext.jsx`

- Active currency stored in `localStorage`
- `format(amount)` — formats a USD base price to the active currency using fixed rates

### ThemeContext
**File:** `src/context/ThemeContext.jsx`

- Toggles `dark` class on `<html>` element
- Persisted in `localStorage`

---

## Pages

### Home (`/`)
Hero section with an auto-cycling split layout (dark panel + product image slides). Below the hero: featured products grid, brands marquee, heritage editorial section, VIP inner circle CTA, and newsletter signup.

### Shop (`/shop`)
Full product catalog. Supports:
- Category filter (perfumes, watches, accessories)
- Brand filter (multi-select)
- Price range slider
- Sort by: price, rating, newest
- Search with debounce
- Quick view modal on hover

### Product Detail (`/product/:id`)
- Image gallery with thumbnail navigation
- Variant selector (size/color)
- Quantity picker
- Add to cart, wishlist, compare, share
- Scent notes, specs, and shipping info in accordions
- Reviews section with live data from Supabase
- "Notify me" form for out-of-stock items

### Wishlist (`/wishlist`)
Grid of saved products. Redirects to home if empty.

### Checkout (`/checkout`)
3-step flow:
1. **Review** — cart items summary
2. **Shipping** — form validated with Zod
3. **Payment** — placeholder card fields (demo mode)

On completion: inserts `orders` + `order_items`, increments `loyalty_points`, logs to `loyalty_history`, clears the cart, and shows a confirmation with the order number.

### Account (`/account`)
Protected route (redirects to `/` if not logged in). Three tabs:
- **Orders** — full order history from Supabase with item breakdown
- **Loyalty** — tier progress bar and points balance
- **Profile** — email, account ID, member since

### Admin (`/admin`)
Protected route (redirects to `/` if not admin). Displays all orders with pagination (10 per page). Each order can be expanded to see items and shipping info. Admins can update order status via a dropdown.

### Drops (`/drops`)
Limited-edition product launches with live/upcoming/ended states. Live drops show a countdown timer and a progress bar of units claimed.

---

## Components

### Layout
- **Navbar** — logo, category links, search, currency selector, theme toggle, auth button, cart icon with badge
- **AnnouncementBar** — scrolling promo text at the top
- **Footer** — links, newsletter, social icons
- **ScrollProgressBar** — thin gold bar at the top showing scroll depth

### Product
- **ProductCard** — image, brand, name, price, badges, quick-add, wishlist toggle
- **ProductGrid** — responsive grid with skeleton loading states
- **ProductFilters** — sidebar/sheet with category, brand, price filters
- **QuickViewModal** — full product details in a modal without navigating away
- **CompareBar** — fixed bottom bar showing up to 3 products being compared
- **ReviewForm** — star picker + comment textarea, submits to Supabase

### Cart
- **CartDrawer** — slide-in panel from the right with item list, subtotals, and checkout CTA

### Common
- **WhatsAppWidget** — floating WhatsApp button using `VITE_WHATSAPP_NUMBER`
- **BackToTop** — appears after scrolling 400px, smooth scroll to top
- **CookieBanner** — GDPR notice, dismisses to localStorage
- **BrandsMarquee** — auto-scrolling brand logo strip

### UI Primitives
- **Badge** — BESTSELLER / NEW / SALE / EXCLUSIVE labels
- **Toast / ToastStack** — non-blocking notifications (success, error)
- **Skeleton** — loading placeholder shapes
- **ErrorBoundary** — catches render errors and shows a fallback UI
- **Modal** — generic accessible modal wrapper

---

## Routing

All routes are defined in `src/App.jsx`. Pages are lazy-loaded:

| Path | Page | Protected |
|---|---|---|
| `/` | Home | No |
| `/shop` | Shop | No |
| `/product/:id` | ProductDetail | No |
| `/wishlist` | Wishlist | No |
| `/checkout` | Checkout | No |
| `/account` | Account | Login required |
| `/admin` | Admin | Admin only |
| `/drops` | Drops | No |
| `*` | NotFound | — |

Route transitions use Framer Motion `AnimatePresence` with a fade + slide animation.

---

## Internationalization

**File:** `src/i18n.js`

Uses `i18next` with `react-i18next`. Translation files are inlined in the i18n config. The active language is stored in `localStorage`. Language direction (`ltr`/`rtl`) is applied at the component level where needed using the `dir` attribute.

---

## Currency System

**File:** `src/lib/currencies.js`

All prices in the database are stored in USD. The `CurrencyContext` applies a fixed exchange rate on the fly using the `format(amount)` function. Supported currencies include USD, EUR, GBP, SAR, AED, and others.

---

## Loyalty Points System

Points are earned at checkout: **1 point per $10 spent** (`Math.floor(total / 10)`).

| Tier | Points Required |
|---|---|
| Bronze | 0+ |
| Silver | 1,000+ |
| Gold | 5,000+ |
| Platinum | 10,000+ |

On every successful order:
1. Current points are fetched from `loyalty_points`
2. New points are added and upserted back
3. A record is inserted into `loyalty_history` with the order number as the reason

---

## Admin Access

Admin status is determined client-side by comparing `user.email` to `VITE_ADMIN_EMAIL`. On the database side, the `is_admin()` SQL function enforces the same check inside RLS policies for write operations on `products` and all operations on `orders`.

```sql
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'your_admin_email'
$$;
```

---

## Row Level Security

All tables have RLS enabled. The general policy pattern:

| Table | Who can read | Who can write |
|---|---|---|
| products | Everyone | Admin only |
| product_variants | Everyone | — |
| profiles | Owner only | Owner only |
| orders | Owner or Admin | Owner (insert), Admin (update) |
| order_items | Owner only | Owner only |
| wishlists | Owner only | Owner only |
| reviews | Everyone | Authenticated users |
| loyalty_points | Owner only | Owner only |
| loyalty_history | Owner only | Owner only |
| stock_notifications | — | Anyone (anon insert) |
