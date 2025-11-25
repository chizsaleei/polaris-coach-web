// src/app/api/pay/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { corePost, CoreError, idempotencyKey } from '@/lib/fetch-core'
import { requireUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { PlanId } from '@/types'

export const dynamic = 'force-dynamic'

type CheckoutData = {
  provider: string
  url: string
  reference: string
  provider_session_id?: string | null
}

type CheckoutResponse = {
  ok: boolean
  data?: CheckoutData
  correlation_id?: string
}

/**
 * Shared implementation so GET and POST can both start a checkout session.
 */
async function handleCheckout(
  request: NextRequest,
  plan: string,
  affiliateCode?: string,
): Promise<NextResponse> {
  // Ensure the user is logged in; requireUser will redirect if not.
  const user = await requireUser('/login')

  const url = new URL(request.url)

  const origin = url.origin
  const base =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    process.env.APP_BASE_URL ||
    origin

  const successUrl = buildAbsoluteUrl(base, '/account?billingSuccess=1')
  const cancelUrl = buildAbsoluteUrl(base, '/pricing?billingError=1')
  const locale = request.headers.get('accept-language') || undefined

  const payload = {
    userId: user.id,
    plan,
    locale,
    affiliateCode,
    successUrl,
    cancelUrl,
  }

  try {
    const result = await corePost<CheckoutResponse>(
      '/v1/payments/checkout',
      payload,
      {
        headers: { 'idempotency-key': idempotencyKey() },
        cache: 'no-store',
      },
    )

    const checkoutUrl = result?.data?.url
    if (!result?.ok || !checkoutUrl) {
      logger.error('pay_checkout_missing_url', { result })
      return NextResponse.redirect(new URL('/pricing?billingError=1', base))
    }

    // Redirect the browser to the payment provider page
    return NextResponse.redirect(checkoutUrl)
  } catch (err) {
    if (err instanceof CoreError) {
      logger.error('pay_checkout_core_error', {
        code: err.code,
        status: err.status,
        requestId: err.requestId,
      })
    } else {
      logger.error('pay_checkout_unexpected_error', { error: String(err) })
    }
    return NextResponse.redirect(new URL('/pricing?billingError=1', base))
  }
}

/**
 * GET /api/pay/checkout?plan=vip_monthly&aff=CODE
 * Used by buttons/links in the UI.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const plan = (url.searchParams.get('plan') || '') as PlanId | ''
  const affiliateCode = url.searchParams.get('aff') || undefined

  if (!plan) {
    const base =
      process.env.NEXT_PUBLIC_APP_BASE_URL ||
      process.env.APP_BASE_URL ||
      url.origin
    return NextResponse.redirect(new URL('/pricing?billingError=1', base))
  }

  return handleCheckout(request, plan, affiliateCode)
}

/**
 * POST /api/pay/checkout
 * Optional JSON body: { plan: "vip_monthly", affiliateCode?: "CODE" }
 * Useful if you want to call via fetch on the client.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)

  let body: { plan?: string; affiliateCode?: string; aff?: string } | null =
    null
  try {
    body = (await request.json()) as {
      plan?: string
      affiliateCode?: string
      aff?: string
    }
  } catch {
    body = null
  }

  const planFromBody = body?.plan || body?.aff
  const planFromQuery = url.searchParams.get('plan')
  const plan = (planFromBody || planFromQuery || '') as PlanId | ''

  const affiliateCode =
    body?.affiliateCode ||
    body?.aff ||
    url.searchParams.get('aff') ||
    undefined

  if (!plan) {
    const base =
      process.env.NEXT_PUBLIC_APP_BASE_URL ||
      process.env.APP_BASE_URL ||
      url.origin
    return NextResponse.redirect(new URL('/pricing?billingError=1', base))
  }

  return handleCheckout(request, plan, affiliateCode)
}

function buildAbsoluteUrl(base: string, path: string): string {
  const normalizedBase = base.startsWith('http') ? base : `https://${base}`
  const trimmedBase = normalizedBase.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${trimmedBase}${normalizedPath}`
}
