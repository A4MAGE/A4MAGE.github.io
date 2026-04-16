-- Profile table: one row per auth user, holds username + avatar.
-- Idempotent: safe to re-run. Won't drop or overwrite existing data.

create table if not exists profile (
  user_id uuid primary key references auth.users (id) on update cascade on delete cascade,
  username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill columns if the table existed with an older shape.
alter table profile add column if not exists username   text;
alter table profile add column if not exists avatar_url text;
alter table profile add column if not exists created_at timestamptz not null default now();
alter table profile add column if not exists updated_at timestamptz not null default now();

-- Usernames should be unique (case-insensitive) when set.
create unique index if not exists profile_username_unique
  on profile (lower(username))
  where username is not null;

-- RLS: anyone can read (so usernames/avatars show up in preset lists),
-- but users can only write their own row.
alter table profile enable row level security;

drop policy if exists "profile_public_read"    on profile;
drop policy if exists "profile_insert_own"     on profile;
drop policy if exists "profile_update_own"     on profile;

create policy "profile_public_read"
  on profile for select
  using (true);

create policy "profile_insert_own"
  on profile for insert
  with check (auth.uid() = user_id);

create policy "profile_update_own"
  on profile for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create a profile row on signup so every user has one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile (user_id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing users who don't have a profile row yet.
insert into public.profile (user_id, username)
select u.id, split_part(u.email, '@', 1)
from auth.users u
left join public.profile p on p.user_id = u.id
where p.user_id is null;


-- ============================================================
-- Storage bucket for avatars
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read for avatars, users can only write their own folder.
-- Path convention: <user_id>/<filename>
drop policy if exists "avatars_public_read"    on storage.objects;
drop policy if exists "avatars_insert_own"     on storage.objects;
drop policy if exists "avatars_update_own"     on storage.objects;
drop policy if exists "avatars_delete_own"     on storage.objects;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
