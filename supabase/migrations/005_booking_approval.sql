-- ============================================================
-- ATOMIC BOOKING APPROVAL
-- ============================================================

create or replace function public.approve_pending_booking(
  p_booking_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_settings public.booking_settings%rowtype;

  v_requested_start timestamptz;
  v_requested_end timestamptz;

  v_current_capacity integer;
begin

  -- ----------------------------------------------------------
  -- Lock settings so simultaneous approval transactions
  -- cannot make conflicting capacity decisions.
  -- ----------------------------------------------------------

  select *
  into v_settings
  from public.booking_settings
  where id = true
  for update;

  if not found then
    return json_build_object(
      'success', false,
      'message', 'Booking settings are unavailable.'
    );
  end if;


  -- ----------------------------------------------------------
  -- Fetch pending booking.
  -- ----------------------------------------------------------

  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
    and status = 'pending'
  for update;

  if not found then
    return json_build_object(
      'success', false,
      'message',
      'This booking has already been processed.'
    );
  end if;


  -- ----------------------------------------------------------
  -- Requested one-hour occupancy window.
  -- ----------------------------------------------------------

  v_requested_start :=
    (
      v_booking.booking_date
      + v_booking.booking_time
    ) at time zone 'Europe/London';

  v_requested_end :=
    v_requested_start
    + make_interval(
        mins => v_settings.booking_duration_minutes
      );


  -- ----------------------------------------------------------
  -- Current overlapping approved bookings.
  --
  -- The booking currently being approved is excluded because
  -- it is still pending.
  -- ----------------------------------------------------------

  select coalesce(sum(party_size), 0)
  into v_current_capacity
  from public.bookings
  where booking_date =
        v_booking.booking_date

    and status = 'approved'

    and id <> v_booking.id

    and (
      (
        (
          booking_date
          + booking_time
        ) at time zone 'Europe/London'
      )
      <
      v_requested_end
    )

    and (
      (
        (
          booking_date
          + booking_time
        ) at time zone 'Europe/London'
      )
      + make_interval(
          mins => v_settings.booking_duration_minutes
        )
      >
      v_requested_start
    );


  -- ----------------------------------------------------------
  -- Capacity check
  -- ----------------------------------------------------------

  if v_current_capacity
     + v_booking.party_size
     > v_settings.maximum_capacity then

    return json_build_object(
      'success', false,
      'message',
      'There is no longer enough capacity for this booking.'
    );

  end if;


  -- ----------------------------------------------------------
  -- Approve
  -- ----------------------------------------------------------

  update public.bookings
  set
    status = 'approved',
    updated_at = now()
  where id = v_booking.id;


  return json_build_object(
    'success', true
  );

end;
$$;


-- ============================================================
-- SECURITY
-- ============================================================

revoke all
on function public.approve_pending_booking(uuid)
from public;

revoke all
on function public.approve_pending_booking(uuid)
from anon;

revoke all
on function public.approve_pending_booking(uuid)
from authenticated;

grant execute
on function public.approve_pending_booking(uuid)
to service_role;