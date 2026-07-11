-- Per-user photos attached to a recipe (catalog or AI-generated). One photo per
-- (user, recipe); upsert replaces it. Protected by row-level security.
create table if not exists public.recipe_photos (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id text not null,
  image_uri text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.recipe_photos enable row level security;

create policy "Recipe photos are viewable by their owner"
  on public.recipe_photos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recipe photos"
  on public.recipe_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipe photos"
  on public.recipe_photos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own recipe photos"
  on public.recipe_photos for delete
  using (auth.uid() = user_id);
