// src/components/app/WeeklyRecapCard.tsx

import Link from 'next/link'
import { ArrowRight, LineChart, Sparkles } from 'lucide-react'

import { coreGet } from '@/lib/fetch-core'
import { getServerSession } from '@/lib/supabase/server'
import { Analytics } from '@/lib/analytics'
import { logger } from '@/lib/logger'
import type { CoachKey } from '@/types'
import { COACH_AVATAR, COACH_LABELS } from '@/lib/coaches'

type WeeklyRecapDrill = {
  drill_id: string
  title: string
  coach_key?: CoachKey | null
}

type WeeklyRecap = {
  week_of: string
  drills: WeeklyRecapDrill[]
  vocab_review_count: number
  reflection_prompt: string
}

type WeeklyRecapResponse = {
  ok: boolean
  data?: WeeklyRecap
  correlation_id?: string
}

const log = logger.child('weekly-recap-card')

function isWeeklyRecapResponse(
  value: WeeklyRecapResponse | WeeklyRecap,
): value is WeeklyRecapResponse {
  return (value as WeeklyRecapResponse).ok !== undefined
}

export default async function WeeklyRecapCard() {
  const session = await getServerSession()

  // Strong guard so TS knows user is available and not null
  if (!session || !session.user) return null

  const userId: string = session.user.id

  let recap: WeeklyRecap | null = null

  try {
    const res = await coreGet<WeeklyRecapResponse | WeeklyRecap>('/api/practice-pack/weekly', {
      authBearer: session.access_token,
      cache: 'no-store',
    })

    if (isWeeklyRecapResponse(res)) {
      if (!res.ok || !res.data) {
        // Failed or empty response, nothing to show
        return null
      }
      recap = res.data
    } else {
      // Direct WeeklyRecap payload from core
      recap = res
    }
  } catch (error) {
    log.warn('weekly_recap_fetch_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }

  if (!recap) return null

  const weekLabel = formatDate(recap.week_of)
  const drills = recap.drills ?? []
  const hasDrills = drills.length > 0

  // Fire and forget analytics; do not block rendering
  void Analytics.weeklyRecapViewed({
    userId,
    success: true,
    meta: {
      week_of: recap.week_of,
      drills: drills.length,
      vocab_review_count: recap.vocab_review_count,
    },
  })

  return (
    <section className="mt-3 rounded-3xl border border-slate-200 bg-white/95 p-5 text-sm text-slate-800 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A] dark:text-slate-100">
      <header className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <LineChart className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Weekly recap
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {weekLabel ? `This week · ${weekLabel}` : 'This week'}
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Three wins, two fixes, and next drills based on your recent practice. Your email recap
            matches this card.
          </p>
        </div>
      </header>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Suggested drills
          </p>
          {hasDrills ? (
            <ol className="mt-1 space-y-1.5">
              {drills.slice(0, 3).map((drill) => {
                const coachKey =
                  drill.coach_key && isCoachKey(drill.coach_key) ? drill.coach_key : undefined
                const coachAvatar = coachKey ? COACH_AVATAR[coachKey] : null
                const coachLabel = coachKey ? COACH_LABELS[coachKey] : null

                return (
                  <li key={drill.drill_id} className="flex items-center gap-2">
                    {coachAvatar && (
                      <img
                        src={coachAvatar}
                        alt={coachLabel ?? 'Coach avatar'}
                        className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-slate-900 dark:text-slate-50">
                        {drill.title}
                      </p>
                      {coachLabel && (
                        <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {coachLabel}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              No drill suggestions yet. Run a few sessions this week to see tailored next steps.
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Vocabulary due: <span className="font-semibold">{recap.vocab_review_count}</span> items
            in spaced review.
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Reflection
          </p>
          <p className="mt-1 text-[11px] leading-relaxed">
            <Sparkles className="mr-1 inline-block h-3 w-3 text-sky-500" />
            {recap.reflection_prompt}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Take 2–3 minutes to jot or speak a quick reflection on what improved, what stayed hard,
            and one change you will test next week.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          Recaps use the same data as your analytics: attempts, WPM, clarity, and task success.
        </span>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 rounded-2xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          View full dashboard
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  )
}

function isCoachKey(value: string | null | undefined): value is CoachKey {
  if (!value) return false
  return Object.prototype.hasOwnProperty.call(COACH_LABELS, value)
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}
