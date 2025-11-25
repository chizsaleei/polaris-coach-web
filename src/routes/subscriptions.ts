// src/routes/subscriptions.ts
//
// Polaris Core - Subscriptions summary routes
//
// Mounted as: app.use('/v1/subscriptions', subscriptionsRouter)

import type { Request, Response } from 'express'
import { Router } from 'express'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { logger } from '../lib/logger'

const log = logger.child('subscriptions')
const router = Router()

// Supabase admin client

type JsonRecord = Record<string, unknown>

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

type PaymentEventRow = {
  id: string
  event_type: string
  provider: string | null
  user_id: string | null
  plan: string | null
  amount_minor: number | null
  currency: string | null
  created_at: string
  meta?: JsonRecord | null
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
      entitlements: TableDef<EntitlementRow>
      payments_events: TableDef<PaymentEventRow>
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

type SubscriptionSummary = {
  userId: string
  tier: TierName
  rawPlan: string | null
  provider: string | null
  status: string
  startsAt: string | null
  endsAt: string | null
  cancelAt: string | null
  entitlementId: string | null
  events: {
    id: string
    eventType: string
    provider: string | null
    plan: string | null
    amountMinor: number | null
    currency: string | null
    createdAt: string
  }[]
}

export type SubscriptionSummaryResponse = {
  ok: boolean
  data?: SubscriptionSummary
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

function normalizeTier(plan: string | null | undefined): TierName {
  if (!plan) return 'free'
  const lower = plan.toLowerCase()
  if (lower.startsWith('vip')) return 'vip'
  if (lower.startsWith('pro')) return 'pro'
  return 'free'
}

async function loadLatestEntitlement(userId: string): Promise<EntitlementRow | null> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('entitlements')
    .select(
      'id, user_id, plan, provider, status, starts_at, ends_at, cancel_at, created_at, meta',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    log.warn('subscriptions_entitlement_load_failed', {
      userId,
      error: error.message,
    })
  }

  return (data as EntitlementRow | null) ?? null
}

async function loadRecentPaymentEvents(userId: string): Promise<PaymentEventRow[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('payments_events')
    .select('id, event_type, provider, user_id, plan, amount_minor, currency, created_at, meta')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(25)

  if (error) {
    log.warn('subscriptions_payments_events_load_failed', {
      userId,
      error: error.message,
    })
    return []
  }

  return (data as PaymentEventRow[]) ?? []
}

// GET /v1/subscriptions

router.get(
  '/',
  async (
    req: Request,
    res: Response<SubscriptionSummaryResponse>,
  ): Promise<Response<SubscriptionSummaryResponse>> => {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized',
      })
    }

    try {
      const [entitlement, events] = await Promise.all([
        loadLatestEntitlement(userId),
        loadRecentPaymentEvents(userId),
      ])

      const tier = normalizeTier(entitlement?.plan ?? null)

      const summary: SubscriptionSummary = {
        userId,
        tier,
        rawPlan: entitlement?.plan ?? null,
        provider: entitlement?.provider ?? null,
        status: entitlement?.status ?? 'free',
        startsAt: entitlement?.starts_at ?? null,
        endsAt: entitlement?.ends_at ?? null,
        cancelAt: entitlement?.cancel_at ?? null,
        entitlementId: entitlement?.id ?? null,
        events: events.map((evt) => ({
          id: evt.id,
          eventType: evt.event_type,
          provider: evt.provider,
          plan: evt.plan,
          amountMinor: evt.amount_minor ?? null,
          currency: evt.currency ?? null,
          createdAt: evt.created_at,
        })),
      }

      return res.json({
        ok: true,
        data: summary,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log.error('subscriptions_summary_failed', {
        userId,
        error: message,
      })
      return res.status(500).json({
        ok: false,
        error: 'subscriptions_summary_failed',
      })
    }
  },
)

export default router
