'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CalendarEvent } from './calendar-event'
import { NewReservationModal } from './new-reservation-modal'
import {
  getWeekStart,
  addDays,
  isSameDay,
  timeToPercent,
  durationToPercent,
} from '@/lib/utils'
import { CALENDAR_START_HOUR, CALENDAR_END_HOUR } from '@/lib/constants'
import type { Reservation, UserProfile, Car } from '@/lib/types'

const HOUR_LABELS = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR + 1 },
  (_, i) => CALENDAR_START_HOUR + i
)

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

interface WeekCalendarProps {
  initialReservations: (Reservation & { user?: UserProfile; car?: Car })[]
  cars: Car[]
  currentUser: UserProfile
}

export function WeekCalendar({ initialReservations, cars, currentUser }: WeekCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [reservations, setReservations] =
    useState<(Reservation & { user?: UserProfile; car?: Car })[]>(initialReservations)
  const [modal, setModal] = useState<{
    defaultDate?: string
    defaultStartTime?: string
    defaultCarId?: string
  } | null>(null)
  const supabase = createClient()

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const fetchWeek = useCallback(
    async (start: Date) => {
      const end = addDays(start, 7)
      const { data } = await supabase
        .from('reservations')
        .select('*, user:users(id, display_name, avatar_color, role, created_at), car:cars(*)')
        .in('status', ['approved', 'active', 'pending'])
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .order('start_time')
      setReservations(
        (data as (Reservation & { user?: UserProfile; car?: Car })[]) ?? []
      )
    },
    [supabase]
  )

  const goToPrevWeek = () => {
    const prev = addDays(weekStart, -7)
    setWeekStart(prev)
    fetchWeek(prev)
  }

  const goToNextWeek = () => {
    const next = addDays(weekStart, 7)
    setWeekStart(next)
    fetchWeek(next)
  }

  const goToToday = () => {
    const today = getWeekStart(new Date())
    setWeekStart(today)
    fetchWeek(today)
  }

  const handleSlotClick = (day: Date, hour: number) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
    setModal({
      defaultDate: dateStr,
      defaultStartTime: `${pad(hour)}:00`,
    })
  }

  const formatWeekLabel = () => {
    const end = addDays(weekStart, 6)
    const startStr = weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
    const endStr = end.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
    return `${startStr} – ${endStr}`
  }

  const today = new Date()

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white ml-1">{formatWeekLabel()}</span>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-white border border-surface-600 hover:bg-surface-700 transition-colors"
        >
          Heute
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-surface-700 overflow-hidden bg-surface-900">
        {/* Day headers */}
        <div className="grid border-b border-surface-700" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
          <div className="border-r border-surface-700" />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div
                key={i}
                className={`py-2 text-center border-r border-surface-700 last:border-r-0 ${
                  isToday ? 'bg-surface-800' : ''
                }`}
              >
                <p className={`text-[11px] font-medium ${isToday ? 'text-white' : 'text-surface-400'}`}>
                  {DAY_LABELS[i]}
                </p>
                <p
                  className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-surface-300'}`}
                >
                  {day.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div
          className="grid overflow-y-auto"
          style={{
            gridTemplateColumns: '48px repeat(7, 1fr)',
            maxHeight: '600px',
          }}
        >
          {/* Hours column */}
          <div className="border-r border-surface-700">
            {HOUR_LABELS.map((hour) => (
              <div
                key={hour}
                className="border-b border-surface-800 flex items-start justify-end pr-2 pt-1"
                style={{ height: '60px' }}
              >
                <span className="text-[10px] text-surface-500 font-medium">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const isToday = isSameDay(day, today)
            const dayReservations = reservations.filter((r) =>
              isSameDay(new Date(r.start_time), day)
            )

            return (
              <div
                key={dayIdx}
                className={`border-r border-surface-700 last:border-r-0 relative ${
                  isToday ? 'bg-surface-800/30' : ''
                }`}
              >
                {/* Hour slots */}
                {HOUR_LABELS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-surface-800 hover:bg-surface-700/30 cursor-pointer transition-colors"
                    style={{ height: '60px' }}
                    onClick={() => handleSlotClick(day, hour)}
                  />
                ))}

                {/* Events overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayReservations.map((r) => (
                    <div key={r.id} className="pointer-events-auto">
                      <CalendarEvent
                        reservation={r}
                        topPercent={timeToPercent(r.start_time)}
                        heightPercent={durationToPercent(r.start_time, r.end_time)}
                      />
                    </div>
                  ))}
                </div>

                {/* Current time indicator */}
                {isToday && (() => {
                  const nowPct = timeToPercent(new Date().toISOString())
                  if (nowPct <= 0 || nowPct >= 100) return null
                  return (
                    <div
                      className="absolute left-0 right-0 h-px bg-blue-500 z-10 pointer-events-none"
                      style={{ top: `${nowPct}%` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 -mt-0.5 -ml-1" />
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-surface-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-white/30" />
          Genehmigt
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-dashed border-white/50" />
          Ausstehend
        </div>
      </div>

      {modal && (
        <NewReservationModal
          cars={cars}
          currentUser={currentUser}
          defaultDate={modal.defaultDate}
          defaultStartTime={modal.defaultStartTime}
          defaultCarId={modal.defaultCarId}
          onClose={() => setModal(null)}
          onSuccess={() => fetchWeek(weekStart)}
        />
      )}
    </div>
  )
}
