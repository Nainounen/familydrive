'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Clock, BellRing } from 'lucide-react'
import type { UserProfile } from '@/lib/types'

interface MobileNavProps {
  user: UserProfile
  pendingCount: number
}

export function MobileNav({ user, pendingCount }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Kalender', icon: CalendarDays },
    { href: '/reservations', label: 'Fahrten', icon: Clock },
    ...(user.role === 'parent'
      ? [{ href: '/requests', label: 'Anfragen', icon: BellRing, badge: pendingCount }]
      : []),
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-900 border-t border-surface-700 flex">
      {navItems.map(({ href, label, icon: Icon, badge }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors relative ${
              active ? 'text-white' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
