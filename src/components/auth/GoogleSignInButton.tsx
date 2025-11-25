'use client'

import { useState } from 'react'
import { Loader2, LogIn } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Props = {
  className?: string
  children?: React.ReactNode
}

export default function GoogleSignInButton({ className, children }: Props) {
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/auth/callback`
          : undefined

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })

      if (error) {
        // eslint-disable-next-line no-console
        console.error('google sign-in error', error)
        setBusy(false)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('google sign-in failed', err)
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition',
        'hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60',
        className || '',
      ].join(' ')}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogIn className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{children ?? 'Sign in with Google'}</span>
    </button>
  )
}

