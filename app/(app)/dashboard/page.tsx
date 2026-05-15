import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CarsGrid } from '@/components/dashboard/cars-grid'
import type { Car, Reservation, UserProfile } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: cars }, { data: profile }, { data: reservations }] = await Promise.all([
    supabase.from('cars').select('*').order('created_at'),
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('reservations')
      .select('*, user:users(id, display_name, avatar_color, role, created_at)')
      .in('status', ['approved', 'active', 'pending'])
      .gte('end_time', new Date().toISOString())
      .order('start_time'),
  ])

  if (!profile) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-surface-400 mt-1">
          Hallo {profile.display_name} — hier ist der aktuelle Stand.
        </p>
      </div>

      <CarsGrid
        cars={(cars as Car[]) ?? []}
        initialReservations={(reservations as (Reservation & { user: UserProfile })[]) ?? []}
        currentUser={profile as UserProfile}
      />
    </div>
  )
}
