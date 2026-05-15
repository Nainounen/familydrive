import type { Car, Reservation, CarWithStatus, UserProfile } from './types'
import { CALENDAR_START_HOUR, CALENDAR_TOTAL_MINUTES } from './constants'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()

  const dateStr = s.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
  const startTime = s.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const endTime = e.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  if (sameDay) return `${dateStr}, ${startTime}–${endTime}`
  return `${dateStr} ${startTime} – ${formatDate(end)} ${endTime}`
}

export function getCarStatus(
  car: Car,
  reservations: (Reservation & { user?: UserProfile })[]
): CarWithStatus {
  const now = new Date()
  const carRes = reservations
    .filter((r) => r.car_id === car.id && ['approved', 'active'].includes(r.status))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const active = carRes.find(
    (r) => new Date(r.start_time) <= now && new Date(r.end_time) > now
  )

  if (active) {
    return {
      ...car,
      liveStatus: 'in-use',
      activeReservation: active as CarWithStatus['activeReservation'],
    }
  }

  const next = carRes.find((r) => new Date(r.start_time) > now)
  if (next) {
    return {
      ...car,
      liveStatus: 'reserved',
      nextReservation: next as CarWithStatus['nextReservation'],
    }
  }

  return { ...car, liveStatus: 'available' }
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Monday = 0
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Convert a datetime to % offset within the calendar day grid */
export function timeToPercent(iso: string): number {
  const d = new Date(iso)
  const minutesFromStart =
    (d.getHours() - CALENDAR_START_HOUR) * 60 + d.getMinutes()
  return Math.max(0, (minutesFromStart / CALENDAR_TOTAL_MINUTES) * 100)
}

export function durationToPercent(start: string, end: string): number {
  const durationMin =
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  return Math.min(100, (durationMin / CALENDAR_TOTAL_MINUTES) * 100)
}

export function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
