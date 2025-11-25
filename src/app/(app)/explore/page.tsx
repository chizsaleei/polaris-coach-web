// src/app/(app)/explore/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Compass, Filter, ShieldAlert, Sparkles } from 'lucide-react'

import { logger } from '@/lib/logger'
import { getSupabaseServerClient, requireUser } from '@/lib/supabase/server'
import { toQuery } from '@/lib/utils'
import type { CoachKey } from '@/types'

const exploreLog = logger.child('explore')

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Explore • Polaris Coach',
  description:
    'Browse public drills by coach, topic, and difficulty to find your next practice scenario.',
}

type SearchParams = Record<string, string | string[] | undefined>

type DrillSummary = {
  id: string
  title: string
  coachKey: string | null
  tags: string[]
  difficulty: number | null
  timeEstimate: number | null
  createdAt: string | null
}

type ExploreFilters = {
  coaches: CoachKey[]
  topics: string[]
  difficultyMin: number | null
  difficultyMax: number | null
  fromDate: string | null
}

type CoachMeta = {
  key: CoachKey
  name: string
  title: string
  audience: string
  domain:
    | 'general'
    | 'exam'
    | 'medical'
    | 'nursing'
    | 'finance'
    | 'leadership'
    | 'technical'
    | 'personal'
}

type CoachAvatarMeta = {
  src: string
  alt: string
}

type DrillRow = {
  id: string
  title: string
  tags?: string[] | null
  coach_key?: string | null
  time_estimate_minutes?: number | null
  difficulty?: number | null
  created_at?: string | null
}

type ExploreSearchParams = {
  coach?: string | string[]
  topic?: string | string[]
  difficultyMin?: string | string[]
  difficultyMax?: string | string[]
  fromDate?: string | string[]
  [key: string]: string | string[] | undefined
}

type UserMetadata = {
  full_name?: string | null
}

// Shared avatar map: coach key -> public/coach-assets/<coach-slug>/avatar-256.webp
const COACH_AVATAR: Partial<Record<CoachKey, CoachAvatarMeta>> = {
  chase_krashen: {
    src: '/coach-assets/chase-krashen/avatar-256.webp',
    alt: 'Chase Krashen',
  },
  dr_claire_swales: {
    src: '/coach-assets/claire-swales/avatar-256.webp',
    alt: 'Dr. Claire Swales',
  },
  carter_goleman: {
    src: '/coach-assets/carter-goleman/avatar-256.webp',
    alt: 'Carter Goleman',
  },
  chelsea_lightbown: {
    src: '/coach-assets/chelsea-lightbown/avatar-256.webp',
    alt: 'Chelsea Lightbown',
  },
  dr_clark_atul: {
    src: '/coach-assets/clark-atul/avatar-256.webp',
    alt: 'Dr. Clark Atul',
  },
  dr_crystal_benner: {
    src: '/coach-assets/crystal-benner/avatar-256.webp',
    alt: 'Dr. Crystal Benner',
  },
  christopher_buffett: {
    src: '/coach-assets/christopher-buffett/avatar-256.webp',
    alt: 'Christopher Buffett',
  },
  colton_covey: {
    src: '/coach-assets/colton-covey/avatar-256.webp',
    alt: 'Colton Covey',
  },
  cody_turing: {
    src: '/coach-assets/cody-turing/avatar-256.webp',
    alt: 'Cody Turing',
  },
  chloe_sinek: {
    src: '/coach-assets/chloe-sinek/avatar-256.webp',
    alt: 'Chloe Sinek',
  },
}

function getCoachAvatarMeta(key: CoachKey | null | undefined): CoachAvatarMeta | null {
  if (!key) return null
  return COACH_AVATAR[key] ?? null
}

