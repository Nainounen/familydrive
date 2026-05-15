'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
        return
      }
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    })
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900 p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle className="w-12 h-12 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Passwort gesetzt!</h2>
          <p className="text-sm text-surface-400">Du wirst weitergeleitet…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-700 flex items-center justify-center">
            <Car className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Willkommen!</h1>
            <p className="text-sm text-surface-300 mt-1">
              Wähle dein persönliches Passwort für FamilyDrive.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-surface-200">
              Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-surface-200">
              Passwort bestätigen
            </label>
            <input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Passwort wiederholen"
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-800 border border-surface-600 text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-surface-400 transition-colors"
            />
          </div>

          {/* Strength hint */}
          {password.length > 0 && (
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      password.length >= level * 4
                        ? level === 1
                          ? '#ef4444'
                          : level === 2
                          ? '#eab308'
                          : '#22c55e'
                        : '#2e2e2e',
                  }}
                />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-2.5">
              {error}
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
                Speichern…
              </>
            ) : (
              'Passwort speichern'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
