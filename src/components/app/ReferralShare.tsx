// src/components/app/ReferralShare.tsx
'use client'

import { useEffect, useState } from 'react'
import { Gift, Link2, Sparkles } from 'lucide-react'

export interface ReferralShareProps {
  /** Optional affiliate / referral code assigned to this user */
  affiliateCode?: string
  /** Optional override for base URL (defaults to NEXT_PUBLIC_APP_BASE_URL or window.origin) */
  baseUrl?: string
}

/**
 * ReferralShare
 *
 * Simple sharing widget for the “refer a friend with VIP credit after the first paid month”
 * growth loop. It builds a signup link with `aff=<code>` so Polaris Core can attach the
 * referral during auth and checkout.
 */
export default function ReferralShare({ affiliateCode, baseUrl }: ReferralShareProps) {
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const resolvedBase =
      baseUrl ||
      process.env.NEXT_PUBLIC_APP_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'https://polaris.example.com')

    const trimmedBase = resolvedBase.replace(/\/$/, '')
    const path = affiliateCode ? `/signup?aff=${encodeURIComponent(affiliateCode)}` : '/signup'
    setShareUrl(trimmedBase + path)
  }, [affiliateCode, baseUrl])

  const handleCopy = async () => {
    if (!shareUrl) return
    setError(null)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = shareUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2_000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to copy link.'
      setError(msg)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-xs text-slate-700 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A] dark:text-slate-200">
      <header className="mb-3 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <Gift className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Referral
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Share Polaris with a friend
          </h2>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
            Friends who sign up through your link start with a guided coach match and weekly
            Practice Pack. After their first paid month, your account can qualify for VIP credit
            under the referral policy.
          </p>
        </div>
      </header>

      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-[11px] dark:border-slate-700 dark:bg-slate-900/40">
          <Link2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" />
          <span className="truncate">{shareUrl || 'Preparing your link…'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!shareUrl}
            className="inline-flex items-center gap-1 rounded-2xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            {copied ? (
              <>
                <Sparkles className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Link2 className="h-3 w-3" />
                Copy link
              </>
            )}
          </button>
          {affiliateCode ? (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Your referral code: <span className="font-mono">{affiliateCode}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              You can still share this link; referrals are tracked even without a visible code.
            </span>
          )}
        </div>
        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}
