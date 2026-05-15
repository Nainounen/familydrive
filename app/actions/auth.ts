'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Known car owners: signing up with these emails auto-assigns parent role
// and creates their car in the database.
const CAR_OWNERS: Record<string, { carName: string; carColor: string; carImage: string }> = {
  'nadja.meier@hodelundpartner.ch': {
    carName: 'GR86',
    carColor: '#cc2200',
    carImage: '/cars/gr86.png',
  },
  'marco.meier@hodelundpartner.ch': {
    carName: 'Nissan',
    carColor: '#1a6bba',
    carImage: '/cars/nissan.png',
  },
}

export async function signIn(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'E-Mail oder Passwort falsch.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  // Validate the family secret server-side — never exposed to the client
  const secret = formData.get('secret') as string
  if (!process.env.FAMILY_SECRET || secret !== process.env.FAMILY_SECRET) {
    return { error: 'Ungültiger Familien-Code.' }
  }

  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const displayName = (formData.get('display_name') as string).trim()
  const avatarColor = formData.get('avatar_color') as string

  if (!displayName) return { error: 'Bitte gib deinen Namen ein.' }
  if (password.length < 8) return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' }

  // Known owner emails are always parents, regardless of what the form says
  const carOwnerConfig = CAR_OWNERS[email]
  const role: 'parent' | 'kid' = carOwnerConfig
    ? 'parent'
    : (formData.get('role') as 'parent' | 'kid')

  const supabase = await createClient()
  const admin = createAdminClient()

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  if (!data.user) return { error: 'Registrierung fehlgeschlagen.' }

  // Create profile via admin client (bypasses RLS — session isn't set yet after signUp)
  const { error: profileError } = await admin.from('users').insert({
    id: data.user.id,
    display_name: displayName,
    avatar_color: avatarColor,
    role,
  })
  if (profileError) return { error: profileError.message }

  // If this is a known car owner, create or claim their car
  if (carOwnerConfig) {
    // Check if the car already exists (e.g. from seed.sql)
    const { data: existingCar } = await admin
      .from('cars')
      .select('id, owner_id')
      .eq('name', carOwnerConfig.carName)
      .maybeSingle()

    if (!existingCar) {
      // First time setup — create the car
      await admin.from('cars').insert({
        name: carOwnerConfig.carName,
        color: carOwnerConfig.carColor,
        emoji: carOwnerConfig.carImage,
        owner_id: data.user.id,
      })
    } else if (!existingCar.owner_id) {
      // Car exists but has no owner yet — claim it
      await admin.from('cars').update({ owner_id: data.user.id }).eq('id', existingCar.id)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
