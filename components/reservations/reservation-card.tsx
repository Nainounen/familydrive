'use client'

import { useTransition } from 'react'
import { Loader2, X } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badge'
import { cancelReservation } from '@/app/actions/reservations'
import { formatDateRange } from '@/lib/utils'
import type { Reservation, Car } from '@/lib/types'

interface ReservationCardProps {
  reservation: Reservation & { car?: Car }
  canCancel?: boolean
}

export function ReservationCard({ reservation, canCancel }: ReservationCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    startTransition(async () => {
      await cancelReservation(reservation.id)
    })
  }

  const car = reservation.car

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-surface-800 border border-surface-700">
      {car && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
          style={{ backgroundColor: car.color + '22' }}
        >
          {car.emoji}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white">{car?.name ?? 'Unbekannt'}</p>
          <StatusBadge status={reservation.status} />
        </div>
        <p className="text-xs text-surface-400 mt-0.5">
          {formatDateRange(reservation.start_time, reservation.end_time)}
        </p>
        {reservation.note && (
          <p className="text-xs text-surface-300 mt-1 italic">"{reservation.note}"</p>
        )}
      </div>

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50 transition-colors flex-shrink-0"
          title="Stornieren"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}
