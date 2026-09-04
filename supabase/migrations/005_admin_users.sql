-- ============================================================
-- CAFE TWO SHADES
-- Admin users
-- ============================================================

create table if not exists
public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  is_active boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now()
);


alter table public.admin_users
enable row level security;


create policy
"Admins can view their own admin record"
on public.admin_users
for select
to authenticated
using (
  user_id = auth.uid()
);