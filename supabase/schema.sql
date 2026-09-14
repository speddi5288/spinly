-- Spinly database setup. Run once in the Supabase SQL editor.
-- Later changes go in separate numbered files; do not rerun this script.

begin;

-- Shared helpers ------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Ingredients: 1-50 objects of { name: text, amount: number > 0, unit }.
create function public.is_valid_ingredient_list(items jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  item jsonb;
begin
  if items is null or jsonb_typeof(items) <> 'array' then
    return false;
  end if;
  if jsonb_array_length(items) not between 1 and 50 then
    return false;
  end if;
  for item in select value from jsonb_array_elements(items) loop
    -- Type checks first, so the casts below never see the wrong type.
    if jsonb_typeof(item) <> 'object'
      or coalesce(jsonb_typeof(item -> 'name'), '') <> 'string'
      or coalesce(jsonb_typeof(item -> 'amount'), '') <> 'number'
      or coalesce(jsonb_typeof(item -> 'unit'), '') <> 'string' then
      return false;
    end if;
    if char_length(btrim(item ->> 'name')) not between 1 and 100
      or (item ->> 'amount')::numeric <= 0
      or (item ->> 'amount')::numeric > 10000
      or (item ->> 'unit') not in ('cup', 'tbsp', 'tsp', 'ml', 'g', 'oz', 'scoop', 'whole', 'pinch') then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

-- Steps: 1-40 non-blank strings of at most 1000 characters.
create function public.is_valid_step_list(items text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select items is not null
    and cardinality(items) between 1 and 40
    and not exists (
      select 1 from unnest(items) as step
      where step is null or char_length(btrim(step)) not between 1 and 1000
    )
$$;

-- Recipes -------------------------------------------------------------------

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  image_url text check (image_url is null or (char_length(image_url) <= 2000 and image_url ~* '^https?://\S+$')),
  tub_size_oz smallint not null default 16 check (tub_size_oz in (16, 24)),
  program text not null check (program in (
    'ice_cream', 'lite_ice_cream', 'sorbet', 'gelato', 'milkshake', 'smoothie_bowl',
    'frozen_yogurt', 'italian_ice', 'creamiccino', 'frozen_drink', 'slushi', 'soft_serve',
    'soft_serve_lite', 'fruit_whip', 'frozen_custard', 'soft_frozen_yogurt', 'creamifit', 'mix_in'
  )),
  freeze_time_hours numeric not null default 24 check (freeze_time_hours between 1 and 168),
  freeze_note text not null default '' check (char_length(freeze_note) <= 300),
  respin_note text not null default '' check (char_length(respin_note) <= 300),
  -- Nutrition for the whole tub; macros in grams.
  calories numeric not null check (calories between 0 and 10000),
  protein numeric not null check (protein between 0 and 1000),
  carbs numeric not null check (carbs between 0 and 1000),
  fat numeric not null check (fat between 0 and 1000),
  ingredients jsonb not null check (public.is_valid_ingredient_list(ingredients)),
  steps text[] not null check (public.is_valid_step_list(steps))
);

create index recipes_created_at_idx on public.recipes (created_at desc);
create index recipes_user_id_idx on public.recipes (user_id);

alter table public.recipes enable row level security;

-- Supabase grants everything to anon/authenticated by default; start from nothing.
revoke all on table public.recipes from anon, authenticated;
grant select on table public.recipes to anon, authenticated;
-- id, user_id and created_at come from defaults and can never be written by clients.
grant insert (
  title, description, image_url, tub_size_oz, program, freeze_time_hours, freeze_note,
  respin_note, calories, protein, carbs, fat, ingredients, steps
) on table public.recipes to authenticated;
grant update (
  title, description, image_url, tub_size_oz, program, freeze_time_hours, freeze_note,
  respin_note, calories, protein, carbs, fat, ingredients, steps
) on table public.recipes to authenticated;
grant delete on table public.recipes to authenticated;

create policy "Anyone can read recipes"
  on public.recipes for select
  to anon, authenticated
  using (true);

create policy "Users add their own recipes"
  on public.recipes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners update their recipes"
  on public.recipes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owners delete their recipes"
  on public.recipes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Per-person data (synced from the browser) ---------------------------------

create table public.profiles (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  machine text check (machine is null or machine in ('nc301', 'nc501', 'nc701')),
  units text not null default 'us' check (units in ('us', 'metric')),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- recipe_id is text: starter recipes use slugs, community recipes use uuids.
create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id text not null check (char_length(recipe_id) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.pint_log (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id text not null check (char_length(recipe_id) between 1 and 100),
  recipe_title text not null default '' check (char_length(recipe_title) <= 200),
  frozen_at timestamptz not null,
  ready_at timestamptz not null,
  spun_at timestamptz,
  rating smallint check (rating is null or rating between 1 and 5),
  notes text not null default '' check (char_length(notes) <= 2000),
  updated_at timestamptz not null default now()
);

create index pint_log_user_id_idx on public.pint_log (user_id, frozen_at desc);

create trigger pint_log_set_updated_at
  before update on public.pint_log
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.pint_log enable row level security;

revoke all on table public.profiles, public.favorites, public.pint_log from anon, authenticated;
grant select, insert, update, delete on table public.profiles, public.favorites, public.pint_log to authenticated;

create policy "Owners read their profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Owners create their profile" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "Owners update their profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Owners delete their profile" on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

create policy "Owners read their favorites" on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Owners add favorites" on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Owners update favorites" on public.favorites for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owners remove favorites" on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners read their pints" on public.pint_log for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Owners log pints" on public.pint_log for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Owners update their pints" on public.pint_log for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owners remove their pints" on public.pint_log for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;
