-- ============================================================
-- CAFE TWO SHADES
-- Atomic booking creation
-- ============================================================

create or replace function public.create_pending_booking(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_booking_date date,
  p_booking_time time,
  p_party_size integer,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings booking_settings%rowtype;
  v_booking_id uuid;

  v_today date;
  v_now timestamp with time zone;

  v_requested_start integer;
  v_requested_end integer;

  v_opening integer;
  v_closing integer;

  v_occupied_capacity integer;
begin
  /*
   * ----------------------------------------------------------
   * LOCK BOOKING SETTINGS
   * ----------------------------------------------------------
   *
   * Every booking transaction locks this single settings row.
   *
   * This serialises capacity checks, preventing two simultaneous
   * requests from both seeing the same remaining capacity.
   */

  select *
  into v_settings
  from public.booking_settings
  where id = true
  for update;

  if not found then
    raise exception
      using
        errcode = 'P0001',
        message = 'BOOKING_SETTINGS_UNAVAILABLE';
  end if;


  /*
   * ----------------------------------------------------------
   * BASIC VALIDATION
   * ----------------------------------------------------------
   */

  if p_customer_name is null
     or length(trim(p_customer_name)) = 0
     or length(p_customer_name) > 100 then

    raise exception
      using
        errcode = 'P0001',
        message = 'INVALID_NAME';
  end if;


  if p_customer_email is null
     or length(trim(p_customer_email)) = 0
     or length(p_customer_email) > 254 then

    raise exception
      using
        errcode = 'P0001',
        message = 'INVALID_EMAIL';
  end if;


  if p_customer_phone is null
     or length(trim(p_customer_phone)) = 0
     or length(p_customer_phone) > 30 then

    raise exception
      using
        errcode = 'P0001',
        message = 'INVALID_PHONE';
  end if;


  if p_party_size is null
     or p_party_size < 1
     or p_party_size >
        v_settings.maximum_party_size then

    raise exception
      using
        errcode = 'P0001',
        message = 'INVALID_PARTY_SIZE';
  end if;


  if p_notes is not null
     and length(p_notes) > 1000 then

    raise exception
      using
        errcode = 'P0001',
        message = 'NOTES_TOO_LONG';
  end if;


  /*
   * ----------------------------------------------------------
   * CURRENT LONDON DATE/TIME
   * ----------------------------------------------------------
   */

  v_now :=
    now();

  v_today :=
    (v_now at time zone 'Europe/London')::date;


  /*
   * ----------------------------------------------------------
   * BOOKING WINDOW
   * ----------------------------------------------------------
   */

  if p_booking_date < v_today then
    raise exception
      using
        errcode = 'P0001',
        message = 'DATE_IN_PAST';
  end if;


  if p_booking_date >
     (
       v_today + interval '1 month'
     )::date then

    raise exception
      using
        errcode = 'P0001',
        message = 'DATE_TOO_FAR';
  end if;


  /*
   * ----------------------------------------------------------
   * TIME / SLOT VALIDATION
   * ----------------------------------------------------------
   */

  v_requested_start :=
    extract(
      hour from p_booking_time
    )::integer * 60
    +
    extract(
      minute from p_booking_time
    )::integer;

  v_requested_end :=
    v_requested_start +
    v_settings.booking_duration_minutes;

  v_opening :=
    extract(
      hour from v_settings.opening_time
    )::integer * 60
    +
    extract(
      minute from v_settings.opening_time
    )::integer;

  v_closing :=
    extract(
      hour from v_settings.closing_time
    )::integer * 60
    +
    extract(
      minute from v_settings.closing_time
    )::integer;


  if v_requested_start < v_opening
     or v_requested_end > v_closing then

    raise exception
      using
        errcode = 'P0001',
        message = 'TIME_OUTSIDE_BOOKING_HOURS';
  end if;


  /*
   * Booking times must fall exactly on the configured
   * 30-minute grid.
   */

  if mod(
       v_requested_start - v_opening,
       v_settings.slot_interval_minutes
     ) <> 0 then

    raise exception
      using
        errcode = 'P0001',
        message = 'INVALID_BOOKING_SLOT';
  end if;


  /*
   * ----------------------------------------------------------
   * TWO-HOUR NOTICE
   * ----------------------------------------------------------
   */

  if p_booking_date = v_today then

    if (
      p_booking_date::timestamp
      + p_booking_time
    )
    <
    (
      v_now at time zone 'Europe/London'
    )
    + interval '2 hours' then

      raise exception
        using
          errcode = 'P0001',
          message = 'SHORT_NOTICE';
    end if;

  end if;


  /*
   * ----------------------------------------------------------
   * CAPACITY CHECK
   * ----------------------------------------------------------
   *
   * IMPORTANT:
   *
   * booking_settings is locked above.
   * Therefore another transaction cannot pass this point
   * simultaneously using the same capacity calculation.
   */

  select
    coalesce(
      sum(b.party_size),
      0
    )
  into v_occupied_capacity
  from public.bookings b
  where b.booking_date = p_booking_date
    and b.status = 'approved'
    and b.booking_time <
        (
          p_booking_time
          + (
              v_settings.booking_duration_minutes
              * interval '1 minute'
            )
        )
    and (
      b.booking_time
      + (
          v_settings.booking_duration_minutes
          * interval '1 minute'
        )
    ) > p_booking_time;


  if (
    v_occupied_capacity +
    p_party_size
  ) > v_settings.maximum_capacity then

    raise exception
      using
        errcode = 'P0001',
        message = 'CAPACITY_UNAVAILABLE';
  end if;


  /*
   * ----------------------------------------------------------
   * CREATE PENDING BOOKING
   * ----------------------------------------------------------
   */

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
  returning id
  into v_booking_id;


  return v_booking_id;

end;
$$;


-- ------------------------------------------------------------
-- SECURITY
-- ------------------------------------------------------------

revoke all
on function public.create_pending_booking(
  text,
  text,
  text,
  date,
  time,
  integer,
  text
)
from public;

grant execute
on function public.create_pending_booking(
  text,
  text,
  text,
  date,
  time,
  integer,
  text
)
to service_role;