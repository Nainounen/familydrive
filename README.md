# FamilyDrive

Family car-sharing coordination app for 2 cars and 4 family members. Live dashboard, week calendar, approval flow for kids' requests.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Auth + Postgres + Realtime)

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project.

### 2. Configure the Site URL

In your Supabase project → **Authentication → URL Configuration**, set **Site URL** to:

```
http://localhost:3000
```

(Update to your production domain when you deploy.)

This ensures invite emails contain the correct link that redirects to `/auth/confirm`.

### 3. Apply the database schema

In **SQL Editor**, run the contents of `supabase/schema.sql`.

### 4. Invite the 4 family members

In Supabase → **Authentication → Users**, click **Invite user** for each family member:

| Name | Email              | Role   | Avatar Color |
|------|--------------------|--------|--------------|
| Mama | mama@family.local  | parent | #f97316      |
| Papa | papa@family.local  | parent | #3b82f6      |
| Emma | emma@family.local  | kid    | #a855f7      |
| Leon | leon@family.local  | kid    | #22c55e      |

Each person receives an email with a link. When they click it they land on `/set-password` and choose their own password.

> **Note:** The invite links are valid for 24 hours by default. You can resend from the dashboard if they expire.

### 5. Seed the database

After inviting, copy the UUIDs from the **Users** table in the Supabase dashboard.

Open `supabase/seed.sql` and replace the four UUID placeholders:

```sql
uuid_mama := 'REPLACE_WITH_MAMA_UUID';
uuid_papa := 'REPLACE_WITH_PAPA_UUID';
uuid_emma := 'REPLACE_WITH_EMMA_UUID';
uuid_leon := 'REPLACE_WITH_LEON_UUID';
```

Then run the updated file in the SQL Editor.

> You can seed before or after users accept their invites — the profile rows will be waiting for them either way.

### 6. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your project credentials (found in **Settings → API**):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 7. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the invite flow works

1. Admin clicks **Invite** in Supabase dashboard → email sent to family member
2. Family member clicks the link → lands on `/set-password`
3. They choose their own password → redirected to `/dashboard`
4. Done — no shared passwords, everyone sets their own

The `/auth/confirm` route handler exchanges the Supabase invite token for a session before redirecting to `/set-password`.

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
- **Middleware** (`middleware.ts`) protects all app routes; `/login`, `/set-password`, and `/api/auth/*` are public
- **RLS policies** enforce data access at the database level: kids can't approve reservations, users can only edit their own data
- **Realtime:** Dashboard subscribes to `postgres_changes` on `reservations` table and re-fetches on any change, also calling `router.refresh()` to update the pending badge

---

## Project structure

```
app/
├── (auth)/
│   ├── login/            # Login page
│   └── set-password/     # Password setup after invite
├── api/auth/confirm/     # Supabase invite token exchange
├── (app)/                # Protected app shell
│   ├── layout.tsx        # Sidebar + mobile nav
│   ├── dashboard/        # Car status cards
│   ├── calendar/         # Week view
│   ├── reservations/     # My bookings
│   └── requests/         # Parent approval queue
└── actions/              # Server actions (auth, reservations)
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
