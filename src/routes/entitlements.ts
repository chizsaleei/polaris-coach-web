// src/routes/entitlements.ts
//
// Polaris Core - Entitlements and capabilities
//
// Mounted as: app.use('/v1/entitlements', entitlementsRouter)

import type { Request, Response } from 'express'
import { Router } from 'express'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { logger } from '../lib/logger'

const log = logger.child('entitlements')
const router = Router()

// Supabase admin client

type SupabaseAdminClient = SupabaseClient<any>

let adminClient: SupabaseAdminClient | null = null

function getSupabaseAdminClient(): SupabaseAdminClient {
  if (adminClient) return adminClient

  const urlEnv = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKeyEnv =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!urlEnv || !serviceKeyEnv) {
    throw new Error(
      'Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY for Supabase admin client',
    )
  }

  adminClient = createClient<any>(urlEnv, serviceKeyEnv, {
    auth: { persistSession: false },
  })

  return adminClient
}

// Types

type JsonRecord = Record<string, unknown>

type TierName = 'free' | 'pro' | 'vip'

type EntitlementRow = {
  id: string
  user_id: string
  plan: string
  provider: string | null
  status: string
  starts_at: string | null
  ends_at: string | null
  cancel_at: string | null
  created_at: string
  meta?: JsonRecord | null
}

type ProfileRow = {
  id: string
  tier: string | null
}

type CapabilitiesFeatures = {
  maxDailyMinutes: number | null
  canUseLive: boolean
  maxCoaches: number
  canSwitchCoachImmediately: boolean
}

export type Capabilities = {
  userId: string
  tier: TierName
  plan: string | null
  provider: string | null
  status: string
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  cancelAt: string | null
  features: CapabilitiesFeatures
}

export type EntitlementsSelfResponse = {
  ok: boolean
  data?: Capabilities
  error?: string
}

// Utilities

function getUserIdFromRequest(req: Request): string | null {
  const headerUser = req.header('x-user-id')
  if (headerUser && typeof headerUser === 'string') return headerUser
  const anyReq = req as any
  if (anyReq.user?.id && typeof anyReq.user.id === 'string') return anyReq.user.id
  return null
}

function normalizeTier(value?: string | null): TierName {
  if (!value) return 'free'
  const lower = value.toLowerCase()
  if (lower.startsWith('vip')) return 'vip'
  if (lower.startsWith('pro')) return 'pro'
  return 'free'
}

function mapTierToFeatures(tier: TierName): CapabilitiesFeatures {
  if (tier === 'vip') {
    return {
      maxDailyMinutes: 120,
      canUseLive: true,
      maxCoaches: 10,
      canSwitchCoachImmediately: true,
    }
  }

  if (tier === 'pro') {
    return {
      maxDailyMinutes: 30,
      canUseLive: false,
      maxCoaches: 1,
      canSwitchCoachImmediately: false,
    }
  }

  return {
    maxDailyMinutes: 10,
    canUseLive: false,
    maxCoaches: 1,
    canSwitchCoachImmediately: false,
  }
}

function isEntitlementActive(ent: EntitlementRow | null): boolean {
  if (!ent) return true
  if (ent.status !== 'active') return false
  if (!ent.ends_at) return true
  const now = Date.now()
  const end = new Date(ent.ends_at).getTime()
  return Number.isFinite(end) ? end > now : true
}

// Routes

router.get(
  '/self',
  async (
    req: Request,
    res: Response<EntitlementsSelfResponse>,
  ): Promise<Response<EntitlementsSelfResponse>> => {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized',
      })
    }

    const supabase = getSupabaseAdminClient()

    try {
      const [profileRes, entitlementRes] = await Promise.all([
        supabase.from('profiles').select('id, tier').eq('id', userId).maybeSingle(),
        supabase
          .from('entitlements')
          .select(
            'id, user_id, plan, provider, status, starts_at, ends_at, cancel_at, created_at, meta',
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (profileRes.error) {
        log.warn('entitlements_profile_load_failed', {
          userId,
          error: profileRes.error.message,
        })
      }

      if (entitlementRes.error && entitlementRes.error.code !== 'PGRST116') {
        log.warn('entitlements_load_failed', {
          userId,
          error: entitlementRes.error.message,
        })
      }

      const profile = (profileRes.data as ProfileRow | null) ?? null
      const entitlement = (entitlementRes.data as EntitlementRow | null) ?? null

      const effectiveTier = normalizeTier(entitlement?.plan ?? profile?.tier)
      const features = mapTierToFeatures(effectiveTier)
      const active = isEntitlementActive(entitlement)

      const payload: Capabilities = {
        userId,
        tier: effectiveTier,
        plan: entitlement?.plan ?? effectiveTier,
        provider: entitlement?.provider ?? null,
        status: entitlement?.status ?? (effectiveTier === 'free' ? 'active' : 'none'),
        isActive: active,
        startsAt: entitlement?.starts_at ?? null,
        endsAt: entitlement?.ends_at ?? null,
        cancelAt: entitlement?.cancel_at ?? null,
        features,
      }

      log.debug('entitlements_self_resolved', {
        userId,
        tier: payload.tier,
        status: payload.status,
        provider: payload.provider,
      })

      return res.json({
        ok: true,
        data: payload,
      })
    } catch (error) {
      log.error('entitlements_self_unexpected_error', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return res.status(500).json({
        ok: false,
        error: 'internal_error',
      })
    }
  },
)

export default router
