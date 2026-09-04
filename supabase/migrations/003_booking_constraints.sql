-- ============================================================
-- CAFE TWO SHADES
-- Booking data integrity constraints
-- ============================================================

/*
 * ------------------------------------------------------------
 * STATUS
 * ------------------------------------------------------------
 */

alter table public.bookings
drop constraint if exists bookings_status_check;

alter table public.bookings
add constraint bookings_status_check
check (
  status in (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  )
);


/*
 * ------------------------------------------------------------
 * PARTY SIZE
 * ------------------------------------------------------------
 *
 * Database-level protection.
 * The application also validates this.
 */

alter table public.bookings
drop constraint if exists bookings_party_size_check;

alter table public.bookings
add constraint bookings_party_size_check
check (
  party_size >= 1
  and party_size <= 8
);


/*
 * ------------------------------------------------------------
 * CUSTOMER NAME
 * ------------------------------------------------------------
 */

alter table public.bookings
drop constraint if exists bookings_customer_name_check;

alter table public.bookings
add constraint bookings_customer_name_check
check (
  char_length(
    trim(customer_name)
  ) between 1 and 100
);


/*
 * ------------------------------------------------------------
 * CUSTOMER EMAIL
 * ------------------------------------------------------------
 */

alter table public.bookings
drop constraint if exists bookings_customer_email_check;

alter table public.bookings
add constraint bookings_customer_email_check
check (
  char_length(
    trim(customer_email)
  ) between 3 and 254
);


/*
 * ------------------------------------------------------------
 * CUSTOMER PHONE
 * ------------------------------------------------------------
 */

alter table public.bookings
drop constraint if exists bookings_customer_phone_check;

alter table public.bookings
add constraint bookings_customer_phone_check
check (
  char_length(
    trim(customer_phone)
  ) between 1 and 30
);


/*
 * ------------------------------------------------------------
 * NOTES
 * ------------------------------------------------------------
 */

alter table public.bookings
drop constraint if exists bookings_notes_length_check;

alter table public.bookings
add constraint bookings_notes_length_check
check (
  notes is null
  or char_length(notes) <= 1000
);


/*
 * ------------------------------------------------------------
 * INDEXES
 * ------------------------------------------------------------
 */

create index if not exists
  bookings_date_status_time_idx
on public.bookings (
  booking_date,
  status,
  booking_time
);

create index if not exists
  bookings_customer_email_idx
on public.bookings (
  customer_email
);