const COACHES: CoachMeta[] = [
  {
    key: 'chase_krashen',
    name: 'Chase Krashen',
    title: 'Academic English and Exam Strategist',
    audience: 'Senior high, gap year, early freshmen',
    domain: 'exam',
  },
  {
    key: 'dr_claire_swales',
    name: 'Dr. Claire Swales',
    title: 'Graduate Admissions Communicator',
    audience: 'Grad applicants and research assistants',
    domain: 'exam',
  },
  {
    key: 'carter_goleman',
    name: 'Carter Goleman',
    title: 'Professional Interview Communicator',
    audience: 'Job seekers, switchers, interns, returnees',
    domain: 'general',
  },
  {
    key: 'chelsea_lightbown',
    name: 'Chelsea Lightbown',
    title: 'English Proficiency Coach (IELTS, TOEFL, ESL)',
    audience: 'IELTS or TOEFL takers, ESL learners',
    domain: 'exam',
  },
  {
    key: 'dr_clark_atul',
    name: 'Dr. Clark Atul',
    title: 'Medical Communication and Exam Coach (Physicians)',
    audience: 'Physicians and residents',
    domain: 'medical',
  },
  {
    key: 'dr_crystal_benner',
    name: 'Dr. Crystal Benner',
    title: 'Nursing Communication and Exam Coach',
    audience: 'Nursing students, RNs, NPs',
    domain: 'nursing',
  },
  {
    key: 'christopher_buffett',
    name: 'Christopher Buffett',
    title: 'Financial English and Certification Coach',
    audience: 'Finance students and professionals',
    domain: 'finance',
  },
  {
    key: 'colton_covey',
    name: 'Colton Covey',
    title: 'Business English and Leadership Coach',
    audience: 'Managers, founders, sales and ops',
    domain: 'leadership',
  },
  {
    key: 'cody_turing',
    name: 'Cody Turing',
    title: 'Technical English and Certification Coach',
    audience: 'Devs, sysadmins, SOC, cloud',
    domain: 'technical',
  },
  {
    key: 'chloe_sinek',
    name: 'Chloe Sinek',
    title: 'Personal Development and Vision Communicator',
    audience: 'Creators and early leaders',
    domain: 'personal',
  },
]

const COACH_KEY_SET = new Set<CoachKey>(COACHES.map((c) => c.key))
const COACH_BY_KEY: Record<CoachKey, CoachMeta> = COACHES.reduce(
  (acc, coach) => ({ ...acc, [coach.key]: coach }),
  {} as Record<CoachKey, CoachMeta>,
)

