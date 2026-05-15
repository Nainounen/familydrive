'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = (formData.get('display_name') as string).trim()
  const avatarColor = formData.get('avatar_color') as string
  const role = formData.get('role') as 'parent' | 'kid'

  if (!displayName) return { error: 'Bitte gib deinen Namen ein.' }
  if (password.length < 8) return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  if (!data.user) return { error: 'Registrierung fehlgeschlagen.' }

  // Create the family member profile
  const { error: profileError } = await supabase.from('users').insert({
    id: data.user.id,
    display_name: displayName,
    avatar_color: avatarColor,
    role,
  })

  if (profileError) return { error: profileError.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
