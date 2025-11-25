// src/app/(app)/onboarding/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Target, Users2 } from 'lucide-react'

import { corePost, idempotencyKey } from '@/lib/fetch-core'
import { Analytics } from '@/lib/analytics'
import { requireUser } from '@/lib/supabase/server'
import type { QuizAnswers, CoachRec, SevenDayPlan, StarterDrill } from '@/types'

/**
 * OnboardingPage
 *
 * Collects a short quiz so Polaris can rank coaches, set difficulty,
 * and generate a 7-day starter plan.
 *
 * When recommended coaches are surfaced on this page, each coach card
 * should render its avatar using the shared coach avatar map
 * (for example, COACH_AVATAR[coachKey] pointing to
 * public/coach-assets/<coach-slug>/avatar-*.webp).
 */
export const metadata: Metadata = {
  title: 'Onboarding • Polaris Coach',
  description:
    'Answer a short quiz so Polaris can match you with the right coach, difficulty, and a 7-day starter plan.',
}

export const revalidate = 0

type SearchParams = Record<string, string | string[] | undefined>

type OnboardingResult = {
  recommendations: CoachRec[]
  starterDrills: StarterDrill[]
  sevenDayPlan: SevenDayPlan
}

export default async function OnboardingPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser('/login')
  const error = typeof searchParams?.error === 'string' ? searchParams.error : undefined

  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Welcome
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Let&apos;s pick the right coach for you, {firstNameFromMetadata(user.user_metadata)}.
            </h1>
            <p className="mt-3 text-base text-slate-700 dark:text-slate-200">
              This one-minute quiz captures your goal, profession, and difficulty preference. Polaris
              uses it to rank coaches, generate a 7-day plan, and tune your early drills.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white dark:bg-slate-900">
            <p className="font-semibold">What you&apos;ll get</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-100">
              <li>3 to 5 recommended coaches, with one best fit</li>
              <li>A 7-day starter plan (drills, vocab, reflection)</li>
              <li>Difficulty tuned to your current level</li>
            </ul>
          </div>
        </div>
        <ul className="mt-6 grid gap-3 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-3">
          <li className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4">
            <Users2 className="mt-0.5 h-5 w-5 text-sky-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Coach match</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                We score your answers against each coach&apos;s domain, audience, and time budget.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4">
            <Target className="mt-0.5 h-5 w-5 text-amber-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Right difficulty</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Early drills aim for challenging but doable so you see progress without burnout.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">7-day plan</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Three drills, one vocab review, and one reflection, with guardrails to avoid repeats.
              </p>
            </div>
          </li>
        </ul>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-100"
        >
          {error === 'core'
            ? 'We could not save your answers. Please try again in a moment.'
            : 'Something went wrong while submitting your onboarding answers.'}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Tell us about your goal
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Answers stay private. Polaris and your AI coach use them to pick drills and feedback that
          actually fit your work and exams.
        </p>

        <form action={submitOnboarding} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                First name
              </label>
              <input
                name="firstName"
                required
                autoComplete="given-name"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Alex"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Profession or exam track
              </label>
              <input
                name="profession"
                required
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g., ICU nurse, MRCP candidate, IELTS student, product manager"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Main communication goal
            </label>
            <textarea
              name="goal"
              required
              rows={3}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder='For example: "Pass IELTS speaking with band 7", "Run clearer standups", or "Pass MRCP viva cases."'
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Where do you need English most?
            </label>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add 2 to 4 domains, separated by commas (for example, IELTS, OSCE, standups,
              interviews, client calls).
            </p>
            <input
              name="domains"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="IELTS, interviews, standups"
            />
          </div>

          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Priorities (pick 1 to 3)
            </legend>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {priorityOptions.map((p) => (
                <label
                  key={p.value}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 transition hover:border-sky-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    name="priorities"
                    value={p.value}
                    className="h-3 w-3 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-semibold">{p.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              How challenging should early drills feel?
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                name="difficulty"
                min={1}
                max={5}
                defaultValue={3}
                className="flex-1"
              />
              <div className="w-32 text-right text-xs text-slate-500 dark:text-slate-400">
                <span className="block font-semibold">1 to 5</span>
                <span>1 = very easy, 5 = very hard</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 md:flex-row md:items-center md:justify-between">
            <p>
              After you submit, we will match you to coaches, generate a 7-day plan, and send you to{' '}
              <Link href="/explore" className="font-semibold underline">
                Explore
              </Link>{' '}
              with your best fit coach highlighted.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              Save and continue
            </button>
          </div>
        </form>
      </section>

      <div className="text-sm text-slate-500">
        Already set things up?{' '}
        <Link className="font-semibold text-slate-900 underline" href="/dashboard">
          Go to your dashboard
        </Link>
      </div>
    </main>
  )
}

const priorityOptions: { value: QuizAnswers['priorities'][number]; label: string }[] = [
  { value: 'fluency', label: 'Fluency and flow' },
  { value: 'interview', label: 'Job interviews' },
  { value: 'exam', label: 'Exams (IELTS, TOEFL, OSCE)' },
  { value: 'leadership', label: 'Leadership and meetings' },
  { value: 'technical', label: 'Technical presentations' },
  { value: 'medical', label: 'Medical communication' },
  { value: 'nursing', label: 'Nursing and handoffs' },
  { value: 'finance', label: 'Finance and markets' },
  { value: 'admissions', label: 'Admissions and applications' },
  { value: 'personal', label: 'Personal development' },
]

// Server action: submit onboarding answers to Polaris Core
async function submitOnboarding(formData: FormData) {
  'use server'

  const user = await requireUser('/login')

  const answers: QuizAnswers = {
    firstName: requiredString(formData.get('firstName')),
    profession: requiredString(formData.get('profession')),
    goal: requiredString(formData.get('goal')),
    domains: parseDomains(formData.get('domains')),
    priorities: parsePriorities(formData.getAll('priorities')),
    difficulty: parseDifficulty(formData.get('difficulty')),
  }

  let bestCoach: CoachRec['coach'] | undefined

  try {
    // Adjust path if your core uses a different route.
    const result = await corePost<OnboardingResult>(
      '/v1/onboarding/quiz',
      { answers },
      {
        headers: {
          'x-user-id': user.id,
          'idempotency-key': idempotencyKey(),
        },
        cache: 'no-store',
      },
    )

    bestCoach = result?.recommendations?.[0]?.coach
  } catch (error) {
    console.error('[onboarding] submit failed', error)
    redirect('/onboarding?error=core')
  }

  const difficultyBand =
    answers.difficulty <= 2 ? 'easy' : answers.difficulty <= 4 ? 'medium' : 'hard'

  await Analytics.onboardingCompleted({
    userId: user.id,
    difficulty: difficultyBand,
    domain: answers.domains[0],
    meta: { priorities: answers.priorities },
  })

  if (bestCoach) {
    await Analytics.coachSelected({
      userId: user.id,
      coachId: bestCoach,
      meta: { source: 'onboarding_quiz' },
    })
    redirect(`/explore?coach=${encodeURIComponent(bestCoach)}`)
  }

  redirect('/explore')
}

function requiredString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function parseDomains(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function parsePriorities(values: FormDataEntryValue[]): QuizAnswers['priorities'] {
  const allowed: readonly QuizAnswers['priorities'][number][] = [
    'fluency',
    'interview',
    'exam',
    'leadership',
    'technical',
    'medical',
    'nursing',
    'finance',
    'admissions',
    'personal',
  ]
  const allowedSet = new Set(allowed)
  const out: QuizAnswers['priorities'] = []
  for (const v of values) {
    if (typeof v !== 'string') continue
    if (allowedSet.has(v as QuizAnswers['priorities'][number]) && out.length < 3) {
      out.push(v as QuizAnswers['priorities'][number])
    }
  }
  if (out.length === 0) out.push('fluency')
  return out
}

function parseDifficulty(value: FormDataEntryValue | null): QuizAnswers['difficulty'] {
  const num = Number(value)
  if (!Number.isFinite(num)) return 3
  const clamped = Math.min(5, Math.max(1, Math.round(num)))
  return clamped as QuizAnswers['difficulty']
}

type UserMetadata = {
  full_name?: string | null
}

function firstNameFromMetadata(meta: Record<string, unknown> | undefined): string {
  const userMeta = (meta ?? {}) as UserMetadata
  const full = userMeta.full_name ?? undefined
  if (!full) return 'there'
  const first = full.split(' ')[0]
  return first || 'there'
}
