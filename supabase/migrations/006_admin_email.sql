alter table public.admin_users
add column if not exists
  email text;

alter table public.admin_users
add constraint
  admin_users_email_check
check (
  email is null
  or char_length(email)
    between 3 and 254
);