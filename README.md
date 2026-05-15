# FamilyDrive

Family car-sharing coordination app for 2 cars and 4 family members. Live dashboard, week calendar, approval flow for kids' requests.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Auth + Postgres + Realtime)

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project.

### 2. Apply the database schema

In your Supabase project → **SQL Editor**, run the contents of `supabase/schema.sql`.

### 3. Create the 4 family member accounts

In Supabase → **Authentication → Users**, create the following users (check "Auto Confirm User"):

| Name | Email              | Password    | Role   | Avatar Color |
|------|--------------------|-------------|--------|--------------|
| Mama | mama@family.local  | Family2024! | parent | #f97316      |
| Papa | papa@family.local  | Family2024! | parent | #3b82f6      |
| Emma | emma@family.local  | Family2024! | kid    | #a855f7      |
| Leon | leon@family.local  | Family2024! | kid    | #22c55e      |

### 4. Seed the database

After creating auth users, copy their UUIDs from the **Users** table in the Supabase dashboard.

Open `supabase/seed.sql` and replace the four UUID placeholders:

```
uuid_mama := 'REPLACE_WITH_MAMA_UUID';
uuid_papa := 'REPLACE_WITH_PAPA_UUID';
uuid_emma := 'REPLACE_WITH_EMMA_UUID';
uuid_leon := 'REPLACE_WITH_LEON_UUID';
```

Then run the updated `seed.sql` in the SQL Editor.

### 5. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key (found in **Settings → API**):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with one of the family member accounts above.

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Live status of both cars (Available / Reserved / In Use), real-time via Supabase Realtime |
| **Calendar** | Week view, color-coded by family member, click any slot to create a reservation |
| **My Reservations** | Upcoming and past bookings, cancel pending/approved ones |
| **Requests** | Parents-only — approve or reject pending kid requests, with badge count in nav |

---

## Architecture notes

- **Server Components** fetch initial data server-side for fast first loads
- **Client Components** handle interactivity and Supabase Realtime subscriptions
- **Server Actions** (`app/actions/`) run on the server: conflict detection, role-based auto-approval, status updates
- **Middleware** (`middleware.ts`) protects all `/dashboard`, `/calendar`, `/reservations`, `/requests` routes — redirects unauthenticated users to `/login`
- **RLS policies** enforce data access at the database level: kids can't approve reservations, users can only edit their own data
- **Realtime:** Dashboard subscribes to `postgres_changes` on `reservations` table and re-fetches on any change, also calling `router.refresh()` to update the pending badge in the server layout

---

## Project structure

```
app/
├── (auth)/login/         # Login page
├── (app)/                # Protected app shell
│   ├── layout.tsx        # Sidebar + mobile nav
│   ├── dashboard/        # Car status cards
│   ├── calendar/         # Week view
│   ├── reservations/     # My bookings
│   └── requests/         # Parent approval queue
└── actions/              # Server actions
components/
├── ui/                   # Avatar, Badge
├── layout/               # Sidebar, MobileNav
├── dashboard/            # CarsGrid, CarStatusCard
├── calendar/             # WeekCalendar, CalendarEvent, NewReservationModal
├── reservations/         # ReservationCard
└── requests/             # RequestCard
lib/
├── supabase/             # client.ts, server.ts
├── types.ts
├── constants.ts
└── utils.ts
supabase/
├── schema.sql            # DDL + RLS policies
└── seed.sql              # 4 family members, 2 cars, sample data
```
