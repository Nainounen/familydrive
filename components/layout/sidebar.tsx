'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  BellRing,
  LogOut,
  Car,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { signOut } from '@/app/actions/auth'
import type { UserProfile } from '@/lib/types'

interface SidebarProps {
  user: UserProfile
  pendingCount: number
}

export function Sidebar({ user, pendingCount }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Kalender', icon: CalendarDays },
    { href: '/reservations', label: 'Meine Fahrten', icon: Clock },
    ...(user.role === 'parent'
      ? [{ href: '/requests', label: 'Anfragen', icon: BellRing, badge: pendingCount }]
      : []),
  ]

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-surface-900 border-r border-surface-700 px-3 py-4 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center">
          <Car className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">FamilyDrive</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-surface-700 text-white'
                  : 'text-surface-300 hover:text-white hover:bg-surface-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-surface-700 pt-3 mt-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar name={user.display_name} color={user.avatar_color} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
            <p className="text-xs text-surface-400 capitalize">{user.role === 'parent' ? 'Elternteil' : 'Kind'}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="p-1.5 rounded-md text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
