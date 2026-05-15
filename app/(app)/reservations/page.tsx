import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReservationCard } from '@/components/reservations/reservation-card'
import type { Reservation, Car } from '@/lib/types'

export default async function ReservationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date().toISOString()

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from('reservations')
      .select('*, car:cars(*)')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved', 'active'])
      .gte('end_time', now)
      .order('start_time'),
    supabase
      .from('reservations')
      .select('*, car:cars(*)')
      .eq('user_id', user.id)
      .or(`status.in.(completed,rejected),end_time.lt.${now}`)
      .order('start_time', { ascending: false })
      .limit(20),
  ])

  const canCancel = (r: Reservation) => ['pending', 'approved'].includes(r.status)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Meine Fahrten</h1>
        <p className="text-sm text-surface-400 mt-1">Alle deine Reservierungen im Überblick.</p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
          Kommende
        </h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-2">
            {(upcoming as (Reservation & { car: Car })[]).map((r) => (
              <ReservationCard key={r.id} reservation={r} canCancel={canCancel(r)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-500 py-4 text-center bg-surface-800 rounded-xl border border-surface-700">
            Keine kommenden Reservierungen.
          </p>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
          Vergangen
        </h2>
        {past && past.length > 0 ? (
          <div className="space-y-2">
            {(past as (Reservation & { car: Car })[]).map((r) => (
              <ReservationCard key={r.id} reservation={r} canCancel={false} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-500 py-4 text-center bg-surface-800 rounded-xl border border-surface-700">
            Noch keine vergangenen Fahrten.
          </p>
        )}
      </section>
    </div>
  )
}
