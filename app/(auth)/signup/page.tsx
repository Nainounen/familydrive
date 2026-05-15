'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Car, Loader2, Eye, EyeOff } from 'lucide-react'
import { signUp } from '@/app/actions/auth'

const AVATAR_COLORS = [
  { value: '#f97316', label: 'Orange' },
  { value: '#3b82f6', label: 'Blau' },
  { value: '#a855f7', label: 'Lila' },
  { value: '#22c55e', label: 'Grün' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#eab308', label: 'Gelb' },
  { value: '#14b8a6', label: 'Türkis' },
  { value: '#ef4444', label: 'Rot' },
]

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, null)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].value)

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-700 flex items-center justify-center">
            <Car className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">FamilyDrive</h1>
            <p className="text-sm text-surface-300 mt-1">Konto erstellen</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="display_name" className="block text-sm font-medium text-surface-200">
              Dein Name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              autoComplete="name"
              placeholder="z. B. Nino"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 transition-colors"
            />
          </div>

          {/* Avatar color */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">
              Deine Farbe
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className="w-8 h-8 rounded-full transition-all focus:outline-none"
                  style={{
                    backgroundColor: c.value,
                    outline: selectedColor === c.value ? '2px solid white' : '2px solid transparent',
                    outlineOffset: '2px',
                    transform: selectedColor === c.value ? 'scale(1.15)' : 'scale(1)',
                  }}
                  title={c.label}
                />
              ))}
            </div>
            <input type="hidden" name="avatar_color" value={selectedColor} />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-200">Rolle</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'parent', label: '👨‍👩‍👧 Elternteil' },
                { value: 'kid', label: '🧒 Kind' },
              ].map((r) => (
                <label
                  key={r.value}
                  className="relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-surface-600 bg-surface-800 text-sm text-surface-200 cursor-pointer has-[:checked]:border-white has-[:checked]:text-white has-[:checked]:bg-surface-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    defaultChecked={r.value === 'kid'}
                    className="sr-only"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-surface-200">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="deine@email.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-surface-200">
              Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Mindestens 8 Zeichen"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Family secret */}
          <div className="space-y-1.5">
            <label htmlFor="secret" className="block text-sm font-medium text-surface-200">
              Familien-Code
            </label>
            <input
              id="secret"
              name="secret"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 transition-colors"
            />
            <p className="text-xs text-surface-500">Frag ein Elternteil nach dem Code.</p>
          </div>

          {state?.error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-2.5">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-surface-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Konto wird erstellt…
              </>
            ) : (
              'Konto erstellen'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-surface-400">
          Schon ein Konto?{' '}
          <Link href="/login" className="text-white hover:underline font-medium">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
