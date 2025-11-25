// src/app/(app)/practice-now/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock, Sparkles, Target } from 'lucide-react'

import { coreGet } from '@/lib/fetch-core'
import { getServerSession } from '@/lib/supabase/server'
import type { CoachKey } from '@/types'
import { COACH_LABELS } from '@/lib/coaches'

export const metadata: Metadata = {
  title: 'Practice Now | Polaris Coach',
  description:
    'Open your daily practice pack with short drills, vocab review, and one simple focus for this week.',
}

// Always fetch fresh practice data
export const dynamic = 'force-dynamic'

type PracticeNowDrill = {
  drill_id: string
  title: string
  coach_key: CoachKey
  est_minutes: number
  summary?: string | null
}

type PracticeNowPack = {
  day_of: string
  coach_key: CoachKey
  focus_note?: string | null
  drills: PracticeNowDrill[]
  vocab_due: number
}

/**
 * Daily practice page.
 * Bridge to polaris-core:
 * - calls /api/practice-pack/today on the core service
 * - expects a PracticeNowPack shape
 */
export default async function PracticeNowPage() {
  const session = await getServerSession()

  // Require sign in for this section
  if (!session) {
    redirect('/login?next=/app/practice-now')
  }

  let pack: PracticeNowPack | null = null
  let failed = false

  try {
    pack = await coreGet<PracticeNowPack>('/api/practice-pack/today', {
      authBearer: session.access_token,
      cache: 'no-store',
    })
  } catch {
    failed = true
  }

  const drills = pack?.drills ?? []

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020f1d] via-[#020912] to-[#010508] px-4 pb-12 pt-10 text-slate-50 md:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Header */}
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Practice now
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Open your daily practice pack
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
            Spend 10 to 15 minutes on focused speaking drills, then review a few key expressions.
            You can finish this even on a busy day.
          </p>
        </header>

        {/* Info and status */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr),minmax(0,0.9fr)]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900/75 p-4 shadow-sm shadow-slate-900/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Today&apos;s focus
                  </div>
                  <h2 className="mt-2 text-sm font-semibold text-slate-50">
                    {pack
                      ? coachLabel(pack.coach_key)
                      : 'Your coach will line up a fresh drill for you.'}
                  </h2>
                  <p className="mt-2 text-xs text-slate-200">
                    {pack?.focus_note ??
                      'You will see one short drill at a time, with clear wins, fixes, and one next step.'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-sky-300" />
                    About 10 to 15 minutes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-sky-300" />
                    Vocab due:{' '}
                    <span className="font-semibold">{pack ? pack.vocab_due : 0}</span>
                  </span>
                </div>
              </div>

              {failed && (
                <p className="mt-3 rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-100">
                  We could not load today&apos;s practice pack. Please refresh this page or try
                  again later.
                </p>
              )}
            </div>

            <DrillList drills={drills} />
          </div>

          {/* Side info card */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-slate-900/75 p-4 text-xs text-slate-200 shadow-sm shadow-slate-900/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                How to use this page
              </p>
              <ul className="mt-3 space-y-2">
                <li>1. Start with the first drill and speak your answer out loud.</li>
                <li>2. Read your feedback and save any expressions you like.</li>
                <li>3. If you have time, tap one more drill or review your vocab.</li>
              </ul>
              <p className="mt-3 text-xs text-slate-300">
                You can always come back to this page to continue where you stopped.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/75 p-4 text-xs text-slate-200 shadow-sm shadow-slate-900/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                See your progress
              </p>
              <p className="mt-2">
                Weekly recaps and the dashboard use the same data as this page. Every finished drill
                and saved expression counts toward your progress.
              </p>
              <Link
                href="/dashboard"
                className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-50 px-4 py-2 text-[11px] font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                View dashboard
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

function DrillList({ drills }: { drills: PracticeNowDrill[] }) {
  if (!drills.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-200">
        <p className="font-semibold text-slate-50">No drills lined up yet</p>
        <p className="mt-2">
          Once you finish the path quiz and a few starter sessions, your daily drills will appear
          here.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/path"
            className="rounded-full bg-amber-400 px-4 py-2 text-[11px] font-semibold text-slate-900 shadow-md shadow-amber-500/40 transition hover:bg-amber-300"
          >
            Take the path quiz
          </Link>
          <Link
            href="/explore"
            className="rounded-full border border-slate-600 bg-slate-900/50 px-4 py-2 text-[11px] font-semibold text-slate-50 transition hover:border-slate-300 hover:bg-slate-900"
          >
            Browse drills
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-200">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
        Today&apos;s drills
      </p>
      <ol className="mt-3 space-y-2">
        {drills.map((drill) => (
          <li
            key={drill.drill_id}
            className="flex items-start justify-between gap-3 rounded-xl bg-slate-900/80 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-50">{drill.title}</p>
              <p className="mt-1 text-[11px] text-slate-300">
                {coachLabel(drill.coach_key)} · about {drill.est_minutes} minutes
              </p>
              {drill.summary && (
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">{drill.summary}</p>
              )}
            </div>
            <Link
              href={`/chat?coach=${encodeURIComponent(
                drill.coach_key,
              )}&drill_id=${encodeURIComponent(drill.drill_id)}`}
              className="ml-2 inline-flex flex-shrink-0 items-center justify-center rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-900 transition hover:bg-sky-400"
            >
              Start
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

function coachLabel(key: CoachKey): string {
  return COACH_LABELS[key] ?? 'Your coach'
}
