// src/lib/payments.ts
// Polaris Web - payments helpers
// Display-only plan metadata; Polaris Core remains source of truth
// for actual pricing, entitlements, and provider behavior.

import type { PlanId, Tier } from '@/types'
import {
  PLAN_CURRENCY,
  PLAN_LABEL,
  PLAN_DISPLAY_PRICE,
  PLAN_TO_TIER,
} from './constants'

export type PaidPlanId = Exclude<PlanId, 'free'>

export interface PaymentPlanMeta {
  id: PlanId
  tier: Tier
  label: string
  /** Human-readable price string, e.g. "$12.99" */
  priceDisplay: string
  /** Display currency, e.g. "USD" */
  currency: string
  /** True for paid plans (Pro / VIP), false for Free */
  isPaid: boolean
}

/** All paid plan ids derived from PLAN_LABEL (pro_monthly, pro_yearly, vip_monthly, vip_yearly). */
export const PAID_PLAN_IDS = Object.keys(PLAN_LABEL) as PaidPlanId[]

/** All known plans with display metadata. */
export const PLANS: PaymentPlanMeta[] = [
  {
    id: 'free',
    tier: PLAN_TO_TIER.free,
    label: 'Free',
    priceDisplay: '$0',
    currency: PLAN_CURRENCY,
    isPaid: false,
  },
  ...PAID_PLAN_IDS.map((id) => ({
    id,
    tier: PLAN_TO_TIER[id],
    label: PLAN_LABEL[id],
    priceDisplay: PLAN_DISPLAY_PRICE[id],
    currency: PLAN_CURRENCY,
    isPaid: true,
  })),
]

const PLAN_BY_ID: Record<PlanId, PaymentPlanMeta> = PLANS.reduce(
  (acc, plan) => {
    acc[plan.id] = plan
    return acc
  },
  {} as Record<PlanId, PaymentPlanMeta>,
)

/** Narrower check: true only for non-free plans that map to Pro / VIP. */
export function isPaidPlanId(plan: string | PlanId): plan is PaidPlanId {
  return (PAID_PLAN_IDS as string[]).includes(plan)
}

/** Lookup helper for plan metadata (label, tier, display price, etc.). */
export function getPlanMeta(plan: PlanId): PaymentPlanMeta {
  return PLAN_BY_ID[plan]
}

/**
 * Parse a raw `plan` query param into a known PlanId.
 * Returns null for unknown / malformed values so callers
 * can safely guard before calling Core `/v1/payments/*`.
 */
export function tryParsePlanId(raw: string | null | undefined): PlanId | null {
  if (!raw) return null
  const value = raw.toLowerCase()
  const allowed: PlanId[] = ['free', 'pro_monthly', 'pro_yearly', 'vip_monthly', 'vip_yearly']
  return (allowed.find((p) => p === value) as PlanId | undefined) ?? null
}
