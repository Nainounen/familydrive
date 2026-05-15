-- FamilyDrive Seed Data
--
-- BEFORE RUNNING THIS FILE:
-- 1. Invite 4 users via Supabase Dashboard → Authentication → Users → Invite user
-- 2. Copy the UUIDs from the Users table and replace the placeholders below.
-- 3. Run schema.sql first, then this file.

-- ============================================================
-- REPLACE THESE UUIDs WITH YOUR ACTUAL AUTH USER IDs
-- ============================================================
do $$
declare
  uuid_mama uuid := 'REPLACE_WITH_MAMA_UUID';
  uuid_papa uuid := 'REPLACE_WITH_PAPA_UUID';
  uuid_emma uuid := 'REPLACE_WITH_EMMA_UUID';
  uuid_leon uuid := 'REPLACE_WITH_LEON_UUID';
  id_nissan uuid := gen_random_uuid();
  id_gr86   uuid := gen_random_uuid();
begin

-- ============================================================
-- USER PROFILES
-- ============================================================
insert into public.users (id, display_name, avatar_color, role) values
  (uuid_mama, 'Mama', '#f97316', 'parent'),
  (uuid_papa, 'Papa', '#3b82f6', 'parent'),
  (uuid_emma, 'Emma', '#a855f7', 'kid'),
  (uuid_leon, 'Leon', '#22c55e', 'kid');

-- ============================================================
-- CARS
-- The `emoji` column stores an image path when it starts with `/`.
-- ============================================================
insert into public.cars (id, name, color, emoji, owner_id) values
  (id_nissan, 'Nissan', '#1a6bba', '/cars/nissan.png', uuid_mama),
  (id_gr86,   'GR86',   '#cc2200', '/cars/gr86.png',   uuid_papa);

-- ============================================================
-- SAMPLE RESERVATIONS
-- ============================================================

-- Papa: approved booking tomorrow morning (GR86)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_gr86, uuid_papa,
   now() + interval '1 day 8 hours',
   now() + interval '1 day 11 hours',
   'approved', 'Einkaufen');

-- Emma: pending booking this weekend (Nissan)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_nissan, uuid_emma,
   date_trunc('week', now()) + interval '5 days 14 hours',
   date_trunc('week', now()) + interval '5 days 18 hours',
   'pending', 'Kino mit Freunden');

-- Leon: pending booking this weekend (GR86)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_gr86, uuid_leon,
   date_trunc('week', now()) + interval '5 days 10 hours',
   date_trunc('week', now()) + interval '5 days 13 hours',
   'pending', 'Training');

-- Mama: completed booking yesterday (Nissan)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_nissan, uuid_mama,
   now() - interval '1 day 3 hours',
   now() - interval '1 day 1 hour',
   'completed', null);

-- Papa: approved booking next week (Nissan)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_nissan, uuid_papa,
   now() + interval '5 days 9 hours',
   now() + interval '5 days 12 hours',
   'approved', 'Arzttermin');

end $$;
