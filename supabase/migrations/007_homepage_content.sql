-- ============================================================
-- CAFE TWO SHADES
-- HOMEPAGE CONTENT
--
-- Google Reviews
-- Customer Photo Submissions
-- Seasonal Special
-- ============================================================

-- ============================================================
-- GOOGLE REVIEWS
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key
    default gen_random_uuid(),

  reviewer_name text not null,

  review_text text not null,

  rating smallint not null,

  source text not null
    default 'Google Reviews',

  is_published boolean not null
    default true,

  display_order integer not null
    default 0,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint reviews_rating_check
    check (
      rating between 1 and 5
    ),

  constraint reviews_name_length_check
    check (
      char_length(trim(reviewer_name))
      between 1 and 100
    ),

  constraint reviews_text_length_check
    check (
      char_length(trim(review_text))
      between 1 and 2000
    ),

  constraint reviews_source_check
    check (
      source in ('Google Reviews')
    )
);


create index if not exists
  reviews_published_order_idx
on public.reviews (
  is_published,
  display_order,
  created_at
);


-- ============================================================
-- CUSTOMER PHOTO SUBMISSIONS
-- ============================================================

create table if not exists public.photo_submissions (
  id uuid primary key
    default gen_random_uuid(),

  storage_path text not null unique,

  original_filename text,

  mime_type text not null,

  file_size_bytes integer not null,

  status text not null
    default 'pending',

  rejection_reason text,

  reviewed_at timestamptz,

  reviewed_by uuid,

  created_at timestamptz not null
    default now(),

  constraint photo_status_check
    check (
      status in (
        'pending',
        'approved',
        'rejected'
      )
    ),

  constraint photo_mime_type_check
    check (
      mime_type in (
        'image/jpeg',
        'image/png',
        'image/webp'
      )
    ),

  constraint photo_file_size_check
    check (
      file_size_bytes > 0
      and file_size_bytes <= 5242880
    )
);


create index if not exists
  photo_submissions_status_created_idx
on public.photo_submissions (
  status,
  created_at
);


create index if not exists
  photo_submissions_reviewed_idx
on public.photo_submissions (
  reviewed_by,
  reviewed_at
);


-- ============================================================
-- REVIEW / PHOTO AUDIT REFERENCES
-- ============================================================

alter table public.photo_submissions
drop constraint if exists
  photo_submissions_reviewed_by_fkey;

alter table public.photo_submissions
add constraint
  photo_submissions_reviewed_by_fkey
foreign key (
  reviewed_by
)
references auth.users(id)
on delete set null;


-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();

  return new;
end;
$$;


drop trigger if exists
  reviews_set_updated_at
on public.reviews;


create trigger
  reviews_set_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.reviews
enable row level security;

alter table public.photo_submissions
enable row level security;


-- ============================================================
-- PUBLIC REVIEWS
--
-- Visitors may ONLY read published reviews.
-- ============================================================

drop policy if exists
  "Public can read published reviews"
on public.reviews;


create policy
  "Public can read published reviews"
on public.reviews
for select
to anon, authenticated
using (
  is_published = true
);


-- ============================================================
-- PHOTO SUBMISSIONS
--
-- No direct public table access.
--
-- Submission happens through the Edge Function.
-- Admin management will also happen through controlled
-- authenticated operations.
-- ============================================================

-- Intentionally no anon SELECT/INSERT/UPDATE/DELETE policy.


-- ============================================================
-- TABLE PRIVILEGES
-- ============================================================

revoke all
on public.photo_submissions
from anon, authenticated;

revoke all
on public.reviews
from anon, authenticated;

grant select
on public.reviews
to anon, authenticated;