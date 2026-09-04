-- ============================================================
-- CAFE TWO SHADES
-- Booking system
-- ============================================================


-- ============================================================
-- BOOKINGS
-- ============================================================

create table public.bookings (
  id uuid primary key default gen_random_uuid(),

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,

  booking_date date not null,
  booking_time time not null,

  party_size smallint not null,

  notes text,

  status text not null default 'pending',

  admin_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_customer_name_not_empty
    check (length(trim(customer_name)) > 0),

  constraint bookings_customer_email_not_empty
    check (length(trim(customer_email)) > 0),

  constraint bookings_customer_phone_not_empty
    check (length(trim(customer_phone)) > 0),

  constraint bookings_party_size_valid
    check (party_size between 1 and 8),

  constraint bookings_status_valid
    check (
      status in (
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'completed'
      )
    ),

  constraint bookings_time_on_half_hour
    check (
      extract(minute from booking_time) in (0, 30)
    )
);


-- ============================================================
-- BOOKING SETTINGS
-- ============================================================

create table public.booking_settings (
  id boolean primary key default true,

  maximum_capacity smallint not null default 28,
  maximum_party_size smallint not null default 8,

  booking_duration_minutes smallint not null default 60,
  booking_interval_minutes smallint not null default 30,

  maximum_days_ahead smallint not null default 31,

  warning_capacity_threshold smallint not null default 18,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint booking_settings_single_row
    check (id = true),

  constraint booking_settings_capacity_valid
    check (maximum_capacity > 0),

  constraint booking_settings_party_size_valid
    check (
      maximum_party_size between 1 and maximum_capacity
    ),

  constraint booking_settings_duration_valid
    check (booking_duration_minutes > 0),

  constraint booking_settings_interval_valid
    check (booking_interval_minutes > 0),

  constraint booking_settings_days_ahead_valid
    check (maximum_days_ahead > 0),

  constraint booking_settings_warning_valid
    check (
      warning_capacity_threshold > 0
      and warning_capacity_threshold <= maximum_capacity
    )
);


insert into public.booking_settings (
  maximum_capacity,
  maximum_party_size,
  booking_duration_minutes,
  booking_interval_minutes,
  maximum_days_ahead,
  warning_capacity_threshold
)
values (
  28,
  8,
  60,
  30,
  31,
  18
);


-- ============================================================
-- INDEXES
-- ============================================================

create index bookings_date_time_idx
  on public.bookings(booking_date, booking_time);

create index bookings_status_idx
  on public.bookings(status);

create index bookings_email_idx
  on public.bookings(customer_email);


-- ============================================================
-- UPDATED_AT
-- ============================================================

create trigger bookings_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();


create trigger booking_settings_updated_at
before update on public.booking_settings
for each row
execute function public.set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.bookings enable row level security;
alter table public.booking_settings enable row level security;


-- ============================================================
-- PUBLIC BOOKING CREATION
-- ============================================================

create policy "Anyone can submit a booking"
on public.bookings
for insert
to anon, authenticated
with check (
  status = 'pending'
  and party_size between 1 and 8
);


-- ============================================================
-- ADMIN BOOKING ACCESS
-- ============================================================

create policy "Admins can view bookings"
on public.bookings
for select
to authenticated
using (public.is_admin());


create policy "Admins can update bookings"
on public.bookings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy "Admins can delete bookings"
on public.bookings
for delete
to authenticated
using (public.is_admin());


-- ============================================================
-- BOOKING SETTINGS
-- ============================================================

create policy "Anyone can read booking settings"
on public.booking_settings
for select
to anon, authenticated
using (true);


create policy "Admins can update booking settings"
on public.booking_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());