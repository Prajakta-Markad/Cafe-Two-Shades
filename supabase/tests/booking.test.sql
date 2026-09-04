-- ============================================================
-- CAFE TWO SHADES
-- BOOKING SYSTEM TEST SUITE
--
-- Run against a LOCAL Supabase database only.
-- These tests assume migrations 001-006 have been applied.
-- ============================================================


begin;


-- ============================================================
-- TEST HELPERS
-- ============================================================

create temporary table test_results (
  test_name text primary key,
  passed boolean not null,
  details text
);


create or replace function pg_temp.record_test(
  p_name text,
  p_passed boolean,
  p_details text default null
)
returns void
language plpgsql
as $$
begin
  insert into test_results (
    test_name,
    passed,
    details
  )
  values (
    p_name,
    p_passed,
    p_details
  );
end;
$$;


-- ============================================================
-- RESET TEST DATA
-- ============================================================

delete from public.bookings
where customer_email like '%@booking-test.local';


-- ============================================================
-- TEST 1
-- VALID BOOKING
-- ============================================================

do $$
declare
  booking_id uuid;
begin

  begin

    select public.create_pending_booking(
      'Test Customer',
      'valid@booking-test.local',
      '07123456789',
      (
        current_date
        + interval '3 days'
      )::date,
      '10:00',
      2,
      'Test booking'
    )
    into booking_id;

    perform pg_temp.record_test(
      'Valid booking is created',
      booking_id is not null
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Valid booking is created',
        false,
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 2
-- PARTY OF 8 IS VALID
-- ============================================================

do $$
declare
  booking_id uuid;
begin

  begin

    select public.create_pending_booking(
      'Eight Guest Test',
      'eight@booking-test.local',
      '07123456788',
      (
        current_date
        + interval '4 days'
      )::date,
      '11:00',
      8,
      null
    )
    into booking_id;

    perform pg_temp.record_test(
      'Party of 8 is accepted',
      booking_id is not null
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Party of 8 is accepted',
        false,
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 3
-- PARTY OF 9 IS REJECTED
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Nine Guest Test',
      'nine@booking-test.local',
      '07123456787',
      (
        current_date
        + interval '4 days'
      )::date,
      '12:00',
      9,
      null
    );

    perform pg_temp.record_test(
      'Party of 9 is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Party of 9 is rejected',
        sqlerrm like '%INVALID_PARTY_SIZE%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 4
-- PAST DATE
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Past Date Test',
      'past@booking-test.local',
      '07123456786',
      current_date - 1,
      '12:00',
      2,
      null
    );

    perform pg_temp.record_test(
      'Past date is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Past date is rejected',
        sqlerrm like '%DATE_IN_PAST%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 5
-- TOO FAR IN ADVANCE
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Future Date Test',
      'future@booking-test.local',
      '07123456785',
      (
        current_date
        + interval '2 months'
      )::date,
      '12:00',
      2,
      null
    );

    perform pg_temp.record_test(
      'Date beyond booking window is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Date beyond booking window is rejected',
        sqlerrm like '%DATE_TOO_FAR%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 6
-- INVALID 15-MINUTE SLOT
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Invalid Slot Test',
      'slot@booking-test.local',
      '07123456784',
      (
        current_date
        + interval '3 days'
      )::date,
      '10:15',
      2,
      null
    );

    perform pg_temp.record_test(
      'Invalid slot is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Invalid slot is rejected',
        sqlerrm like '%INVALID_BOOKING_SLOT%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 7
-- PARTY SIZE 0
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Zero Guest Test',
      'zero@booking-test.local',
      '07123456783',
      (
        current_date
        + interval '3 days'
      )::date,
      '10:00',
      0,
      null
    );

    perform pg_temp.record_test(
      'Zero guests is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Zero guests is rejected',
        sqlerrm like '%INVALID_PARTY_SIZE%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 8
-- NOTES TOO LONG
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Long Notes Test',
      'notes@booking-test.local',
      '07123456782',
      (
        current_date
        + interval '3 days'
      )::date,
      '13:00',
      2,
      repeat('x', 1001)
    );

    perform pg_temp.record_test(
      'Oversized notes are rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Oversized notes are rejected',
        sqlerrm like '%NOTES_TOO_LONG%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 9
-- CAPACITY
--
-- Maximum capacity is expected to be 26-28 depending on the
-- final configured value.
--
-- We temporarily configure 10 for deterministic testing.
-- ============================================================

do $$
begin

  update public.booking_settings
  set maximum_capacity = 10
  where id = true;

  perform pg_temp.record_test(
    'Test capacity configured',
    true
  );

end;
$$;


-- ============================================================
-- TEST 10
-- CAPACITY ACCEPTS EXACT LIMIT
-- ============================================================

do $$
declare
  booking_id uuid;
begin

  begin

    select public.create_pending_booking(
      'Capacity One',
      'capacity1@booking-test.local',
      '07123456781',
      (
        current_date
        + interval '5 days'
      )::date,
      '10:00',
      6,
      null
    )
    into booking_id;

    update public.bookings
    set status = 'approved'
    where id = booking_id;

    select public.create_pending_booking(
      'Capacity Two',
      'capacity2@booking-test.local',
      '07123456780',
      (
        current_date
        + interval '5 days'
      )::date,
      '10:00',
      4,
      null
    )
    into booking_id;

    perform pg_temp.record_test(
      'Capacity exactly at limit is accepted',
      booking_id is not null
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Capacity exactly at limit is accepted',
        false,
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 11
-- CAPACITY ABOVE LIMIT
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Capacity Overflow',
      'overflow@booking-test.local',
      '07123456779',
      (
        current_date
        + interval '5 days'
      )::date,
      '10:00',
      1,
      null
    );

    perform pg_temp.record_test(
      'Capacity overflow is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Capacity overflow is rejected',
        sqlerrm like '%CAPACITY_UNAVAILABLE%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 12
-- NON-OVERLAPPING BOOKING
-- ============================================================

do $$
declare
  booking_id uuid;
begin

  begin

    /*
     * Existing bookings at 10:00 last one hour.
     * 11:00 should therefore not overlap.
     */

    select public.create_pending_booking(
      'Non Overlap Test',
      'nonoverlap@booking-test.local',
      '07123456778',
      (
        current_date
        + interval '5 days'
      )::date,
      '11:00',
      1,
      null
    )
    into booking_id;

    perform pg_temp.record_test(
      'Non-overlapping booking is allowed',
      booking_id is not null
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Non-overlapping booking is allowed',
        false,
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- RESTORE REALISTIC TEST CAPACITY
-- ============================================================

update public.booking_settings
set maximum_capacity = 28
where id = true;


-- ============================================================
-- TEST 13
-- REQUIRED CUSTOMER DATA
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      '',
      'emptyname@booking-test.local',
      '07123456777',
      (
        current_date
        + interval '4 days'
      )::date,
      '10:00',
      2,
      null
    );

    perform pg_temp.record_test(
      'Empty customer name is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Empty customer name is rejected',
        sqlerrm like '%INVALID_NAME%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 14
-- EMPTY EMAIL
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Email Test',
      '',
      '07123456776',
      (
        current_date
        + interval '4 days'
      )::date,
      '10:00',
      2,
      null
    );

    perform pg_temp.record_test(
      'Empty email is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Empty email is rejected',
        sqlerrm like '%INVALID_EMAIL%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST 15
-- EMPTY PHONE
-- ============================================================

do $$
begin

  begin

    perform public.create_pending_booking(
      'Phone Test',
      'phone@booking-test.local',
      '',
      (
        current_date
        + interval '4 days'
      )::date,
      '10:00',
      2,
      null
    );

    perform pg_temp.record_test(
      'Empty phone is rejected',
      false,
      'Booking unexpectedly succeeded.'
    );

  exception
    when others then

      perform pg_temp.record_test(
        'Empty phone is rejected',
        sqlerrm like '%INVALID_PHONE%',
        sqlerrm
      );

  end;

end;
$$;


-- ============================================================
-- TEST RESULTS
-- ============================================================

select
  test_name,
  passed,
  details
from test_results
order by test_name;


-- ============================================================
-- FINAL RESULT
-- ============================================================

do $$
declare
  failed_count integer;
begin

  select count(*)
  into failed_count
  from test_results
  where passed = false;

  if failed_count > 0 then

    raise exception
      'BOOKING TEST SUITE FAILED: % test(s) failed.',
      failed_count;

  end if;

  raise notice
    'BOOKING TEST SUITE PASSED.';

end;
$$;


rollback;