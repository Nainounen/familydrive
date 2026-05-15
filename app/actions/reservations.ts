'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createReservation(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht angemeldet.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const carId = formData.get('car_id') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const note = (formData.get('note') as string) || null

  if (!carId || !startTime || !endTime) {
    return { error: 'Bitte alle Pflichtfelder ausfüllen.' }
  }

  if (new Date(endTime) <= new Date(startTime)) {
    return { error: 'Endzeit muss nach der Startzeit liegen.' }
  }

  // Conflict check: no overlapping approved/active reservations for this car
  const { data: conflicts } = await supabase
    .from('reservations')
    .select('id')
    .eq('car_id', carId)
    .in('status', ['approved', 'active'])
    .lt('start_time', endTime)
    .gt('end_time', startTime)

  if (conflicts && conflicts.length > 0) {
    return { error: 'Dieser Zeitraum ist bereits reserviert.' }
  }

  const status = profile?.role === 'parent' ? 'approved' : 'pending'

  const { error } = await supabase.from('reservations').insert({
    car_id: carId,
    user_id: user.id,
    start_time: startTime,
    end_time: endTime,
    status,
    note,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/reservations')
  revalidatePath('/requests')

  return {}
}

export async function updateReservationStatus(
  reservationId: string,
  status: 'approved' | 'rejected'
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht angemeldet.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'parent') return { error: 'Keine Berechtigung.' }

  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', reservationId)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/reservations')

  return {}
}

export async function cancelReservation(reservationId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht angemeldet.' }

  const { data: res } = await supabase
    .from('reservations')
    .select('status, user_id')
    .eq('id', reservationId)
    .single()

  if (!res || res.user_id !== user.id) return { error: 'Keine Berechtigung.' }
  if (!['pending', 'approved'].includes(res.status)) {
    return { error: 'Diese Reservierung kann nicht storniert werden.' }
  }

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'rejected' })
    .eq('id', reservationId)

  if (error) return { error: error.message }

  revalidatePath('/reservations')
  revalidatePath('/dashboard')

  return {}
}
