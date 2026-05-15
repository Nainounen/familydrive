import type { ReservationStatus } from './types'

export const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: 'Ausstehend',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.15)',
  },
  approved: {
    label: 'Genehmigt',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
  },
  rejected: {
    label: 'Abgelehnt',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
  },
  active: {
    label: 'In Fahrt',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
  },
  completed: {
    label: 'Abgeschlossen',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.15)',
  },
}

// Calendar time range: 07:00 – 22:00
export const CALENDAR_START_HOUR = 7
export const CALENDAR_END_HOUR = 22
export const CALENDAR_TOTAL_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60

export const TIME_OPTIONS: string[] = []
for (let h = 6; h <= 22; h++) {
  for (const m of [0, 15, 30, 45]) {
    if (h === 22 && m > 0) break
    TIME_OPTIONS.push(
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    )
  }
}
