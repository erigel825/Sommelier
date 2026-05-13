-- User preferences: one row per authenticated user
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  likes    text[]  not null default '{}',
  dislikes text[]  not null default '{}',
  budget   text    not null default 'any',
  notes    text    not null default '',
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "owner_all" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cellar: wine entries per user
create table public.cellar (
  id       uuid    primary key default gen_random_uuid(),
  user_id  uuid    not null references auth.users(id) on delete cascade,
  name     text    not null,
  varietal text,
  region   text,
  vintage  text,
  rating   text    not null check (rating in ('loved', 'liked', 'ok', 'disliked')),
  notes    text,
  added_at bigint  not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.cellar enable row level security;

create policy "owner_all" on public.cellar
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index cellar_user_idx on public.cellar (user_id, added_at desc);
