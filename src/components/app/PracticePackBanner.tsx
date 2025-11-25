// src/components/app/PracticePackBanner.tsx
import Link from 'next/link'
import { BookOpenCheck, Sparkles } from 'lucide-react'

import { coreGet } from '@/lib/fetch-core'
import { getServerSession } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { CoachKey } from '@/types'
import { COACH_AVATAR, COACH_LABELS, isCoachKey } from '@/lib/coaches'

type WeeklyPackDrill = {
  drill_id: string
  title: string
  coach_key?: CoachKey | null
}

type WeeklyPack = {
  week_of: string
  drills: WeeklyPackDrill[]
  vocab_review_count: number
  reflection_prompt: string | null
}

type WeeklyPackResponse = {
  ok: boolean
  data?: WeeklyPack
  correlation_id?: string
}

const log = logger.child('practice-pack-banner')

export default async function PracticePackBanner() {
  const session = await getServerSession()
  if (!session) return null

  let pack: WeeklyPack | null = null

  try {
    type PracticePackResult = WeeklyPackResponse | WeeklyPack
    const res = await coreGet<PracticePackResult>('/api/practice-pack/weekly', {
      authBearer: session.access_token,
      cache: 'no-store',
    })

    // Support both wrapped { ok, data } and raw WeeklyPack shapes
    if ('data' in res && res.data) {
      pack = res.data
    } else if ('week_of' in res) {
      pack = res
    }
  } catch (error) {
    log.warn('weekly_pack_fetch_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }

  if (!pack) return null

  const weekLabel = formatDate(pack.week_of)
  const drills = pack.drills ?? []
  const drillCount = drills.length
  const firstDrill = drills[0]?.title

  return (
    <section className="mb-3 rounded-3xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-xs text-slate-800 shadow-sm shadow-sky-900/5 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-slate-100">
      <div className="flex flex-wrap items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/80 text-sky-600 shadow-sm dark:bg-sky-900/50 dark:text-sky-100">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span>Weekly Practice Pack</span>
              {weekLabel && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-100">
                  Week of {weekLabel}
                </span>
              )}
            </p>
            <p className="text-[11px] leading-snug">
              {drillCount > 0 && (
                <>
                  <span className="font-semibold">{drillCount}</span> drill
                  {drillCount === 1 ? '' : 's'}
                  {firstDrill ? ` (e.g., “${firstDrill}”)` : ''},{' '}
                </>
              )}
              <span className="font-semibold">{pack.vocab_review_count}</span> vocab items to review,
              and one reflection prompt to close the week.
            </p>
            {pack.reflection_prompt && (
              <p className="text-[11px] text-slate-700 dark:text-slate-200">
                <Sparkles className="mr-1 inline-block h-3 w-3 text-sky-500" />
                <span className="italic">Reflection: {pack.reflection_prompt}</span>
              </p>
            )}
          </div>

          {drills.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {drills.slice(0, 3).map((drill) => {
                const coachKey =
                  drill.coach_key && isCoachKey(drill.coach_key) ? drill.coach_key : undefined
                const coachAvatar = coachKey ? COACH_AVATAR[coachKey] : null
                const coachLabel = coachKey ? COACH_LABELS[coachKey] : null

                return (
                  <span
                    key={drill.drill_id}
                    className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-white/80 px-2.5 py-1 text-[11px] text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-100"
                  >
                    {coachAvatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coachAvatar}
                        alt={coachLabel ?? 'Coach avatar'}
                        className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                      />
                    )}
                    <span className="truncate font-semibold">{drill.title}</span>
                    {coachLabel && (
                      <span className="hidden truncate text-[10px] text-slate-500 sm:inline">
                        {coachLabel}
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-2xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Open weekly pack
          </Link>
        </div>
      </div>
    </section>
  )
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
  } catch {
    return value
  }
}
