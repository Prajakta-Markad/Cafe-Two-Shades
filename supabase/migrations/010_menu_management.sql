-- ============================================================
-- CAFE TWO SHADES
-- MENU MANAGEMENT
-- ============================================================

create table if not exists public.menu_categories (
  id uuid primary key
    default gen_random_uuid(),

  name text not null unique,

  description text,

  display_order integer not null
    default 0,

  is_visible boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint menu_category_name_check
    check (
      char_length(trim(name))
      between 1 and 150
    )
);


create table if not exists public.menu_items (
  id uuid primary key
    default gen_random_uuid(),

  category_id uuid not null
    references public.menu_categories(id)
    on delete cascade,

  name text not null,

  description text,

  display_order integer not null
    default 0,

  is_available boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint menu_item_name_check
    check (
      char_length(trim(name))
      between 1 and 150
    )
);


create table if not exists public.menu_item_prices (
  id uuid primary key
    default gen_random_uuid(),

  item_id uuid not null
    references public.menu_items(id)
    on delete cascade,

  label text not null,

  price numeric(8,2) not null,

  display_order integer not null
    default 0,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint menu_price_label_check
    check (
      char_length(trim(label))
      between 1 and 100
    ),

  constraint menu_price_value_check
    check (
      price >= 0
      and price <= 9999.99
    )
);


create table if not exists public.menu_notes (
  id uuid primary key
    default gen_random_uuid(),

  category_id uuid
    references public.menu_categories(id)
    on delete cascade,

  item_id uuid
    references public.menu_items(id)
    on delete cascade,

  note text not null,

  display_order integer not null
    default 0,

  is_visible boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint menu_note_owner_check
    check (
      (
        category_id is not null
        and item_id is null
      )
      or
      (
        category_id is null
        and item_id is not null
      )
    ),

  constraint menu_note_text_check
    check (
      char_length(trim(note))
      between 1 and 1000
    )
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists
  menu_categories_order_idx
on public.menu_categories (
  display_order
);

create index if not exists
  menu_items_category_order_idx
on public.menu_items (
  category_id,
  display_order
);

create index if not exists
  menu_prices_item_order_idx
on public.menu_item_prices (
  item_id,
  display_order
);

create index if not exists
  menu_notes_category_idx
on public.menu_notes (
  category_id,
  display_order
);

create index if not exists
  menu_notes_item_idx
on public.menu_notes (
  item_id,
  display_order
);


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists
  menu_categories_set_updated_at
on public.menu_categories;

create trigger
  menu_categories_set_updated_at
before update on public.menu_categories
for each row
execute function public.set_updated_at();


drop trigger if exists
  menu_items_set_updated_at
on public.menu_items;

create trigger
  menu_items_set_updated_at
before update on public.menu_items
for each row
execute function public.set_updated_at();


drop trigger if exists
  menu_prices_set_updated_at
on public.menu_item_prices;

create trigger
  menu_prices_set_updated_at
before update on public.menu_item_prices
for each row
execute function public.set_updated_at();


drop trigger if exists
  menu_notes_set_updated_at
on public.menu_notes;

create trigger
  menu_notes_set_updated_at
before update on public.menu_notes
for each row
execute function public.set_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.menu_categories
enable row level security;

alter table public.menu_items
enable row level security;

alter table public.menu_item_prices
enable row level security;

alter table public.menu_notes
enable row level security;


-- ============================================================
-- PUBLIC MENU ACCESS
-- ============================================================

drop policy if exists
  "Public can read visible menu categories"
on public.menu_categories;

create policy
  "Public can read visible menu categories"
on public.menu_categories
for select
to anon, authenticated
using (
  is_visible = true
);


drop policy if exists
  "Public can read available menu items"
on public.menu_items;

create policy
  "Public can read available menu items"
on public.menu_items
for select
to anon, authenticated
using (
  is_available = true
  and exists (
    select 1
    from public.menu_categories c
    where c.id = category_id
      and c.is_visible = true
  )
);


drop policy if exists
  "Public can read menu prices"
on public.menu_item_prices;

create policy
  "Public can read menu prices"
on public.menu_item_prices
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.menu_items i
    join public.menu_categories c
      on c.id = i.category_id
    where i.id = item_id
      and i.is_available = true
      and c.is_visible = true
  )
);


drop policy if exists
  "Public can read visible menu notes"
on public.menu_notes;

create policy
  "Public can read visible menu notes"
on public.menu_notes
for select
to anon, authenticated
using (
  is_visible = true
  and (
    (
      category_id is not null
      and exists (
        select 1
        from public.menu_categories c
        where c.id = category_id
          and c.is_visible = true
      )
    )
    or
    (
      item_id is not null
      and exists (
        select 1
        from public.menu_items i
        join public.menu_categories c
          on c.id = i.category_id
        where i.id = item_id
          and i.is_available = true
          and c.is_visible = true
      )
    )
  )
);


-- ============================================================
-- ADMIN MANAGEMENT
-- ============================================================

create policy
  "Active admins manage menu categories"
on public.menu_categories
for all
to authenticated
using (
  public.is_active_admin()
)
with check (
  public.is_active_admin()
);


create policy
  "Active admins manage menu items"
on public.menu_items
for all
to authenticated
using (
  public.is_active_admin()
)
with check (
  public.is_active_admin()
);


create policy
  "Active admins manage menu prices"
on public.menu_item_prices
for all
to authenticated
using (
  public.is_active_admin()
)
with check (
  public.is_active_admin()
);


create policy
  "Active admins manage menu notes"
on public.menu_notes
for all
to authenticated
using (
  public.is_active_admin()
)
with check (
  public.is_active_admin()
);