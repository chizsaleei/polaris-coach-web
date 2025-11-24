// src/components/app/EntitlementGuard.tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { coreGet } from '@/lib/fetch-core'
import { getServerSession } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

type TierName = 'free' | 'pro' | 'vip'

interface Capabilities {
  tier: TierName
  session_minutes_daily: number
  active_coaches: number
  tools_allowed: string[]
  library_filters: string[]
  coach_switch_cooldown_until: string | null
}

/**
 * EntitlementGuard
 *
 * Server-side wrapper for all in-app pages.
 * - Ensures there is an authenticated Supabase session (redirects to /login otherwise)
 * - Fetches the server-owned capabilities object from Polaris Core
 * - Logs errors but does not block rendering if the capabilities call fails
 *
 * The capabilities object can later be threaded into context or props
 * to gate specific tools and flows. For now it is read and discarded
 * so layout and children remain simple.
 */
const log = logger.child('entitlement-guard')

export default async function EntitlementGuard({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  try {
    const res = await coreGet<{ ok?: boolean; data?: Capabilities } | Capabilities>(
      '/api/user/capabilities',
      {
        authBearer: session.access_token,
        cache: 'no-store',
      },
    )

    const body = res as any
    const caps: Capabilities | null =
      body?.data ?? (body && body.tier ? (body as Capabilities) : null)

    if (!caps) {
      log.warn('capabilities_missing', { reason: 'empty_response' })
    } else {
      log.debug('capabilities_loaded', {
        tier: caps.tier,
        minutes: caps.session_minutes_daily,
        tools: caps.tools_allowed,
      })
    }
  } catch (error) {
    log.warn('capabilities_fetch_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return <>{children}</>
}
