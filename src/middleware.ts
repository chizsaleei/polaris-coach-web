// src/middleware.ts

import { NextResponse, type NextRequest } from 'next/server'
import { checkRate, withRateHeaders, RatePresets } from './app/api/middleware/rate-limit'

// Apply to API routes only (see config.matcher below)
export async function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const path = url.pathname

  // Always allow preflight
  if (req.method === 'OPTIONS') {
    return NextResponse.next()
  }

  // Bypass health checks quickly
  if (path === '/api/health' || path === '/api/server/health') {
    return NextResponse.next()
  }

  // Pick a preset by route
  let spec = RatePresets.defaultApi
  let routeKey: 'api' | 'auth' | 'chat' | 'pay_webhook' = 'api'

  if (path.startsWith('/api/auth')) {
    spec = RatePresets.authTight
    routeKey = 'auth'
  } else if (path.startsWith('/api/chat')) {
    spec = RatePresets.chatBurst
    routeKey = 'chat'
  } else if (path.startsWith('/api/pay/webhooks')) {
    // Payments webhooks (PayPal / PayMongo) share the same tight preset
    spec = RatePresets.webhook
    routeKey = 'pay_webhook'
  }

  // Optional allow list for internal monitors
  const ua = req.headers.get('user-agent') || ''
  if (ua.includes('Vercelbot') || ua.includes('HealthCheck')) {
    return NextResponse.next()
  }

  // Apply rate limit
  const result = await checkRate(req, spec, routeKey)

  if (!result.allowed) {
    const body = JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again shortly.',
    })

    const resp = new NextResponse(body, {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })

    return withRateHeaders(resp, spec, result)
  }

  // Pass through, plus hint headers
  const resp = NextResponse.next()
  return withRateHeaders(resp, spec, result)
}

// Only run on API routes. Adjust if you want to include others.
export const config = {
  matcher: ['/api/:path*'],
}
