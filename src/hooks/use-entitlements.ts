// src/hooks/use-entitlements.ts
'use client'

import { useMemo } from 'react'

import { COACH_COOLDOWN_DAYS, TIER_LIMITS, type TierLimits } from '@/lib/constants'
import { Tier } from '@/types'

export interface EntitlementView {
  tier: Tier
  limits: TierLimits
  coachCooldownDays: number
  /** True if this tier can use at least `count` tools concurrently */
  canUseTools(count: number): boolean
  /** True if this tier has any realtime minutes configured */
  canUseRealtime(): boolean
}

/**
 * useEntitlements
 *
 * Lightweight client-side view over tier limits that mirrors core constants.
 * Server remains the source of truth for actual entitlements, minutes, and
 * cooldown timestamps; this hook is only for UI hints and gating copy.
 */
export function useEntitlements(tier: Tier = Tier.FREE): EntitlementView {
  return useMemo(() => {
    const limits = TIER_LIMITS[tier]
    const coachCooldownDays = COACH_COOLDOWN_DAYS[tier]

    const canUseTools = (count: number) => {
      if (!Number.isFinite(count) || count <= 0) return false
      if (limits.toolsMax == null) return true
      return count <= limits.toolsMax
    }

    const canUseRealtime = () => limits.dailyRealtimeMinutes != null && limits.dailyRealtimeMinutes > 0

    return {
      tier,
      limits,
      coachCooldownDays,
      canUseTools,
      canUseRealtime,
    }
  }, [tier])
}
