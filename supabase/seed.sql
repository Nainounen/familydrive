-- FamilyDrive Seed Data
--
-- BEFORE RUNNING THIS FILE:
-- 1. Create 4 auth users in Supabase Dashboard → Authentication → Users → Add user
--    Use "Auto Confirm User" and set the passwords manually or via the CLI:
--
--    supabase auth admin create-user --email mama@family.local --password Family2024!
--    supabase auth admin create-user --email papa@family.local --password Family2024!
--    supabase auth admin create-user --email emma@family.local --password Family2024!
--    supabase auth admin create-user --email leon@family.local --password Family2024!
--
-- 2. Copy the UUIDs from the auth.users table and replace the placeholders below.
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
  id_golf uuid := gen_random_uuid();
  id_kombi uuid := gen_random_uuid();
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
-- ============================================================
insert into public.cars (id, name, color, emoji, owner_id) values
  (id_golf,  'Golf',  '#3b82f6', '🚗', uuid_papa),
  (id_kombi, 'Kombi', '#f97316', '🚙', uuid_mama);

-- ============================================================
-- SAMPLE RESERVATIONS
-- ============================================================

-- Papa: approved booking tomorrow morning (Golf)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_golf, uuid_papa,
   now() + interval '1 day 8 hours',
   now() + interval '1 day 11 hours',
   'approved', 'Einkaufen');

-- Emma: pending booking this weekend (Kombi)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_kombi, uuid_emma,
   date_trunc('week', now()) + interval '5 days 14 hours',
   date_trunc('week', now()) + interval '5 days 18 hours',
   'pending', 'Kino mit Freunden');

-- Leon: pending booking this weekend (Golf)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_golf, uuid_leon,
   date_trunc('week', now()) + interval '5 days 10 hours',
   date_trunc('week', now()) + interval '5 days 13 hours',
   'pending', 'Fussball Training');

-- Mama: completed booking yesterday (Kombi)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_kombi, uuid_mama,
   now() - interval '1 day 3 hours',
   now() - interval '1 day 1 hour',
   'completed', null);

-- Papa: approved booking next week (Kombi)
insert into public.reservations (car_id, user_id, start_time, end_time, status, note) values
  (id_kombi, uuid_papa,
   now() + interval '5 days 9 hours',
   now() + interval '5 days 12 hours',
   'approved', 'Arzttermin');

end $$;
