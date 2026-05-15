'use client'

import { useActionState } from 'react'
import { Car, Loader2 } from 'lucide-react'
import { signIn } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, null)

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
            <p className="text-sm text-surface-300 mt-1">Familien-Fahrzeugplanung</p>
          </div>
        </div>

        {/* Form */}
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-surface-200">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@family.local"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-surface-200">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 transition-colors"
            />
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
                Anmelden…
              </>
            ) : (
              'Anmelden'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-surface-400">
          Kein öffentlicher Zugang — nur Familienmitglieder.
        </p>
      </div>
    </div>
  )
}
