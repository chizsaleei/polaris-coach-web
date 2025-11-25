// src/routes/pay.ts
//
// Polaris Core - Payments routes
//
// Mounted as: app.use('/v1/payments', paymentsRouter)

import type { Request, Response } from 'express'
import { Router } from 'express'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import { logger } from '../lib/logger'

const log = logger.child('payments')
const router = Router()

// Supabase admin client

type JsonRecord = Record<string, unknown>

type ProviderId = 'paypal' | 'paymongo'

export type CheckoutResponse = {
  ok: boolean
  data?: { url: string; provider: ProviderId }
  error?: string
}

export type PortalResponse = {
  ok: boolean
  data?: { url: string }
  error?: string
}

type ProfileRow = {
  id: string
  country: string | null
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

type PaymentEventName = 'checkout_started' | 'checkout_error' | 'portal_opened' | 'portal_error'

type PaymentEventPayload = {
  event: PaymentEventName
  provider: ProviderId | null
  userId: string | null
  plan?: string | null
  amountMinor?: number | null
  currency?: string | null
  externalCustomerId?: string | null
  externalSubscriptionId?: string | null
  meta?: JsonRecord
}

type PaymentEventRow = {
  event_type: PaymentEventName
  provider: ProviderId | null
  user_id: string | null
  plan: string | null
  amount_minor: number | null
  currency: string | null
  meta: JsonRecord
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

type CheckoutSessionResult = {
  url: string
  providerSessionId?: string | null
  customerId?: string | null
  subscriptionId?: string | null
  amountMinor?: number | null
  currency?: string | null
}

type PortalSessionResult = {
  url: string
  customerId?: string | null
  subscriptionId?: string | null
}

// Schemas

const checkoutSchema = z.object({
  plan: z.string().min(1, 'plan is required'),
  provider: z.enum(['paypal', 'paymongo']).optional(),
  returnUrl: z.string().min(1).optional(),
  successUrl: z.string().min(1).optional(),
  cancelUrl: z.string().min(1).optional(),
  affiliateCode: z.string().min(1).optional(),
  meta: z.record(z.unknown()).optional(),
})

const portalSchema = z.object({
  userId: z.string().min(1).optional(),
  provider: z.enum(['paypal', 'paymongo']).optional(),
  returnUrl: z.string().min(1).optional(),
  meta: z.record(z.unknown()).optional(),
})

// Utilities

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

function sendValidationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    ok: false,
    error: 'invalid_request',
    details: error.flatten(),
  })
}

function resolveDefaultProvider(country: string | null): ProviderId {
  if (!country) return 'paypal'
  const upper = country.toUpperCase()
  if (upper === 'PH' || upper.startsWith('PHILIPPINES')) {
    return 'paymongo'
  }
  return 'paypal'
}

function makeAbsoluteUrl(input: string | undefined, fallbackPath: string): string {
  const baseEnv =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000'

  const normalizedBase = baseEnv.startsWith('http') ? baseEnv : `https://${baseEnv}`
  const trimmedBase = normalizedBase.replace(/\/$/, '')

  if (input && /^https?:\/\//i.test(input)) {
    return input
  }

  const path = input && input.startsWith('/') ? input : fallbackPath
  return `${trimmedBase}${path}`
}

