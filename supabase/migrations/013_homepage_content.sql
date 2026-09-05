-- ============================================================
-- CAFE TWO SHADES
-- HOMEPAGE CONTENT
-- GOOGLE REVIEWS + CUSTOMER PHOTO GALLERY
-- ============================================================


-- ============================================================
-- GOOGLE REVIEWS
-- ============================================================

create table if not exists public.google_reviews (
  id uuid primary key
    default gen_random_uuid(),

  reviewer_name text not null,

  review_text text not null,

  rating smallint not null,

  source text not null
    default 'Google Reviews',

  display_order integer not null
    default 0,

  is_visible boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint google_review_name_check
    check (
      char_length(trim(reviewer_name))
      between 1 and 150
    ),

  constraint google_review_text_check
    check (
      char_length(trim(review_text))
      between 1 and 3000
    ),

  constraint google_review_rating_check
    check (
      rating between 1 and 5
    )
);


create index if not exists
  google_reviews_visible_order_idx
on public.google_reviews (
  is_visible,
  display_order
);


drop trigger if exists
  google_reviews_set_updated_at
on public.google_reviews;

create trigger
  google_reviews_set_updated_at
before update on public.google_reviews
for each row
execute function public.set_updated_at();


alter table public.google_reviews
enable row level security;


drop policy if exists
  "Public can read visible Google reviews"
on public.google_reviews;

create policy
  "Public can read visible Google reviews"
on public.google_reviews
for select
to anon, authenticated
using (
  is_visible = true
);


drop policy if exists
  "Active admins manage Google reviews"
on public.google_reviews;

create policy
  "Active admins manage Google reviews"
on public.google_reviews
for all
to authenticated
using (
  public.is_active_admin()
)
with check (
  public.is_active_admin()
);


-- ============================================================
-- CUSTOMER PHOTO SUBMISSIONS
-- ============================================================

create table if not exists public.customer_photos (
  id uuid primary key
    default gen_random_uuid(),

  image_path text not null unique,

  status text not null
    default 'pending',

  display_order integer not null
    default 0,

  submitted_at timestamptz not null
    default now(),

  reviewed_at timestamptz,

  constraint customer_photo_status_check
    check (
      status in (
        'pending',
        'approved',
        'rejected'
      )
    )
);


create index if not exists
  customer_photos_status_order_idx
on public.customer_photos (
  status,
  display_order
);


create index if not exists
  customer_photos_submitted_idx
on public.customer_photos (
  submitted_at
);


alter table public.customer_photos
enable row level security;


-- Public may only see approved submissions.
drop policy if exists
  "Public can read approved customer photos"
on public.customer_photos;

create policy
  "Public can read approved customer photos"
on public.customer_photos
for select
to anon, authenticated
using (
  status = 'approved'
);


-- Admins manage moderation.
drop policy if exists
  "Active admins manage customer photos"
on public.customer_photos;

create policy
  "Active admins manage customer photos"
on public.customer_photos
for all
to authenticated
using (
  public.is_active_admin()
)
with check (
  public.is_active_admin()
);


-- ============================================================
-- CUSTOMER PHOTO STORAGE
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'customer-photos',
  'customer-photos',
  true
)
on conflict (id)
do nothing;


-- Public can view approved gallery images.
drop policy if exists
  "Public can view customer gallery images"
on storage.objects;

create policy
  "Public can view customer gallery images"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'customer-photos'
  and exists (
    select 1
    from public.customer_photos
    where customer_photos.image_path =
          storage.objects.name
      and customer_photos.status =
          'approved'
  )
);


-- Anonymous users may submit images.
--
-- IMPORTANT:
-- This policy deliberately allows INSERT only.
-- Anonymous users cannot read, update or delete
-- submissions through the database.
drop policy if exists
  "Anonymous users can submit customer photos"
on storage.objects;

create policy
  "Anonymous users can submit customer photos"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'customer-photos'
);


-- Authenticated admins can upload/manage gallery images.
drop policy if exists
  "Active admins manage customer gallery images"
on storage.objects;

create policy
  "Active admins manage customer gallery images"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'customer-photos'
  and public.is_active_admin()
)
with check (
  bucket_id = 'customer-photos'
  and public.is_active_admin()
);