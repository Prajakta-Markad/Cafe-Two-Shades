-- ============================================================
-- CAFE TWO SHADES
-- CUSTOMER PHOTO STORAGE
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'customer-submissions',
  'customer-submissions',
  false,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (
  id
)
do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


-- ============================================================
-- NO PUBLIC STORAGE POLICIES
--
-- The Edge Functions use the service role.
--
-- This prevents anonymous users from:
--
-- - browsing submissions
-- - downloading pending images
-- - deleting images
-- - overwriting images
-- - manipulating storage directly
-- ============================================================

drop policy if exists
  "Public can access customer submissions"
on storage.objects;

drop policy if exists
  "Anonymous users can upload customer submissions"
on storage.objects;

drop policy if exists
  "Authenticated users can upload customer submissions"
on storage.objects;