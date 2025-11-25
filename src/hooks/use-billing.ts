// src/hooks/use-billing.ts
'use client'

import { useCallback } from 'react'

import { useAffiliate } from '@/hooks/use-affiliate'
import { PLAN_CURRENCY, PLAN_LABEL, PLAN_DISPLAY_PRICE, PLAN_TO_TIER } from '@/lib/constants'
import type { PlanId, Tier } from '@/types'

export type BillingProvider = 'paypal' | 'paymongo'

export interface BillingPlanMeta {
  id: PlanId
  label: string
  price: string
  tier: Tier
}

const PAID_PLANS: Exclude<PlanId, 'free'>[] = [
  'pro_monthly',
  'pro_yearly',
  'vip_monthly',
  'vip_yearly',
]

const BILLING_PLANS: BillingPlanMeta[] = PAID_PLANS.map((id) => ({
  id,
  label: PLAN_LABEL[id],
  price: PLAN_DISPLAY_PRICE[id],
  tier: PLAN_TO_TIER[id],
}))

/**
 * useBilling
 *
 * Client-side helper for plan metadata and building billing URLs.
 * - Knows about Free / Pro / VIP plan ids and display prices
 * - Appends affiliate codes and UTMs to checkout URLs when available
 * - Provides helpers to open checkout and portal routes
 *
 * Routes used:
 *   GET /api/pay/checkout?plan=pro_monthly&aff=CODE
 *   GET /api/pay/portal[?provider=paypal|paymongo]
 */
export function useBilling() {
  const { affiliateCode, appendToUrl } = useAffiliate()

  const checkoutUrlFor = useCallback(
    (plan: PlanId | string): string => {
      const base = `/api/pay/checkout?plan=${encodeURIComponent(plan)}`
      return appendToUrl(base)
    },
    [appendToUrl],
  )

  const portalUrlFor = useCallback((provider?: BillingProvider): string => {
    const url = new URL('/api/pay/portal', 'http://localhost')
    if (provider) url.searchParams.set('provider', provider)
    // Strip fake origin for client use
    return url.pathname + (url.search || '')
  }, [])

  const openCheckout = useCallback(
    (plan: PlanId | string) => {
      const href = checkoutUrlFor(plan)
      if (typeof window !== 'undefined') {
        window.location.href = href
      }
    },
    [checkoutUrlFor],
  )

  const openPortal = useCallback((provider?: BillingProvider) => {
    const href = portalUrlFor(provider)
    if (typeof window !== 'undefined') {
      window.location.href = href
    }
  }, [portalUrlFor])

  return {
    currency: PLAN_CURRENCY,
    affiliateCode,
    plans: BILLING_PLANS,
    checkoutUrlFor,
    openCheckout,
    portalUrlFor,
    openPortal,
  }
}
