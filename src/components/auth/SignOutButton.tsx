'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Props = {
  className?: string
  children?: React.ReactNode
}

export default function SignOutButton({ className, children }: Props) {
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('sign out failed', err)
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition',
        'hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60',
        className || '',
      ].join(' ')}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>{children ?? 'Sign out'}</span>
    </button>
  )
}

