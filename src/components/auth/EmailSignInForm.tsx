'use client'

import { useState } from 'react'

import { createClient } from '@/utils/supabase/client'

type Props = {
  nextPath?: string
  className?: string
  variant?: 'light' | 'dark'
}

export default function EmailSignInForm({
  nextPath = '/dashboard',
  className,
  variant = 'light',
}: Props) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || !email) return

    setBusy(true)
    setMessage(null)
    setError(null)

    try {
      const supabase = createClient()
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_BASE_URL

      const callback = origin ? new URL('/auth/callback', origin) : null
      if (callback) {
        const next = nextPath.startsWith('/') ? nextPath : '/dashboard'
        callback.searchParams.set('next', next)
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callback?.toString() },
      })

      if (signInError) {
        console.error('email sign-in error', signInError)
        setError('Could not send the magic link. Please try again.')
      } else {
        setMessage('Check your inbox for a secure sign-in link.')
      }
    } catch (err) {
      console.error('email sign-in failed', err)
      setError('Unexpected error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const isDark = variant === 'dark'
  const labelText = isDark ? 'text-white' : 'text-slate-900'
  const inputClasses = isDark
    ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white'
    : 'border-slate-300 text-slate-900 focus:border-slate-900'
  const buttonClasses = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-200'
    : 'bg-slate-900 text-white hover:bg-slate-800'
  const messageColor = isDark ? 'text-emerald-300' : 'text-emerald-600'
  const errorColor = isDark ? 'text-red-300' : 'text-red-600'

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label className={`block text-sm font-semibold ${labelText}`}>
        Email Address
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`mt-2 w-full rounded-2xl border px-3 py-2 text-sm focus:outline-none ${inputClasses}`}
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className={`mt-4 w-full rounded-2xl px-4 py-2 text-sm font-semibold shadow disabled:cursor-not-allowed disabled:opacity-60 ${buttonClasses}`}
      >
        {busy ? 'Sending link...' : 'Continue with Email'}
      </button>
      {message && <p className={`mt-2 text-xs ${messageColor}`}>{message}</p>}
      {error && <p className={`mt-2 text-xs ${errorColor}`}>{error}</p>}
    </form>
  )
}
