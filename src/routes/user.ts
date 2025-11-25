// src/routes/user.ts
//
// Polaris Core - User profile and account summary routes
//
// Mounted as: app.use('/v1/user', userRouter)

import type { Request, Response } from 'express'
import { Router } from 'express'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import { logger } from '../lib/logger'

// logger.child expects a string namespace, not an object
const log = logger.child('user')
const router = Router()

// Supabase admin client

type JsonRecord = Record<string, unknown>

type ProfileRow = {
  id: string
  full_name: string | null
  profession: string | null
  goals: string | null
  tier: string | null
  country: string | null
  active_coach_key: string | null
  created_at: string
}

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

type AttemptRow = {
  id: string
  user_id: string
  created_at: string
}

type ExpressionRow = {
  id: string
  user_id: string
}

type TableDef<Row> = {
  Row: Row
  Insert: Row
  Update: Partial<Row>
  Relationships: []
}

type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow>
      entitlements: TableDef<EntitlementRow>
      attempts: TableDef<AttemptRow>
      expressions: TableDef<ExpressionRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type SupabaseAdminClient = SupabaseClient<Database>

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

  adminClient = createClient<Database>(urlEnv, serviceKeyEnv, {
    auth: { persistSession: false },
  })

  return adminClient
}

// Types

type TierName = 'free' | 'pro' | 'vip'

type AccountStats = {
  attempts: number
  expressions: number
  lastPracticeAt: string | null
}

type UserOverview = {
  profile: {
    id: string
    fullName: string | null
    profession: string | null
    goals: string | null
    tier: TierName
    country: string | null
    activeCoachKey: string | null
    createdAt: string
  } | null
  entitlement: {
    id: string
    plan: string
    provider: string | null
    status: string
    startsAt: string | null
    endsAt: string | null
    cancelAt: string | null
  } | null
  stats: AccountStats
}

export type UserOverviewResponse = {
  ok: boolean
  data?: UserOverview
  error?: string
}

export type UpdateProfileResponse = {
  ok: boolean
  data?: UserOverview['profile']
  error?: string
}

// Helpers

type ExpressRequestWithUser = Request & {
  user?: { id?: unknown }
}

function getUserIdFromRequest(req: Request): string | null {
  const headerUser = req.header('x-user-id')
  if (headerUser && typeof headerUser === 'string') return headerUser

  const authReq = req as ExpressRequestWithUser
  if (authReq.user?.id && typeof authReq.user.id === 'string') return authReq.user.id

  return null
}

function normalizeTier(value?: string | null): TierName {
  if (!value) return 'free'
  const lower = value.toLowerCase()
  if (lower.startsWith('vip')) return 'vip'
  if (lower.startsWith('pro')) return 'pro'
  return 'free'
}

