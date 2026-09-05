-- ============================================================
-- CAFE TWO SHADES
-- CUSTOMER PHOTO GALLERY LIMIT
-- ============================================================

create or replace function public.can_approve_customer_photo(
  photo_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  approved_count integer;
  current_status text;
begin
  if not public.is_active_admin() then
    return false;
  end if;

  select status
  into current_status
  from public.customer_photos
  where id = photo_id;

  if current_status is null then
    return false;
  end if;

  if current_status = 'approved' then
    return true;
  end if;

  select count(*)::integer
  into approved_count
  from public.customer_photos
  where status = 'approved';

  return approved_count < 40;
end;
$$;


-- ============================================================
-- APPROVAL FUNCTION
-- ============================================================

create or replace function public.approve_customer_photo(
  photo_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_approve_customer_photo(
    photo_id
  ) then
    return false;
  end if;

  update public.customer_photos
  set
    status = 'approved',
    reviewed_at = now()
  where id = photo_id;

  return found;
end;
$$;


-- ============================================================
-- ADMIN-ONLY EXECUTION
-- ============================================================

revoke all
on function public.can_approve_customer_photo(uuid)
from public;

grant execute
on function public.can_approve_customer_photo(uuid)
to authenticated;


revoke all
on function public.approve_customer_photo(uuid)
from public;

grant execute
on function public.approve_customer_photo(uuid)
to authenticated;