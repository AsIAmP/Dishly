-- Dishly initial schema: per-user onboarding preferences + favorites.
-- Both tables are protected by row-level security so a user can only ever
-- read/write their own rows.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, holding onboarding answers.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  skill text,
  dietary text[] not null default '{}',
  allergens text[] not null default '{}',
  onboarding_completed boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- favorites: saved recipes AND captured photos (one collection, per design).
-- recipe_id references the app's recipe catalog / generated recipes (text id,
-- not a DB row); image_uri holds captured-photo data URLs.
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('recipe', 'photo')),
  title text not null,
  recipe_id text,
  caption text,
  image_uri text,
  created_at timestamptz not null default now()
);

create index if not exists favorites_user_id_created_idx
  on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

create policy "Favorites are viewable by their owner"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own favorites"
  on public.favorites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
