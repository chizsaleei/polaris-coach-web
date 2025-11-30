'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Props = {
  nextPath?: string
  className?: string
}

export default function EmailSignInForm({ nextPath = '/dashboard', className }: Props) {
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
      const supabase = getSupabaseBrowserClient()
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

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label className="block text-sm font-semibold text-slate-900">
        Email address
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="mt-3 w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Sending link…' : 'Send magic link'}
      </button>
      {message && <p className="mt-2 text-xs text-emerald-600">{message}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  )
}
