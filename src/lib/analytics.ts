/* Lightweight analytics client.
   - Works in browser and on server
   - Tracks the core product events you defined
   - Ships via fetch to /api/analytics or /api/admin/audit
   - Falls back to logger if the endpoint is missing
*/

import { logger } from './logger'
import { manilaDateKey, nowInManila, safeStringifyJSON } from './utils'
import { ANALYTICS_EVENTS, DEFAULT_FEATURE_FLAGS } from './constants'

// Allow both constants-defined events and an extra weekly recap event
type EventName =
  | (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
  | 'weekly_recap_viewed'

type TierCode = 'FREE' | 'PRO' | 'VIP'
type DifficultyBand = 'easy' | 'medium' | 'hard'

export type AnalyticsPayload<E extends EventName = EventName> = {
  event: E
  userId?: string
  coachId?: string
  tier?: TierCode
  country?: string
  domain?: string // e.g., IELTS, OSCE, Leadership
  topic?: string
  difficulty?: DifficultyBand
  msOnTask?: number
  score?: number // rubric or objective score
  success?: boolean
  meta?: Record<string, unknown>
}

const ENDPOINTS = ['/api/analytics', '/api/admin/audit'] as const

/** Post event to the first working endpoint. */
async function postEvent(body: Record<string, unknown>): Promise<boolean> {
  if (typeof fetch !== 'function') return false

  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringifyJSON(body),
        keepalive: true, // allows unload beacons in browser
      })
      if (res.ok) return true
    } catch {
      // try next endpoint
    }
  }
  return false
}

function enrichBase(p: AnalyticsPayload): Record<string, unknown> {
  const now = new Date()
  return {
    ...p,
    ts: now.toISOString(),
    manilaDate: manilaDateKey(nowInManila()),
    href: typeof window !== 'undefined' ? window.location.href : undefined,
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    app: 'polaris-coach-web',
    // Snapshot of client-side flags at event time; core remains source of truth.
    flags: DEFAULT_FEATURE_FLAGS,
  }
}

/** Track an analytics event. Safe to call from client or server code. */
export async function track(p: AnalyticsPayload): Promise<void> {
  const body = enrichBase(p)
  const ok = await postEvent(body)
  if (!ok) {
    logger.event(p.event, body as Record<string, unknown>)
  }
}

/** Small helpers for very common events. */
export const Analytics = {
  onboardingCompleted(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['ONBOARDING_COMPLETED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.ONBOARDING_COMPLETED, ...args })
  },

  coachSelected(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['COACH_SELECTED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.COACH_SELECTED, ...args })
  },

  practiceStarted(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['PRACTICE_STARTED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.PRACTICE_STARTED, ...args })
  },

  practiceSubmitted(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['PRACTICE_SUBMITTED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.PRACTICE_SUBMITTED, ...args })
  },

  feedbackViewed(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['FEEDBACK_VIEWED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.FEEDBACK_VIEWED, ...args })
  },

  vocabSaved(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['VOCAB_SAVED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.VOCAB_SAVED, ...args })
  },

  dayCompleted(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['DAY_COMPLETED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.DAY_COMPLETED, ...args })
  },

  planUpgraded(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['PLAN_UPGRADED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.PLAN_UPGRADED, ...args })
  },

  paymentStatus(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['PAYMENT_STATUS']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.PAYMENT_STATUS, ...args })
  },

  coachSwitched(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['COACH_SWITCHED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.COACH_SWITCHED, ...args })
  },

  drillOpened(
    args: Omit<
      AnalyticsPayload<(typeof ANALYTICS_EVENTS)['DRILL_OPENED']>,
      'event'
    >,
  ) {
    return track({ event: ANALYTICS_EVENTS.DRILL_OPENED, ...args })
  },

  // Weekly recap views are tracked with a string literal event name
  weeklyRecapViewed(
    args: Omit<AnalyticsPayload<'weekly_recap_viewed'>, 'event'>,
  ) {
    return track({ event: 'weekly_recap_viewed', ...args })
  },
}

/** Simple duration helper for measuring blocks of work. */
export async function withTiming<T>(
  label: string,
  fn: () => Promise<T> | T,
  extra?: Omit<AnalyticsPayload, 'event' | 'msOnTask'>,
): Promise<T> {
  const start = performanceNow()
  try {
    const res = await fn()
    const ms = performanceNow() - start
    await track({
      event: ANALYTICS_EVENTS.FEEDBACK_VIEWED,
      msOnTask: ms,
      ...(extra || {}),
    })
    return res
  } catch (e) {
    const ms = performanceNow() - start
    await track({
      event: ANALYTICS_EVENTS.FEEDBACK_VIEWED,
      msOnTask: ms,
      success: false,
      meta: {
        ...(extra?.meta ?? {}),
        label,
        error: String((e as Error)?.message || e),
      },
      ...(extra || {}),
    })
    throw e
  }
}

function performanceNow(): number {
  if (typeof performance !== 'undefined' && performance.now) return performance.now()
  // Node fallback with less precision
  return Number(process.hrtime.bigint() / BigInt(1_000_000))
}
