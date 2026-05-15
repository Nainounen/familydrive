'use client'

import { useState, useTransition } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { updateReservationStatus } from '@/app/actions/reservations'
import { formatDateRange } from '@/lib/utils'
import type { Reservation, UserProfile, Car } from '@/lib/types'

interface RequestCardProps {
  reservation: Reservation & { user?: UserProfile; car?: Car }
}

export function RequestCard({ reservation }: RequestCardProps) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handle = (status: 'approved' | 'rejected') => {
    setAction(status === 'approved' ? 'approve' : 'reject')
    startTransition(async () => {
      await updateReservationStatus(reservation.id, status)
    })
  }

  const user = reservation.user
  const car = reservation.car

  return (
    <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-surface-800 border border-surface-700">
      {user && (
        <Avatar name={user.display_name} color={user.avatar_color} size="md" className="mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-white">
              {user?.display_name}
              <span className="text-surface-400 font-normal"> möchte </span>
              {car?.emoji} {car?.name}
            </p>
            <p className="text-xs text-surface-400 mt-0.5">
              {formatDateRange(reservation.start_time, reservation.end_time)}
            </p>
          </div>
        </div>

        {reservation.note && (
          <p className="text-xs text-surface-300 mt-2 italic bg-surface-700 rounded-lg px-2.5 py-1.5">
            "{reservation.note}"
          </p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handle('approved')}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 transition-colors border border-green-500/30"
          >
            {isPending && action === 'approve' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Genehmigen
          </button>
          <button
            onClick={() => handle('rejected')}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors border border-red-500/30"
          >
            {isPending && action === 'reject' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            Ablehnen
          </button>
        </div>
      </div>
    </div>
  )
}
