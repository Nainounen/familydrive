import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RequestCard } from '@/components/requests/request-card'
import type { Reservation, UserProfile, Car } from '@/lib/types'

export default async function RequestsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'parent') redirect('/dashboard')

  const { data: pending } = await supabase
    .from('reservations')
    .select('*, user:users(id, display_name, avatar_color, role, created_at), car:cars(*)')
    .eq('status', 'pending')
    .order('created_at')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Anfragen</h1>
        <p className="text-sm text-surface-400 mt-1">
          Ausstehende Fahrzeuganfragen der Kinder.
        </p>
      </div>

      {pending && pending.length > 0 ? (
        <div className="space-y-3">
          {(pending as (Reservation & { user?: UserProfile; car?: Car })[]).map((r) => (
            <RequestCard key={r.id} reservation={r} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl bg-surface-800 border border-surface-700">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-sm font-medium text-white">Alles erledigt!</p>
          <p className="text-xs text-surface-400 mt-1">Keine ausstehenden Anfragen.</p>
        </div>
      )}
    </div>
  )
}
