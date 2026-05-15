import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import type { UserProfile } from '@/lib/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { count: pendingCount } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const userProfile = profile as UserProfile

  return (
    <div className="min-h-screen bg-surface-900">
      <Sidebar user={userProfile} pendingCount={pendingCount ?? 0} />

      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>

      <MobileNav user={userProfile} pendingCount={pendingCount ?? 0} />
    </div>
  )
}
