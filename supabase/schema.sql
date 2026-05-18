-- Fashion Store — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── admin helper ─────────────────────────────────────────────────────────────
-- Set your admin email here. Used in RLS policies below.
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'ikhaledi95@gmail.com'
$$;

-- ─── products ────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id            text primary key,
  name          text not null,
  brand         text not null,
  category      text not null,
  price         numeric(10,2) not null,
  original_price numeric(10,2),
  rating        numeric(3,2) default 0,
  review_count  int default 0,
  badges        text[] default '{}',
  in_stock      boolean default true,
  stock_count   int default 0,
  image         text,
  images        text[],
  description   text,
  notes         text,
  specs         jsonb default '{}',
  sku           text,
  created_at    timestamptz default now()
);
alter table public.products enable row level security;
create policy "Public read products" on public.products for select using (true);
create policy "Admin insert products" on public.products for insert with check (public.is_admin());
create policy "Admin update products" on public.products for update using (public.is_admin());

-- ─── product_variants ─────────────────────────────────────────────────────────
create table if not exists public.product_variants (
  id          text primary key,
  product_id  text references public.products(id) on delete cascade,
  label       text not null,
  price       numeric(10,2) not null,
  stock       int default 0
);
alter table public.product_variants enable row level security;
create policy "Public read variants" on public.product_variants for select using (true);

-- ─── profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── orders ──────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id),
  order_number text not null unique,
  status       text not null default 'pending',
  total        numeric(10,2) not null,
  shipping_info jsonb default '{}',
  created_at   timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users read own orders"  on public.orders for select using (auth.uid() = user_id);
create policy "Users create orders"    on public.orders for insert with check (auth.uid() = user_id or user_id is null);
create policy "Admin read all orders"  on public.orders for select using (public.is_admin());
create policy "Admin update orders"    on public.orders for update using (public.is_admin());

-- ─── order_items ─────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid references public.orders(id) on delete cascade,
  product_id    text,
  name          text not null,
  variant_label text,
  price         numeric(10,2) not null,
  qty           int not null default 1
);
alter table public.order_items enable row level security;
create policy "Users read own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );
create policy "Users insert order items" on public.order_items
  for insert with check (
    exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or orders.user_id is null))
  );

-- ─── wishlists ───────────────────────────────────────────────────────────────
create table if not exists public.wishlists (
  user_id    uuid references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);
alter table public.wishlists enable row level security;
create policy "Users manage own wishlist" on public.wishlists using (auth.uid() = user_id);

-- ─── reviews ─────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  product_id text not null,
  user_id    uuid references auth.users(id),
  rating     int not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Public read reviews"  on public.reviews for select using (true);
create policy "Auth users create reviews" on public.reviews for insert with check (auth.uid() = user_id);

-- DB trigger: auto-update product avg rating after review insert/delete
create or replace function public.update_product_rating()
returns trigger language plpgsql as $$
declare
  new_avg  numeric;
  new_count int;
  pid text;
begin
  pid := coalesce(new.product_id, old.product_id);
  select avg(rating), count(*) into new_avg, new_count
  from public.reviews where product_id = pid;
  update public.products
  set rating = coalesce(round(new_avg, 2), 0),
      review_count = coalesce(new_count, 0)
  where id = pid;
  return coalesce(new, old);
end;
$$;
create trigger review_rating_update
  after insert or delete on public.reviews
  for each row execute procedure public.update_product_rating();

-- ─── stock_notifications ─────────────────────────────────────────────────────
create table if not exists public.stock_notifications (
  id         uuid primary key default uuid_generate_v4(),
  product_id text not null,
  email      text not null,
  created_at timestamptz default now(),
  unique (product_id, email)
);
alter table public.stock_notifications enable row level security;
create policy "Anon insert stock notifications" on public.stock_notifications for insert with check (true);

-- ─── loyalty_points ──────────────────────────────────────────────────────────
create table if not exists public.loyalty_points (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  points     int default 0,
  updated_at timestamptz default now()
);
alter table public.loyalty_points enable row level security;
create policy "Users read own loyalty" on public.loyalty_points for select using (auth.uid() = user_id);
create policy "Users upsert own loyalty" on public.loyalty_points for insert with check (auth.uid() = user_id);
create policy "Users update own loyalty" on public.loyalty_points for update using (auth.uid() = user_id);

-- ─── loyalty_history ─────────────────────────────────────────────────────────
create table if not exists public.loyalty_history (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade,
  points     int not null,
  reason     text,
  created_at timestamptz default now()
);
alter table public.loyalty_history enable row level security;
create policy "Users read own loyalty history" on public.loyalty_history for select using (auth.uid() = user_id);
