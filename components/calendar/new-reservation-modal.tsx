'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createReservation } from '@/app/actions/reservations'
import { TIME_OPTIONS } from '@/lib/constants'
import type { Car, UserProfile } from '@/lib/types'

interface NewReservationModalProps {
  cars: Car[]
  currentUser: UserProfile
  defaultCarId?: string
  defaultDate?: string
  defaultStartTime?: string
  onClose: () => void
  onSuccess?: () => void
}

export function NewReservationModal({
  cars,
  currentUser,
  defaultCarId,
  defaultDate,
  defaultStartTime,
  onClose,
  onSuccess,
}: NewReservationModalProps) {
  const [state, action, isPending] = useActionState(createReservation, { error: undefined })
  const formRef = useRef<HTMLFormElement>(null)
  const [startTime, setStartTime] = useState(defaultStartTime ?? '08:00')
  const [endTime, setEndTime] = useState(() => {
    if (defaultStartTime) {
      const [h, m] = defaultStartTime.split(':').map(Number)
      const endH = h + 1 > 22 ? 22 : h + 1
      return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    return '09:00'
  })

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(defaultDate ?? today)

  const [submitted, setSubmitted] = useState(false)
  useEffect(() => {
    if (isPending) {
      setSubmitted(true)
    }
    if (submitted && !isPending && !state?.error) {
      onSuccess?.()
      onClose()
    }
  }, [state, isPending, submitted, onClose, onSuccess])

  const isParent = currentUser.role === 'parent'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-surface-800 border border-surface-600 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <div>
            <h2 className="text-base font-semibold text-white">Reservierung anfragen</h2>
            {!isParent && (
              <p className="text-xs text-surface-400 mt-0.5">
                Eltern müssen deine Anfrage genehmigen.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} action={action} className="p-5 space-y-4">
          {/* Car selector */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">Fahrzeug</label>
            <select
              name="car_id"
              defaultValue={defaultCarId ?? ''}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-surface-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400"
            >
              <option value="" disabled>
                Fahrzeug wählen
              </option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.emoji} {car.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">Datum</label>
            <input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-surface-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 [color-scheme:dark]"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-200">Von</label>
              <select
                name="start_time_raw"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-surface-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t} Uhr
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-200">Bis</label>
              <select
                name="end_time_raw"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-surface-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t} Uhr
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hidden ISO datetime fields */}
          <input
            type="hidden"
            name="start_time"
            value={`${date}T${startTime}:00`}
          />
          <input
            type="hidden"
            name="end_time"
            value={`${date}T${endTime}:00`}
          />

          {/* Note */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">
              Notiz <span className="text-surface-400">(optional)</span>
            </label>
            <textarea
              name="note"
              rows={2}
              placeholder="z. B. Einkaufen, Arzttermin…"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-2.5">
              {state.error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-surface-600 text-surface-200 text-sm font-medium hover:bg-surface-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-surface-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Senden…
                </>
              ) : isParent ? (
                'Reservieren'
              ) : (
                'Anfragen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
