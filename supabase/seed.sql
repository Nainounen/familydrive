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
  uuid_nadja uuid := 'REPLACE_WITH_nadja_UUID';
  uuid_marco uuid := 'REPLACE_WITH_marco_UUID';
  uuid_raja uuid := 'REPLACE_WITH_raja_UUID';
  uuid_nino uuid := 'REPLACE_WITH_nino_UUID';
  id_nissan uuid := gen_random_uuid();
  id_gr86   uuid := gen_random_uuid();
begin

-- ============================================================
-- USER PROFILES
-- ============================================================
insert into public.users (id, display_name, avatar_color, role) values
  (uuid_nadja, 'Nadja', '#f97316', 'parent'),
  (uuid_marco, 'Marco', '#3b82f6', 'parent'),
  (uuid_raja, 'Raja', '#a855f7', 'kid'),
  (uuid_nino, 'Nino', '#22c55e', 'kid');

-- ============================================================
-- CARS
-- The `emoji` column stores an image path when it starts with `/`.
-- ============================================================
insert into public.cars (id, name, color, emoji, owner_id) values
  (id_nissan, 'Nissan', '#1a6bba', '/cars/nissan.png', uuid_nadja),
  (id_gr86,   'GR86',   '#cc2200', '/cars/gr86.png',   uuid_marco);

-- ============================================================
-- SAMPLE RESERVATIONS
-- ============================================================

-- marco: approved booking tomorrow morning (GR86)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_gr86, uuid_marco,
   now() + interval '1 day 8 hours',
   now() + interval '1 day 11 hours',
   'approved', 'Einkaufen');

-- raja: pending booking this weekend (Nissan)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_nissan, uuid_raja,
   date_trunc('week', now()) + interval '5 days 14 hours',
   date_trunc('week', now()) + interval '5 days 18 hours',
   'pending', 'Kino mit Freunden');

-- nino: pending booking this weekend (GR86)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_gr86, uuid_nino,
   date_trunc('week', now()) + interval '5 days 10 hours',
   date_trunc('week', now()) + interval '5 days 13 hours',
   'pending', 'Training');

-- nadja: completed booking yesterday (Nissan)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_nissan, uuid_nadja,
   now() - interval '1 day 3 hours',
   now() - interval '1 day 1 hour',
   'completed', null);

-- marco: approved booking next week (Nissan)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_nissan, uuid_marco,
   now() + interval '5 days 9 hours',
   now() + interval '5 days 12 hours',
   'approved', 'Arzttermin');

end $$;
