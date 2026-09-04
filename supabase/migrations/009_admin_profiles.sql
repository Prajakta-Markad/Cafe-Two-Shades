-- ============================================================
-- CAFE TWO SHADES
-- ADMIN ACCESS CONTROL
-- ============================================================

create table if not exists public.admin_profiles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text not null,

  is_active boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint admin_display_name_length_check
    check (
      char_length(trim(display_name))
      between 1 and 100
    )
);


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists
  admin_profiles_set_updated_at
on public.admin_profiles;

create trigger
  admin_profiles_set_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.admin_profiles
enable row level security;


-- ============================================================
-- SECURITY HELPER
--
-- SECURITY DEFINER prevents recursive RLS checks when the
-- application asks whether the current authenticated user
-- is an active administrator.
-- ============================================================

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and is_active = true
  );
$$;


revoke all
on function public.is_active_admin()
from public;


grant execute
on function public.is_active_admin()
to authenticated;


-- ============================================================
-- ADMIN PROFILE ACCESS
-- ============================================================

drop policy if exists
  "Admins can read their own profile"
on public.admin_profiles;

create policy
  "Admins can read their own profile"
on public.admin_profiles
for select
to authenticated
using (
  user_id = auth.uid()
  and is_active = true
);


drop policy if exists
  "Admins can update their own profile"
on public.admin_profiles;

create policy
  "Admins can update their own profile"
on public.admin_profiles
for update
to authenticated
using (
  user_id = auth.uid()
  and is_active = true
)
with check (
  user_id = auth.uid()
  and is_active = true
);


-- No anonymous access.
-- No public insert.
-- No public delete.