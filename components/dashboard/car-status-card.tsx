'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle, Clock, Car } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { NewReservationModal } from '@/components/calendar/new-reservation-modal'
import { formatTime, formatDate } from '@/lib/utils'
import type { CarWithStatus, Car as CarType, UserProfile } from '@/lib/types'

interface CarStatusCardProps {
  carWithStatus: CarWithStatus
  allCars: CarType[]
  currentUser: UserProfile
}

const statusConfig = {
  available: {
    label: 'Verfügbar',
    labelColor: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
    icon: CheckCircle,
    iconColor: '#22c55e',
  },
  reserved: {
    label: 'Reserviert',
    labelColor: '#eab308',
    bg: 'rgba(234,179,8,0.08)',
    border: 'rgba(234,179,8,0.25)',
    icon: Clock,
    iconColor: '#eab308',
  },
  'in-use': {
    label: 'In Fahrt',
    labelColor: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    icon: Car,
    iconColor: '#3b82f6',
  },
}

function CarImage({ emoji, name, color }: { emoji: string; name: string; color: string }) {
  if (emoji.startsWith('/')) {
    return (
      <div className="w-full h-28 relative mb-2">
        <Image
          src={emoji}
          alt={name}
          fill
          className="object-contain drop-shadow-lg"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      </div>
    )
  }
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
      style={{ backgroundColor: color + '22' }}
    >
      {emoji}
    </div>
  )
}

export function CarStatusCard({ carWithStatus, allCars, currentUser }: CarStatusCardProps) {
  const [showModal, setShowModal] = useState(false)
  const config = statusConfig[carWithStatus.liveStatus]
  const StatusIcon = config.icon
  const hasImage = carWithStatus.emoji.startsWith('/')
  const relevantReservation =
    carWithStatus.activeReservation ?? carWithStatus.nextReservation

  return (
    <>
      <div
        className="rounded-2xl p-5 border transition-all"
        style={{
          backgroundColor: config.bg,
          borderColor: config.border,
        }}
      >
        {/* Car image (full-width) or emoji icon */}
        <CarImage
          emoji={carWithStatus.emoji}
          name={carWithStatus.name}
          color={carWithStatus.color}
        />

        {/* Name + status */}
        <div className={`flex items-center justify-between ${hasImage ? 'mb-3' : 'mb-4'}`}>
          <div className={hasImage ? '' : 'flex items-center gap-3'}>
            {!hasImage && (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: carWithStatus.color + '22' }}
              >
                {carWithStatus.emoji}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white text-base">{carWithStatus.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusIcon className="w-3.5 h-3.5" style={{ color: config.iconColor }} />
                <span className="text-xs font-medium" style={{ color: config.labelColor }}>
                  {config.label}
                </span>
              </div>
            </div>
          </div>
          {/* Accent stripe */}
          <div
            className="w-1 h-8 rounded-full opacity-60"
            style={{ backgroundColor: carWithStatus.color }}
          />
        </div>

        {/* Reservation info */}
        {relevantReservation && (
          <div className="mb-3 flex items-center gap-2.5 bg-surface-800/60 rounded-xl px-3 py-2.5">
            {relevantReservation.user && (
              <Avatar
                name={relevantReservation.user.display_name}
                color={relevantReservation.user.avatar_color}
                size="sm"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {relevantReservation.user?.display_name}
                {carWithStatus.liveStatus === 'reserved' && (
                  <span className="text-surface-400 font-normal">
                    {' '}ab {formatTime(relevantReservation.start_time)}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-surface-400">
                {formatDate(relevantReservation.start_time)},{' '}
                {formatTime(relevantReservation.start_time)}–
                {formatTime(relevantReservation.end_time)}
              </p>
            </div>
          </div>
        )}

        {/* Reserve button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-surface-800/80 text-surface-200 hover:bg-surface-700 hover:text-white transition-colors border border-surface-600"
        >
          Reservieren
        </button>
      </div>

      {showModal && (
        <NewReservationModal
          cars={allCars}
          currentUser={currentUser}
          defaultCarId={carWithStatus.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
