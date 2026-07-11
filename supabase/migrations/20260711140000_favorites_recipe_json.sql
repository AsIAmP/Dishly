-- AI-generated recipes only exist at runtime, so a favorite pointing at one
-- (recipe_id like "ai-…") couldn't be reopened after a reload. Store the full
-- recipe JSON alongside the favorite so it can be rehydrated.
alter table public.favorites add column if not exists recipe_json jsonb;
