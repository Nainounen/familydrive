import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeekCalendar } from '@/components/calendar/week-calendar'
import { getWeekStart, addDays } from '@/lib/utils'
import type { Car, Reservation, UserProfile } from '@/lib/types'

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getWeekStart(new Date())
  const weekEnd = addDays(weekStart, 7)

  const [{ data: profile }, { data: cars }, { data: reservations }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('cars').select('*').order('created_at'),
    supabase
      .from('reservations')
      .select('*, user:users(id, display_name, avatar_color, role, created_at), car:cars(*)')
      .in('status', ['approved', 'active', 'pending'])
      .gte('start_time', weekStart.toISOString())
      .lte('end_time', weekEnd.toISOString())
      .order('start_time'),
  ])

  if (!profile) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Kalender</h1>
        <p className="text-sm text-surface-400 mt-1">
          Klicke auf einen Zeitslot, um eine Reservierung anzufragen.
        </p>
      </div>

      <WeekCalendar
        initialReservations={
          (reservations as (Reservation & { user?: UserProfile; car?: Car })[]) ?? []
        }
        cars={(cars as Car[]) ?? []}
        currentUser={profile as UserProfile}
      />
    </div>
  )
}