async function loadUserOverview(userId: string): Promise<UserOverview> {
  const supabase = getSupabaseAdminClient()

  const profileQuery = supabase
    .from('profiles')
    .select(
      'id, full_name, profession, goals, tier, country, active_coach_key, created_at',
    )
    .eq('id', userId)
    .maybeSingle()

  const entitlementQuery = supabase
    .from('entitlements')
    .select(
      'id, user_id, plan, provider, status, starts_at, ends_at, cancel_at, created_at, meta',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const attemptsCountQuery = supabase
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const expressionsCountQuery = supabase
    .from('expressions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const lastAttemptQuery = supabase
    .from('attempts')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const [profileRes, entitlementRes, attemptsRes, expressionsRes, lastAttemptRes] =
    await Promise.all([
      profileQuery,
      entitlementQuery,
      attemptsCountQuery,
      expressionsCountQuery,
      lastAttemptQuery,
    ])

  if (profileRes.error && profileRes.error.code !== 'PGRST116') {
    log.warn('user_profile_load_failed', {
      userId,
      error: profileRes.error.message,
    })
  }

  if (entitlementRes.error && entitlementRes.error.code !== 'PGRST116') {
    log.warn('user_entitlement_load_failed', {
      userId,
      error: entitlementRes.error.message,
    })
  }

  if (attemptsRes.error) {
    log.warn('user_attempts_count_failed', {
      userId,
      error: attemptsRes.error.message,
    })
  }

  if (expressionsRes.error) {
    log.warn('user_expressions_count_failed', {
      userId,
      error: expressionsRes.error.message,
    })
  }

  if (lastAttemptRes.error && lastAttemptRes.error.code !== 'PGRST116') {
    log.warn('user_last_attempt_load_failed', {
      userId,
      error: lastAttemptRes.error.message,
    })
  }

  const profileRow = profileRes.data ?? null
  const entitlementRow = entitlementRes.data ?? null

  const tier = normalizeTier(entitlementRow?.plan ?? profileRow?.tier ?? null)

  const stats: AccountStats = {
    attempts: attemptsRes.count ?? 0,
    expressions: expressionsRes.count ?? 0,
    lastPracticeAt: lastAttemptRes.data?.created_at ?? null,
  }

  return {
    profile: profileRow
      ? {
          id: profileRow.id,
          fullName: profileRow.full_name,
          profession: profileRow.profession,
          goals: profileRow.goals,
          tier,
          country: profileRow.country,
          activeCoachKey: profileRow.active_coach_key,
          createdAt: profileRow.created_at,
        }
      : null,
    entitlement: entitlementRow
      ? {
          id: entitlementRow.id,
          plan: entitlementRow.plan,
          provider: entitlementRow.provider,
          status: entitlementRow.status,
          startsAt: entitlementRow.starts_at,
          endsAt: entitlementRow.ends_at,
          cancelAt: entitlementRow.cancel_at,
        }
      : null,
    stats,
  }
}

// Schemas

const updateProfileSchema = z
  .object({
    fullName: z.string().min(1).max(200).optional(),
    profession: z.string().min(1).max(200).optional(),
    goals: z.string().min(1).max(4000).optional(),
    country: z.string().min(2).max(2).optional(),
    activeCoachKey: z.string().min(1).max(100).optional(),
  })
  .refine(
    (data) =>
      data.fullName != null ||
      data.profession != null ||
      data.goals != null ||
      data.country != null ||
      data.activeCoachKey != null,
    {
      message: 'At least one field must be provided',
    },
  )

// GET /v1/user/me

router.get(
  '/me',
  async (
    req: Request,
    res: Response<UserOverviewResponse>,
  ): Promise<Response<UserOverviewResponse>> => {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized',
      })
    }

    try {
      const overview = await loadUserOverview(userId)
      return res.json({
        ok: true,
        data: overview,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log.error('user_overview_failed', { userId, error: message })
      return res.status(500).json({
        ok: false,
        error: 'user_overview_failed',
      })
    }
  },
)

// PATCH /v1/user/me

router.patch(
  '/me',
  async (
    req: Request,
    res: Response<UpdateProfileResponse>,
  ): Promise<Response<UpdateProfileResponse>> => {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized',
      })
    }

    const parseResult = updateProfileSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_request',
      })
    }

    const data = parseResult.data
    const supabase = getSupabaseAdminClient()

    const update: Partial<ProfileRow> = {}
    if (data.fullName != null) update.full_name = data.fullName
    if (data.profession != null) update.profession = data.profession
    if (data.goals != null) update.goals = data.goals
    if (data.country != null) update.country = data.country
    if (data.activeCoachKey != null) update.active_coach_key = data.activeCoachKey

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId)
        .select(
          'id, full_name, profession, goals, tier, country, active_coach_key, created_at',
        )
        .maybeSingle()

      if (error) {
        log.error('user_profile_update_failed', {
          userId,
          error: error.message,
        })
        return res.status(500).json({
          ok: false,
          error: 'profile_update_failed',
        })
      }

      const profileRow = updatedProfile
      if (!profileRow) {
        return res.status(404).json({
          ok: false,
          error: 'profile_not_found',
        })
      }

      const tier = normalizeTier(profileRow.tier)

      const profile: UserOverview['profile'] = {
        id: profileRow.id,
        fullName: profileRow.full_name,
        profession: profileRow.profession,
        goals: profileRow.goals,
        tier,
        country: profileRow.country,
        activeCoachKey: profileRow.active_coach_key,
        createdAt: profileRow.created_at,
      }

      return res.json({
        ok: true,
        data: profile,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log.error('user_profile_update_exception', { userId, error: message })
      return res.status(500).json({
        ok: false,
        error: 'profile_update_failed',
      })
    }
  },
)

export default router
