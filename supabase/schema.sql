-- FamilyDrive Schema
-- Run this in the Supabase SQL editor before seeding.

-- ============================================================
-- TABLES
-- ============================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_color text not null,
  role text not null check (role in ('parent', 'kid')),
  created_at timestamptz default now()
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  emoji text not null,
  owner_id uuid references public.users(id),
  created_at timestamptz default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'active', 'completed')),
  note text,
  created_at timestamptz default now(),
  constraint no_time_travel check (end_time > start_time)
);

-- Index for fast conflict-detection queries
create index reservations_car_time_idx
  on public.reservations (car_id, start_time, end_time)
  where status in ('approved', 'active');

create index reservations_status_idx on public.reservations (status);

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table public.reservations;
alter publication supabase_realtime add table public.cars;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ----- users -----
alter table public.users enable row level security;

create policy "Authenticated users can read all profiles"
  on public.users for select
  to authenticated
  using (true);

create policy "Users can insert own profile"
  on public.users for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ----- cars -----
alter table public.cars enable row level security;

create policy "Authenticated users can read cars"
  on public.cars for select
  to authenticated
  using (true);

-- ----- reservations -----
alter table public.reservations enable row level security;

create policy "Authenticated users can read all reservations"
  on public.reservations for select
  to authenticated
  using (true);

create policy "Users can create own reservations"
  on public.reservations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users or parents can update reservations"
  on public.reservations for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.users
      where id = (select auth.uid()) and role = 'parent'
    )
  )
  with check (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.users
      where id = (select auth.uid()) and role = 'parent'
    )
  );

create policy "Users can delete own reservations"
  on public.reservations for delete
  to authenticated
  using ((select auth.uid()) = user_id);
