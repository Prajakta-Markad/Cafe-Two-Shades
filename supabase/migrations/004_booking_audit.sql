-- ============================================================
-- CAFE TWO SHADES
-- Booking approval audit information
-- ============================================================

alter table public.bookings
add column if not exists
  approved_at timestamptz;

alter table public.bookings
add column if not exists
  approved_by uuid;

alter table public.bookings
add column if not exists
  rejected_at timestamptz;

alter table public.bookings
add column if not exists
  rejected_by uuid;


alter table public.bookings
drop constraint if exists
  bookings_approved_by_fkey;

alter table public.bookings
add constraint
  bookings_approved_by_fkey
foreign key (
  approved_by
)
references auth.users(id)
on delete set null;


alter table public.bookings
drop constraint if exists
  bookings_rejected_by_fkey;

alter table public.bookings
add constraint
  bookings_rejected_by_fkey
foreign key (
  rejected_by
)
references auth.users(id)
on delete set null;


create index if not exists
  bookings_pending_idx
on public.bookings (
  status,
  booking_date,
  booking_time
);