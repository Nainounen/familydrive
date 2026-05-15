import { formatTime } from '@/lib/utils'
import type { Reservation, UserProfile, Car } from '@/lib/types'

interface CalendarEventProps {
  reservation: Reservation & { user?: UserProfile; car?: Car }
  topPercent: number
  heightPercent: number
}

export function CalendarEvent({ reservation, topPercent, heightPercent }: CalendarEventProps) {
  const user = reservation.user
  const isPending = reservation.status === 'pending'
  const isShort = heightPercent < 8

  return (
    <div
      className="absolute left-0.5 right-0.5 rounded-md px-1.5 overflow-hidden select-none"
      style={{
        top: `${topPercent}%`,
        height: `${Math.max(heightPercent, 4)}%`,
        backgroundColor: user ? user.avatar_color + 'cc' : '#6b7280cc',
        border: isPending ? `1.5px dashed ${user?.avatar_color ?? '#6b7280'}` : 'none',
        minHeight: '22px',
      }}
      title={`${user?.display_name ?? 'Unbekannt'} · ${reservation.car?.name ?? ''} · ${formatTime(reservation.start_time)}–${formatTime(reservation.end_time)}${reservation.note ? ' · ' + reservation.note : ''}`}
    >
      {!isShort && (
        <div className="flex flex-col h-full justify-start pt-0.5">
          <p className="text-white text-[10px] font-semibold leading-tight truncate">
            {reservation.car?.emoji.startsWith('/') ? '🚗' : reservation.car?.emoji}{' '}
            {user?.display_name}
          </p>
          {heightPercent > 10 && (
            <p className="text-white/80 text-[9px] leading-tight truncate">
              {formatTime(reservation.start_time)}–{formatTime(reservation.end_time)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
