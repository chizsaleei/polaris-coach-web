// src/components/app/CoachSwitchNotice.tsx
import { Timer, Users2 } from 'lucide-react'

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

const log = logger.child('coach-switch-notice')

function formatWindow(until: Date, now: Date) {
  const ms = until.getTime() - now.getTime()
  const minutesTotal = Math.max(0, Math.round(ms / 60000))
  const hours = Math.floor(minutesTotal / 60)
  const minutes = minutesTotal % 60

  const timeFmt = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  })
  const dateFmt = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  })

  const sameDay = until.toDateString() === now.toDateString()
  const whenLabel = sameDay
    ? `today at ${timeFmt.format(until)}`
    : `${dateFmt.format(until)} at ${timeFmt.format(until)}`

  let remaining = ''
  if (hours > 0 && minutes > 0) remaining = `${hours}h ${minutes}m`
  else if (hours > 0) remaining = `${hours}h`
  else remaining = `${minutes}m`

  return { whenLabel, remaining }
}

export default async function CoachSwitchNotice() {
  const session = await getServerSession()
  if (!session) return null

  let caps: Capabilities | null = null

  try {
    type CapabilitiesResponse = { ok?: boolean; data?: Capabilities | null } | Capabilities
    const res = await coreGet<CapabilitiesResponse>('/api/user/capabilities', {
      authBearer: session.access_token,
      cache: 'no-store',
    })

    if ('data' in res && res.data) {
      caps = res.data
    } else if ('tier' in res) {
      caps = res
    }
  } catch (error) {
    log.warn('capabilities_fetch_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }

  if (!caps) return null
  if (caps.tier === 'vip') return null

  const now = new Date()
  const until = caps.coach_switch_cooldown_until
    ? new Date(caps.coach_switch_cooldown_until)
    : null

  if (!until || until <= now) return null

  const { whenLabel, remaining } = formatWindow(until, now)
  const tierLabel = caps.tier === 'free' ? 'Free' : caps.tier === 'pro' ? 'Pro' : 'VIP'

  return (
    <aside className="mb-3 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-sm shadow-amber-900/5 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-100">
      <div className="flex flex-wrap items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/70 text-amber-600 shadow-sm dark:bg-amber-900/40 dark:text-amber-100">
          <Timer className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
            <span>Coach switch cooldown</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
              <Users2 className="h-3 w-3" />
              {tierLabel} plan
            </span>
          </p>
          <p className="text-[11px] leading-snug">
            You recently switched coaches. On your {tierLabel} plan you can switch again{' '}
            <span className="font-semibold">{whenLabel}</span> ({remaining} remaining). Free and
            Pro keep one active coach at a time; VIP has no cooldown.
          </p>
        </div>
      </div>
    </aside>
  )
}
