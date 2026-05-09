-- Laborbuch — Supabase schema
-- Run in the Supabase SQL editor on a fresh project.

-- Profiles: 1:1 with auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Machines (admin-managed via dashboard)
create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Reservations: one row per (machine, date, hour). Anyone can see, only owner can write.
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  slot_date date not null,
  slot_hour smallint not null check (slot_hour between 0 and 23),
  created_at timestamptz not null default now(),
  unique (machine_id, slot_date, slot_hour)
);

create index if not exists reservations_machine_date_idx
  on public.reservations (machine_id, slot_date);

create index if not exists reservations_user_idx
  on public.reservations (user_id, slot_date);

-- Comments per machine
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists comments_machine_idx
  on public.comments (machine_id, created_at desc);

-- Per-user favorites
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  machine_id uuid not null references public.machines(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, machine_id)
);

-- Row level security
alter table public.profiles      enable row level security;
alter table public.machines      enable row level security;
alter table public.reservations  enable row level security;
alter table public.comments      enable row level security;
alter table public.favorites     enable row level security;

-- profiles: any authenticated user can read; only the owner can update.
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- machines: read-only for users, edit via service role / dashboard.
drop policy if exists "machines read" on public.machines;
create policy "machines read" on public.machines
  for select to authenticated using (true);

-- reservations: anyone can read; only owner can insert/delete their own.
drop policy if exists "reservations read" on public.reservations;
create policy "reservations read" on public.reservations
  for select to authenticated using (true);

drop policy if exists "reservations insert own" on public.reservations;
create policy "reservations insert own" on public.reservations
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "reservations delete own" on public.reservations;
create policy "reservations delete own" on public.reservations
  for delete to authenticated using (auth.uid() = user_id);

-- comments: anyone can read; only owner can insert/delete their own.
drop policy if exists "comments read" on public.comments;
create policy "comments read" on public.comments
  for select to authenticated using (true);

drop policy if exists "comments insert own" on public.comments;
create policy "comments insert own" on public.comments
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "comments delete own" on public.comments;
create policy "comments delete own" on public.comments
  for delete to authenticated using (auth.uid() = user_id);

-- favorites: each user manages their own.
drop policy if exists "favorites read own" on public.favorites;
create policy "favorites read own" on public.favorites
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "favorites insert own" on public.favorites;
create policy "favorites insert own" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "favorites delete own" on public.favorites;
create policy "favorites delete own" on public.favorites
  for delete to authenticated using (auth.uid() = user_id);

-- Seed: example machines (delete or extend in Supabase dashboard)
insert into public.machines (name, description, sort_order) values
  ('ZSK - Coperion', 'Food Extruder', 10),
  ('DFA100',         'Dynamic Foam Analyzer', 20)
on conflict do nothing;
