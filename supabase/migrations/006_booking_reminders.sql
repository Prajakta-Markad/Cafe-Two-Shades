-- ============================================================
-- BOOKING REMINDER TRACKING
-- ============================================================

alter table public.bookings
add column if not exists reminder_sent_at timestamptz;


-- Index for the daily reminder query.
create index if not exists bookings_daily_reminder_idx
on public.bookings (
  booking_date,
  status
)
where status = 'approved';