function isCoachKey(value: string): value is CoachKey {
  return COACH_KEY_SET.has(value as CoachKey)
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const user = await requireUser('/login')
  const filters = parseFilters(searchParams)
  const drills = await loadDrills(filters)

  const medicalCoachSelected =
    filters.coaches.includes('dr_clark_atul') ||
    filters.coaches.includes('dr_crystal_benner')
  const financeCoachSelected = filters.coaches.includes('christopher_buffett')

  const activeFilterParts: string[] = []
  if (filters.coaches.length) {
    const names = filters.coaches.map((k) => COACH_BY_KEY[k]?.name || k).join(', ')
    activeFilterParts.push(`Coach: ${names}`)
  }
  if (filters.topics.length) {
    activeFilterParts.push(`Topic: ${filters.topics.join(', ')}`)
  }
  if (filters.difficultyMin != null || filters.difficultyMax != null) {
    const min = filters.difficultyMin ?? 1
    const max = filters.difficultyMax ?? 5
    activeFilterParts.push(`Difficulty: ${min}-${max}`)
  }
  const activeFiltersLabel = activeFilterParts.join(' • ')

  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Explore
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Find the right coach and drill, {firstNameFromMetadata(user.user_metadata)}.
            </h1>
            <p className="mt-3 text-base text-slate-700 dark:text-slate-200">
              Browse public drills and coach catalogs by profession, exam, and topic. Open any drill
              in the Practice tab to run a 10 to 15 minute loop with instant rubric based feedback
              and an Expressions Pack at the end.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            <p className="flex items-center gap-2 font-semibold">
              <Filter className="h-4 w-4" />
              Tips
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              <li>Start with the coach that fits your current exam or role.</li>
              <li>Use tags and difficulty to keep drills challenging but not overwhelming.</li>
              <li>Repeat high value drills and then switch topics to avoid repetition fatigue.</li>
            </ul>
          </div>
        </div>
      </header>

      {/* Coach filters */}
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Coaches
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Pick a coach focus
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Answers from onboarding help rank coaches, but you can always browse them here.
              Filters update the drill list below.
            </p>
          </div>
        </header>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {COACHES.map((coach) => {
            const isActive = filters.coaches.includes(coach.key)
            const href = '/explore' + toQuery({ coach: coach.key })
            const avatar = getCoachAvatarMeta(coach.key)

            return (
              <Link
                key={coach.key}
                href={href}
                className={[
                  'flex flex-col rounded-2xl border p-4 text-left transition',
                  isActive
                    ? 'border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-slate-900/60'
                    : 'border-slate-200 bg-white hover:border-sky-200 dark:border-slate-800 dark:bg-slate-900/40',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="flex items-center gap-3">
                  {avatar && (
                    <Image
                      src={avatar.src}
                      alt={avatar.alt}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {coach.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {coach.title}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {coach.audience}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Drill list */}
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <Compass className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Library
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Public drills
              </h2>
            </div>
          </div>
          <div className="text-xs text-right text-slate-500">
            <p>
              Showing {drills.length} {drills.length === 1 ? 'drill' : 'drills'}.
            </p>
            {activeFiltersLabel && (
              <p className="mt-0.5 text-slate-500">Filters: {activeFiltersLabel}</p>
            )}
          </div>
        </header>

        {(medicalCoachSelected || financeCoachSelected) && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>
              Polaris Coach is an educational support tool only. It does not replace certified
              medical, nursing, or financial advice. Always confirm decisions with your own
              supervisor, care team, or licensed professional.
            </p>
          </div>
        )}

        {drills.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No public drills are available yet for this filter set. Clear filters or check back
            soon, or ask your coach in{' '}
            <Link href="/chat" className="font-semibold text-sky-600 underline">
              Practice
            </Link>{' '}
            for a custom scenario.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drills.map((drill) => {
              const coachKey =
                drill.coachKey && isCoachKey(drill.coachKey) ? drill.coachKey : null
              const coachMeta = coachKey ? COACH_BY_KEY[coachKey] : null
              const coachAvatar = coachKey ? getCoachAvatarMeta(coachKey) : null

              return (
                <Link
                  key={drill.id}
                  href="/chat"
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 text-left transition hover:border-sky-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex items-center gap-2">
                    {coachAvatar && (
                      <Image
                        src={coachAvatar.src}
                        alt={coachAvatar.alt}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {coachMeta ? coachMeta.name : 'Featured drill'}
                    </p>
                  </div>

                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    {drill.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {drill.timeEstimate
                      ? `${formatNumber(drill.timeEstimate)} min est.`
                      : 'Quick drill'}
                    {drill.difficulty != null && (
                      <span className="ml-2">• Level {drill.difficulty}/5</span>
                    )}
                  </p>
                  {drill.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {drill.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                        >
                          <Sparkles className="h-3 w-3 text-sky-500" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

async function loadDrills(filters: ExploreFilters): Promise<DrillSummary[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('drills')
    .select(
      'id, title, tags, coach_key, time_estimate_minutes, difficulty, state, is_public, created_at',
    )
    .eq('is_public', true)
    .eq('state', 'published')

  if (filters.coaches.length > 0) {
    query = query.in('coach_key', filters.coaches)
  }
  if (filters.topics.length > 0) {
    // tags is an array column; contains() matches all provided tags
    query = query.contains('tags', filters.topics)
  }
  if (filters.difficultyMin != null) {
    query = query.gte('difficulty', filters.difficultyMin)
  }
  if (filters.difficultyMax != null) {
    query = query.lte('difficulty', filters.difficultyMax)
  }
  if (filters.fromDate) {
    query = query.gte('created_at', filters.fromDate)
  }

  query = query.order('created_at', { ascending: false }).limit(30)

  const { data, error } = await query

  if (error) {
    exploreLog.error('drills query failed', { error: error.message })
    return []
  }

  const rows: DrillRow[] = Array.isArray(data) ? (data as DrillRow[]) : []

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    coachKey: row.coach_key ?? null,
    tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
    difficulty: nullableNumber(row.difficulty),
    timeEstimate: nullableNumber(row.time_estimate_minutes),
    createdAt: row.created_at ?? null,
  }))
}

function parseFilters(searchParams?: ExploreSearchParams): ExploreFilters {
  const coachParam = searchParams?.coach
  const topicParam = searchParams?.topic

  const coachValues = Array.isArray(coachParam)
    ? coachParam
    : coachParam
    ? [coachParam]
    : []
  const topicValues = Array.isArray(topicParam)
    ? topicParam
    : topicParam
    ? [topicParam]
    : []

  const coaches: CoachKey[] = coachValues
    .filter((v): v is string => typeof v === 'string')
    .filter(isCoachKey)

  const topics = topicValues
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)

  const difficultyMin = parseIntParam(searchParams?.difficultyMin)
  const difficultyMax = parseIntParam(searchParams?.difficultyMax)

  const fromDateRaw =
    typeof searchParams?.fromDate === 'string' ? searchParams.fromDate : null
  const fromDate =
    fromDateRaw && fromDateRaw.length >= 4 ? fromDateRaw.trim() : null

  return {
    coaches,
    topics,
    difficultyMin,
    difficultyMax,
    fromDate,
  }
}

function parseIntParam(value: string | string[] | undefined): number | null {
  if (Array.isArray(value)) value = value[0]
  if (typeof value !== 'string') return null
  const num = Number.parseInt(value, 10)
  return Number.isFinite(num) ? num : null
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

function firstNameFromMetadata(meta: Record<string, unknown> | undefined): string {
  const userMeta = (meta ?? {}) as UserMetadata
  const full = userMeta.full_name ?? undefined
  if (!full) return 'there'
  const first = full.split(' ')[0]
  return first || 'there'
}
