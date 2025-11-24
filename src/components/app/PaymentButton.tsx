// src/components/app/PaymentButton.tsx
'use client'

import * as React from 'react'
import { CreditCard, LoaderCircle } from 'lucide-react'

import type { PlanId } from '@/types'

export interface PaymentButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick' | 'onError'
  > {
  plan: Exclude<PlanId, 'free'> | string
  /** Optional affiliate code for experiments / partner links */
  affiliateCode?: string
  /** Called if the button cannot redirect (very rare) */
  onError?: (message: string) => void
  labelIdle?: string
  labelBusy?: string
}

/**
 * PaymentButton
 *
 * Client-side wrapper for starting a checkout session.
 * Redirects to `/api/pay/checkout?plan=...&aff=...`, which
 * calls Polaris Core `/v1/payments/checkout` and then sends
 * the user to the provider checkout page.
 */
export default function PaymentButton({
  plan,
  affiliateCode,
  onError,
  labelIdle = 'Upgrade',
  labelBusy = 'Redirecting…',
  disabled,
  className = '',
  ...buttonProps
}: PaymentButtonProps) {
  const [busy, setBusy] = React.useState(false)

  const handleClick = () => {
    if (busy || disabled) return
    setBusy(true)

    try {
      const href = buildCheckoutUrl(plan, affiliateCode)
      if (typeof window !== 'undefined') {
        window.location.href = href
      } else {
        throw new Error('Checkout redirect is only available in the browser.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setBusy(false)
      onError?.(msg)
      // Fallback: leave page unchanged so user can retry
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
        'bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400',
        'dark:bg-sky-600 dark:hover:bg-sky-500',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...buttonProps}
    >
      {busy ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {labelBusy}
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          {labelIdle}
        </>
      )}
    </button>
  )
}

function buildCheckoutUrl(plan: string, affiliateCode?: string) {
  const params = new URLSearchParams()
  params.set('plan', plan)
  if (affiliateCode) params.set('aff', affiliateCode)
  return `/api/pay/checkout?${params.toString()}`
}
