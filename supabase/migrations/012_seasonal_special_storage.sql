-- ============================================================
-- SEASONAL SPECIAL IMAGE STORAGE
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'seasonal-specials',
  'seasonal-specials',
  true
)
on conflict (id)
do nothing;


-- Public may view seasonal-special images.
drop policy if exists
  "Public can view seasonal special images"
on storage.objects;

create policy
  "Public can view seasonal special images"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'seasonal-specials'
);


-- Admins can upload.
drop policy if exists
  "Active admins upload seasonal special images"
on storage.objects;

create policy
  "Active admins upload seasonal special images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'seasonal-specials'
  and public.is_active_admin()
);


-- Admins can update.
drop policy if exists
  "Active admins update seasonal special images"
on storage.objects;

create policy
  "Active admins update seasonal special images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'seasonal-specials'
  and public.is_active_admin()
)
with check (
  bucket_id = 'seasonal-specials'
  and public.is_active_admin()
);


-- Admins can delete.
drop policy if exists
  "Active admins delete seasonal special images"
on storage.objects;

create policy
  "Active admins delete seasonal special images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'seasonal-specials'
  and public.is_active_admin()
);