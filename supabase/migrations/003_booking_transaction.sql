-- ============================================================
-- ATOMIC BOOKING CREATION
-- ============================================================

create or replace function public.create_pending_booking(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_booking_date date,
  p_booking_time time,
  p_party_size smallint,
  p_notes text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.booking_settings%rowtype;

  v_requested_start timestamptz;
  v_requested_end timestamptz;

  v_current_capacity integer;
  v_booking_id uuid;

  v_max_end timestamptz;
begin

  -- ----------------------------------------------------------
  -- Lock booking settings while calculating capacity.
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
  -- Basic validation
  -- ----------------------------------------------------------

  if p_party_size < 1
     or p_party_size > v_settings.maximum_party_size then

    return json_build_object(
      'success', false,
      'message',
      format(
        'Online bookings are limited to %s guests.',
        v_settings.maximum_party_size
      )
    );

  end if;


  if p_booking_time is null then
    return json_build_object(
      'success', false,
      'message', 'A booking time is required.'
    );
  end if;


  if extract(minute from p_booking_time) not in (0, 30) then
    return json_build_object(
      'success', false,
      'message',
      'Bookings must be made in 30-minute intervals.'
    );
  end if;


  -- ----------------------------------------------------------
  -- Create requested time window.
  --
  -- A booking occupies capacity for 60 minutes.
  -- ----------------------------------------------------------

  v_requested_start :=
    (p_booking_date + p_booking_time)
    at time zone 'Europe/London';

  v_requested_end :=
    v_requested_start
    + make_interval(
        mins => v_settings.booking_duration_minutes
      );


  -- ----------------------------------------------------------
  -- Prevent bookings in the past.
  -- ----------------------------------------------------------

  if v_requested_start <= now() then
    return json_build_object(
      'success', false,
      'message',
      'Please choose a future booking time.'
    );
  end if;


  -- ----------------------------------------------------------
  -- Calculate capacity occupied by overlapping bookings.
  --
  -- Pending bookings count here deliberately.
  --
  -- Otherwise two customers could simultaneously submit
  -- requests while capacity appears available.
  -- ----------------------------------------------------------

  select coalesce(sum(party_size), 0)
  into v_current_capacity
  from public.bookings
  where booking_date = p_booking_date
    and status in ('pending', 'approved')
    and (
      (
        (
          p_booking_date + booking_time
        ) at time zone 'Europe/London'
      )
      <
      v_requested_end
    )
    and (
      (
        (
          p_booking_date + booking_time
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

  if v_current_capacity + p_party_size
     > v_settings.maximum_capacity then

    return json_build_object(
      'success', false,
      'message',
      'There is not enough capacity available for that time. Please choose another time.'
    );

  end if;


  -- ----------------------------------------------------------
  -- Insert booking
  -- ----------------------------------------------------------

  insert into public.bookings (
    customer_name,
    customer_email,
    customer_phone,
    booking_date,
    booking_time,
    party_size,
    notes,
    status
  )
  values (
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    trim(p_customer_phone),
    p_booking_date,
    p_booking_time,
    p_party_size,
    nullif(trim(p_notes), ''),
    'pending'
  )
  returning id into v_booking_id;


  -- ----------------------------------------------------------
  -- Return booking result
  -- ----------------------------------------------------------

  return json_build_object(
    'success', true,
    'booking_id', v_booking_id
  );

end;
$$;


-- ============================================================
-- SECURITY
-- ============================================================

revoke all
on function public.create_pending_booking(
  text,
  text,
  text,
  date,
  time,
  smallint,
  text
)
from public;

revoke all
on function public.create_pending_booking(
  text,
  text,
  text,
  date,
  time,
  smallint,
  text
)
from anon;

revoke all
on function public.create_pending_booking(
  text,
  text,
  text,
  date,
  time,
  smallint,
  text
)
from authenticated;

grant execute
on function public.create_pending_booking(
  text,
  text,
  text,
  date,
  time,
  smallint,
  text
)
to service_role;