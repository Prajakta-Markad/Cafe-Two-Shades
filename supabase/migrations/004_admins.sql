-- ============================================================
-- CAFE TWO SHADES
-- ADMIN ACCESS
-- ============================================================

create table public.admins (
  user_id uuid primary key references auth.users(id)
    on delete cascade,

  created_at timestamptz not null default now()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.admins enable row level security;


-- Admins can see their own admin record.
create policy "Admins can view their own record"
on public.admins
for select
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================
-- ADMIN CHECK FUNCTION
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;


-- Do not expose the function to anonymous users.
revoke execute
on function public.is_admin()
from anon;


grant execute
on function public.is_admin()
to authenticated;