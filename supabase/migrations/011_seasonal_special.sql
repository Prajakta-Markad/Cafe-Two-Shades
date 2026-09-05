-- ============================================================
-- CAFE TWO SHADES
-- SEASONAL SPECIAL
-- ============================================================

create table if not exists public.seasonal_specials (
  id uuid primary key
    default gen_random_uuid(),

  name text not null,

  description text not null,

  image_path text,

  season text not null,

  is_active boolean not null
    default false,

  display_order integer not null
    default 0,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint seasonal_special_name_check
    check (
      char_length(trim(name))
      between 1 and 150
    ),

  constraint seasonal_special_description_check
    check (
      char_length(trim(description))
      between 1 and 1000
    ),

  constraint seasonal_special_season_check
    check (
      season in (
        'spring',
        'summer',
        'autumn',
        'winter'
      )
    )
);


create index if not exists
  seasonal_special_active_idx
on public.seasonal_specials (
  is_active
);

create index if not exists
  seasonal_special_season_idx
on public.seasonal_specials (
  season
);


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists
  seasonal_special_set_updated_at
on public.seasonal_specials;

create trigger
  seasonal_special_set_updated_at
before update on public.seasonal_specials
for each row
execute function public.set_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.seasonal_specials
enable row level security;


-- Public only sees the current active special.
drop policy if exists
  "Public can read active seasonal special"
on public.seasonal_specials;

create policy
  "Public can read active seasonal special"
on public.seasonal_specials
for select
to anon, authenticated
using (
  is_active = true
);


-- Admins can manage all seasonal specials.
drop policy if exists
  "Active admins manage seasonal specials"
on public.seasonal_specials;

create policy
  "Active admins manage seasonal specials"
on public.seasonal_specials
for all
to authenticated
using (
  public.is_active_admin()
)
with check (
  public.is_active_admin()
);


-- ============================================================
-- ONLY ONE ACTIVE SPECIAL
-- ============================================================

create unique index if not exists
  only_one_active_seasonal_special
on public.seasonal_specials (
  is_active
)
where is_active = true;