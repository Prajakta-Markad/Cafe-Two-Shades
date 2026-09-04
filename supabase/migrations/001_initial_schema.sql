-- ============================================================
-- CAFE TWO SHADES
-- Initial database schema
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- MENU CATEGORIES
-- ============================================================

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  note text,

  display_order integer not null default 0,
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint menu_categories_name_not_empty
    check (length(trim(name)) > 0),

  constraint menu_categories_display_order_non_negative
    check (display_order >= 0)
);


-- ============================================================
-- MENU ITEMS
-- ============================================================

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),

  category_id uuid not null
    references public.menu_categories(id)
    on delete cascade,

  name text not null,
  description text,

  display_order integer not null default 0,
  available boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint menu_items_name_not_empty
    check (length(trim(name)) > 0),

  constraint menu_items_display_order_non_negative
    check (display_order >= 0)
);


-- ============================================================
-- MENU ITEM PRICES
-- ============================================================

create table public.menu_item_prices (
  id uuid primary key default gen_random_uuid(),

  item_id uuid not null
    references public.menu_items(id)
    on delete cascade,

  label text not null,
  price numeric(10,2) not null,

  display_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint menu_item_prices_label_not_empty
    check (length(trim(label)) > 0),

  constraint menu_item_prices_price_non_negative
    check (price >= 0),

  constraint menu_item_prices_display_order_non_negative
    check (display_order >= 0)
);


-- ============================================================
-- ADMIN PROFILES
-- ============================================================

create table public.admin_profiles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint admin_profiles_display_name_not_empty
    check (length(trim(display_name)) > 0)
);


-- ============================================================
-- INDEXES
-- ============================================================

create index menu_categories_display_order_idx
  on public.menu_categories(display_order);

create index menu_items_category_id_idx
  on public.menu_items(category_id);

create index menu_items_display_order_idx
  on public.menu_items(display_order);

create index menu_item_prices_item_id_idx
  on public.menu_item_prices(item_id);

create index menu_item_prices_display_order_idx
  on public.menu_item_prices(display_order);


-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger menu_categories_updated_at
before update on public.menu_categories
for each row
execute function public.set_updated_at();


create trigger menu_items_updated_at
before update on public.menu_items
for each row
execute function public.set_updated_at();


create trigger menu_item_prices_updated_at
before update on public.menu_item_prices
for each row
execute function public.set_updated_at();


create trigger admin_profiles_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- ADMIN CHECK
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_item_prices enable row level security;
alter table public.admin_profiles enable row level security;


-- ============================================================
-- PUBLIC MENU READ ACCESS
-- ============================================================

create policy "Anyone can view active menu categories"
on public.menu_categories
for select
to anon, authenticated
using (active = true);


create policy "Anyone can view available menu items"
on public.menu_items
for select
to anon, authenticated
using (
  available = true
  and exists (
    select 1
    from public.menu_categories category
    where category.id = menu_items.category_id
      and category.active = true
  )
);


create policy "Anyone can view prices of available items"
on public.menu_item_prices
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.menu_items item
    join public.menu_categories category
      on category.id = item.category_id
    where item.id = menu_item_prices.item_id
      and item.available = true
      and category.active = true
  )
);


-- ============================================================
-- ADMIN MENU ACCESS
-- ============================================================

create policy "Admins can view all categories"
on public.menu_categories
for select
to authenticated
using (public.is_admin());


create policy "Admins can create categories"
on public.menu_categories
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update categories"
on public.menu_categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy "Admins can delete categories"
on public.menu_categories
for delete
to authenticated
using (public.is_admin());


create policy "Admins can view all menu items"
on public.menu_items
for select
to authenticated
using (public.is_admin());


create policy "Admins can create menu items"
on public.menu_items
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update menu items"
on public.menu_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy "Admins can delete menu items"
on public.menu_items
for delete
to authenticated
using (public.is_admin());


create policy "Admins can view all prices"
on public.menu_item_prices
for select
to authenticated
using (public.is_admin());


create policy "Admins can create prices"
on public.menu_item_prices
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update prices"
on public.menu_item_prices
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy "Admins can delete prices"
on public.menu_item_prices
for delete
to authenticated
using (public.is_admin());


-- ============================================================
-- ADMIN PROFILE ACCESS
-- ============================================================

create policy "Admins can view their own profile"
on public.admin_profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can update their own profile"
on public.admin_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());