'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCarStatus } from '@/lib/utils'
import { CarStatusCard } from './car-status-card'
import type { Car, Reservation, UserProfile } from '@/lib/types'

interface CarsGridProps {
  cars: Car[]
  initialReservations: (Reservation & { user: UserProfile })[]
  currentUser: UserProfile
}

export function CarsGrid({ cars, initialReservations, currentUser }: CarsGridProps) {
  const [reservations, setReservations] =
    useState<(Reservation & { user: UserProfile })[]>(initialReservations)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('reservations-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async () => {
          const { data } = await supabase
            .from('reservations')
            .select('*, user:users(id, display_name, avatar_color, role, created_at)')
            .in('status', ['approved', 'active', 'pending'])
            .gte('end_time', new Date().toISOString())
            .order('start_time')

          setReservations((data as (Reservation & { user: UserProfile })[]) ?? [])
          // Refresh server components (pending badge in layout)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const carsWithStatus = cars.map((car) => getCarStatus(car, reservations))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {carsWithStatus.map((car) => (
        <CarStatusCard
          key={car.id}
          carWithStatus={car}
          allCars={cars}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}
