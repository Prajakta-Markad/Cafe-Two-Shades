-- ============================================================
-- RANDOM PUBLIC CUSTOMER PHOTOS
-- ============================================================

create or replace function public.get_random_customer_photos(
  requested_count integer default 10
)
returns table (
  id uuid,
  image_path text,
  display_order integer,
  submitted_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    cp.id,
    cp.image_path,
    cp.display_order,
    cp.submitted_at
  from public.customer_photos cp
  where cp.status = 'approved'
  order by random()
  limit least(
    greatest(requested_count, 1),
    10
  );
$$;


revoke all
on function public.get_random_customer_photos(integer)
from public;

grant execute
on function public.get_random_customer_photos(integer)
to anon, authenticated;