async function loadProfileAndEntitlement(userId: string) {
  const supabase = getSupabaseAdminClient()

  const [profileRes, entitlementRes] = await Promise.all([
    supabase.from('profiles').select('id, country').eq('id', userId).maybeSingle(),
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
    log.warn('payments_profile_load_failed', {
      userId,
      error: profileRes.error.message,
    })
  }

  if (entitlementRes.error && entitlementRes.error.code !== 'PGRST116') {
    log.warn('payments_entitlement_load_failed', {
      userId,
      error: entitlementRes.error.message,
    })
  }

  const profile = profileRes.data ?? null
  const entitlement = entitlementRes.data ?? null

  return { profile, entitlement }
}

// Provider helpers (stubbed)

async function paypalCreateCheckoutSession(input: {
  userId: string
  plan: string
  successUrl: string
  cancelUrl: string
  returnUrl?: string
  idempotencyKey?: string
  affiliateCode?: string | null
  meta?: JsonRecord
}): Promise<CheckoutSessionResult> {
  void input
  throw new Error(
    'PayPal checkout not implemented. Wire paypalCreateCheckoutSession() to PayPal API.',
  )
}

async function paymongoCreateCheckoutSession(input: {
  userId: string
  plan: string
  successUrl: string
  cancelUrl: string
  returnUrl?: string
  idempotencyKey?: string
  affiliateCode?: string | null
  meta?: JsonRecord
}): Promise<CheckoutSessionResult> {
  void input
  throw new Error(
    'PayMongo checkout not implemented. Wire paymongoCreateCheckoutSession() to PayMongo API.',
  )
}

async function paypalCreatePortalSession(input: {
  userId: string
  returnUrl: string
  meta?: JsonRecord
}): Promise<PortalSessionResult> {
  void input
  throw new Error('PayPal portal not implemented. Wire paypalCreatePortalSession() to PayPal API.')
}

async function paymongoCreatePortalSession(input: {
  userId: string
  returnUrl: string
  meta?: JsonRecord
}): Promise<PortalSessionResult> {
  void input
  throw new Error(
    'PayMongo portal not implemented. Wire paymongoCreatePortalSession() to PayMongo API.',
  )
}

async function createProviderCheckoutSession(
  provider: ProviderId,
  input: {
    userId: string
    plan: string
    successUrl: string
    cancelUrl: string
    returnUrl?: string
    idempotencyKey?: string
    affiliateCode?: string | null
    meta?: JsonRecord
  },
): Promise<CheckoutSessionResult> {
  if (provider === 'paypal') {
    return paypalCreateCheckoutSession(input)
  }
  return paymongoCreateCheckoutSession(input)
}

async function createProviderPortalSession(
  provider: ProviderId,
  input: {
    userId: string
    returnUrl: string
    meta?: JsonRecord
  },
): Promise<PortalSessionResult> {
  if (provider === 'paypal') {
    return paypalCreatePortalSession(input)
  }
  return paymongoCreatePortalSession(input)
}

async function recordPaymentEvent(payload: PaymentEventPayload): Promise<void> {
  log.info('payment_event', payload)

  try {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase.from('payments_events').insert({
      event_type: payload.event,
      provider: payload.provider,
      user_id: payload.userId,
      plan: payload.plan ?? null,
      amount_minor: payload.amountMinor ?? null,
      currency: payload.currency ?? null,
      meta: payload.meta ?? {},
    })

    if (error) {
      log.warn('payment_event_insert_failed', {
        error: error.message,
      })
    }
  } catch (error) {
    log.warn('payment_event_insert_threw', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Routes

router.post(
  '/checkout',
  async (
    req: Request,
    res: Response<CheckoutResponse>,
  ): Promise<Response<CheckoutResponse>> => {
    const parseResult = checkoutSchema.safeParse(req.body)
    if (!parseResult.success) {
      return sendValidationError(res, parseResult.error) as Response<CheckoutResponse>
    }

    const body = parseResult.data
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized',
      })
    }

    const idempotencyKey = req.header('idempotency-key') || undefined

    try {
      const { profile } = await loadProfileAndEntitlement(userId)
      const country = profile?.country ?? null

      const provider: ProviderId =
        (body.provider as ProviderId | undefined) ?? resolveDefaultProvider(country)

      const successUrl = makeAbsoluteUrl(body.successUrl ?? body.returnUrl, '/account')
      const cancelUrl = makeAbsoluteUrl(body.cancelUrl ?? body.returnUrl, '/pricing')
      const returnUrl = makeAbsoluteUrl(body.returnUrl ?? '/account', '/account')

      const session = await createProviderCheckoutSession(provider, {
        userId,
        plan: body.plan,
        successUrl,
        cancelUrl,
        returnUrl,
        idempotencyKey,
        affiliateCode: body.affiliateCode ?? null,
        meta: body.meta,
      })

      await recordPaymentEvent({
        event: 'checkout_started',
        provider,
        userId,
        plan: body.plan,
        amountMinor: session.amountMinor ?? null,
        currency: session.currency ?? null,
        externalCustomerId: session.customerId ?? null,
        externalSubscriptionId: session.subscriptionId ?? null,
        meta: {
          idempotencyKey,
          providerSessionId: session.providerSessionId ?? null,
          affiliateCode: body.affiliateCode ?? null,
          ...body.meta,
        },
      })

      return res.json({
        ok: true,
        data: {
          url: session.url,
          provider,
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      log.error('payments_checkout_failed', {
        error: message,
      })

      await recordPaymentEvent({
        event: 'checkout_error',
        provider: null,
        userId,
        plan: body.plan,
        meta: {
          reason: message,
          idempotencyKey,
        },
      })

      return res.status(500).json({
        ok: false,
        error: 'checkout_failed',
      })
    }
  },
)

router.post(
  '/portal',
  async (
    req: Request,
    res: Response<PortalResponse>,
  ): Promise<Response<PortalResponse>> => {
    const parseResult = portalSchema.safeParse(req.body)
    if (!parseResult.success) {
      return sendValidationError(res, parseResult.error) as Response<PortalResponse>
    }

    const body = parseResult.data

    const requestUserId = getUserIdFromRequest(req)
    const targetUserId = body.userId || requestUserId

    if (!targetUserId) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized',
      })
    }

    const idempotencyKey = req.header('idempotency-key') || undefined

    try {
      const { profile, entitlement } = await loadProfileAndEntitlement(targetUserId)

      let provider: ProviderId
      if (body.provider) {
        provider = body.provider
      } else if (entitlement?.provider === 'paypal' || entitlement?.provider === 'paymongo') {
        provider = entitlement.provider as ProviderId
      } else {
        const country = profile?.country ?? null
        provider = resolveDefaultProvider(country)
      }

      const returnUrl = makeAbsoluteUrl(body.returnUrl ?? '/account', '/account')

      const session = await createProviderPortalSession(provider, {
        userId: targetUserId,
        returnUrl,
        meta: body.meta,
      })

      await recordPaymentEvent({
        event: 'portal_opened',
        provider,
        userId: targetUserId,
        meta: {
          idempotencyKey,
          externalCustomerId: session.customerId ?? null,
          externalSubscriptionId: session.subscriptionId ?? null,
          ...body.meta,
        },
      })

      return res.json({
        ok: true,
        data: {
          url: session.url,
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      log.error('payments_portal_failed', {
        userId: targetUserId,
        error: message,
      })

      await recordPaymentEvent({
        event: 'portal_error',
        provider: null,
        userId: targetUserId,
        meta: {
          reason: message,
          idempotencyKey,
        },
      })

      return res.status(500).json({
        ok: false,
        error: 'portal_failed',
      })
    }
  },
)

export default router
