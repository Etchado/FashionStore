# Fashion Store

A production-ready luxury e-commerce web application for perfumes, watches, and accessories. Built with React 19 and powered by Supabase as the backend.

**Live URL:** https://fashion-store-lux.vercel.app

---

## Features

- **Product Catalog** — 16 luxury products across 3 categories: perfumes, watches, and accessories
- **Shopping Cart** — Persistent cart with quantity control, saved to localStorage
- **Wishlist** — Synced to Supabase when logged in, localStorage when guest
- **Product Comparison** — Compare up to 3 products side by side
- **Quick View** — Preview product details without leaving the current page
- **Drops Page** — Limited-edition product drops with countdown timers
- **Multi-step Checkout** — Cart review → Shipping → Payment → Confirmation
- **Order Management** — Users can view their order history in their account
- **Authentication** — Email/password and Google OAuth via Supabase Auth
- **Loyalty Points** — Earn points on every order, unlock Bronze/Silver/Gold/Platinum tiers
- **Product Reviews** — Authenticated users can submit star ratings and comments
- **Stock Notifications** — Get notified by email when an out-of-stock item returns
- **Admin Dashboard** — View and update order statuses with pagination
- **Multi-currency** — Switch between USD, EUR, GBP, SAR, and more
- **Multi-language** — i18n support (English + Arabic)
- **Dark / Light Mode** — Persisted across sessions
- **Fully Responsive** — Works on mobile, tablet, and desktop
- **SEO** — Dynamic page titles and meta descriptions per route

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Animations | Framer Motion |
| Form Validation | Zod |
| Routing | React Router v7 |
| i18n | i18next + react-i18next |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── components/
│   ├── auth/          # AuthModal (sign in / sign up)
│   ├── cart/          # CartDrawer (slide-out cart)
│   ├── common/        # WhatsApp widget, BackToTop, CookieBanner, BrandsMarquee
│   ├── layout/        # Navbar, Footer, AnnouncementBar, ScrollProgressBar
│   ├── product/       # ProductCard, ProductGrid, ProductFilters, QuickViewModal, CompareBar, ReviewForm
│   └── ui/            # Badge, Button, Modal, Toast, Skeleton, ErrorBoundary
├── context/
│   ├── AuthContext     # Supabase auth session, isAdmin check
│   ├── CartContext     # Cart state, localStorage persistence
│   ├── WishlistContext # Wishlist, synced to Supabase when logged in
│   ├── ProductsContext # Fetches products from Supabase, falls back to local data
│   ├── CompareContext  # Product comparison state
│   ├── CurrencyContext # Active currency + formatting
│   ├── ThemeContext    # Dark/light mode
│   └── ToastContext    # Global toast notifications
├── data/
│   └── products.js    # Local product data (used as fallback)
├── hooks/
│   ├── useDebounce    # Debounce hook for search inputs
│   └── useSEO         # Sets document title and meta tags per page
├── lib/
│   ├── supabase.js    # Supabase client
│   ├── cn.js          # Tailwind class merger utility
│   └── currencies.js  # Currency definitions and rates
├── pages/
│   ├── Home           # Hero, featured products, brands marquee
│   ├── Shop           # Full catalog with filters and sorting
│   ├── ProductDetail  # Product page with gallery, variants, reviews
│   ├── Wishlist       # Saved products
│   ├── Checkout       # Multi-step checkout flow
│   ├── Account        # Orders history, loyalty points, profile
│   ├── Admin          # Order management dashboard (admin only)
│   ├── Drops          # Limited-edition drops with countdowns
│   └── NotFound       # 404 page
└── App.jsx            # Root with all providers and lazy-loaded routes
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Etchado/FashionStore.git
cd FashionStore
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=your_admin_email
VITE_WHATSAPP_NUMBER=+1234567890
```

### 4. Set up the database

Run the following files in order in your Supabase SQL Editor:

1. `supabase/schema.sql` — creates all tables and RLS policies
2. `supabase/seed.sql` — inserts the 16 products and variants

### 5. Run locally

```bash
npm run dev
```

Open `http://localhost:5173`

---

## Deployment

The project is deployed on Vercel with automatic deployments on every push to `main`. The `vercel.json` file handles SPA routing rewrites.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |
| `VITE_ADMIN_EMAIL` | Email address that gets admin access |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for the chat widget |

---

## Database Tables

| Table | Purpose |
|---|---|
| `products` | Product catalog |
| `product_variants` | Size/color variants per product |
| `profiles` | User profile (auto-created on signup) |
| `orders` | Customer orders |
| `order_items` | Line items per order |
| `wishlists` | User saved products |
| `reviews` | Product ratings and comments |
| `loyalty_points` | Points balance per user |
| `loyalty_history` | Points transaction log |
| `stock_notifications` | Email alerts for out-of-stock items |
