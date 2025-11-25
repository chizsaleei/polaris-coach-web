// src/app/(app)/search/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search as SearchIcon, Filter, Sparkles } from 'lucide-react'

import { coreGet } from '@/lib/fetch-core'
import { requireUser } from '@/lib/supabase/server'
import type { CoachKey } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search • Polaris Coach',
  description:
    'Search drills, sessions, and expressions by coach, topic, difficulty, and date across your Polaris Coach library.',
}

type SearchParams = Record<string, string | string[] | undefined>

type SearchKind = 'drill' | 'expression' | 'session' | 'feature'

type SearchResult = {
  id: string
  kind: SearchKind
  title: string
  subtitle?: string | null
  coachKey?: CoachKey | null
  topic?: string | null
  difficulty?: number | null
  minutes?: number | null
  tags?: string[]
  href: string
  createdAt?: string | null
}

type SearchResponse = {
  results: SearchResult[]
}

type ParsedFilters = {
  q: string
  coach: CoachKey | null
  kind: SearchKind | null
  topic: string | null
  difficultyMin: number | null
  difficultyMax: number | null
  fromDate: string | null
}

const COACH_LABELS: Record<CoachKey, string> = {
  chase_krashen: 'Chase Krashen · Academic English',
  dr_claire_swales: 'Dr. Claire Swales · Admissions',
  carter_goleman: 'Carter Goleman · Interviews',
  chelsea_lightbown: 'Chelsea Lightbown · IELTS/TOEFL',
  dr_clark_atul: 'Dr. Clark Atul · Physicians',
  dr_crystal_benner: 'Dr. Crystal Benner · Nursing',
  christopher_buffett: 'Christopher Buffett · Finance',
  colton_covey: 'Colton Covey · Leadership',
  cody_turing: 'Cody Turing · Technical',
  chloe_sinek: 'Chloe Sinek · Personal vision',
}

type CoachAvatarMeta = {
  src: string
  alt: string
}

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

function getCoachAvatarMeta(key?: CoachKey | null): CoachAvatarMeta | null {
  if (!key) return null
  return COACH_AVATAR[key] ?? null
}

const COACH_KEYS = new Set<CoachKey>(Object.keys(COACH_LABELS) as CoachKey[])

function isCoachKey(v: string): v is CoachKey {
  return COACH_KEYS.has(v as CoachKey)
}

const KIND_LABEL: Record<SearchKind, string> = {
  drill: 'Drills',
  expression: 'Expressions',
  session: 'Sessions',
  feature: 'Practice tools',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const user = await requireUser('/login')
  const filters = parseFilters(searchParams)
  const hasQuery =
    !!filters.q || !!filters.coach || !!filters.topic || !!filters.fromDate
  const results = hasQuery ? await fetchSearch(user.id, filters) : []

  if (!user) redirect('/login')

  const activeKind = filters.kind
  const q = filters.q

  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Search drills, sessions, and expressions.
            </h1>
            <p className="mt-3 text-base text-slate-700 dark:text-slate-200">
              Use keywords, coach filters, difficulty, and date to find the right drill
              or Expressions Pack. Open results in the Practice tab to run a focused
              10 to 15 minute loop with feedback.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            <p className="flex items-center gap-2 font-semibold">
              <Filter className="h-4 w-4" />
              Tips
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              <li>Try “IELTS Part 2”, “STAR story”, or “architecture walkthrough”.</li>
              <li>Filter by coach to stay inside one domain such as MRCP or IELTS.</li>
              <li>Use the Expressions only toggle to review saved upgrades.</li>
            </ul>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <form method="GET" className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search drills, sessions, or expressions…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:w-auto">
              <KindToggle label="All" kind={null} activeKind={activeKind} />
              <KindToggle label="Drills" kind="drill" activeKind={activeKind} />
              <KindToggle
                label="Expressions only"
                kind="expression"
                activeKind={activeKind}
              />
              <KindToggle
                label="Practice features"
                kind="feature"
                activeKind={activeKind}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
            <div className="flex flex-wrap gap-2">
              <select
                name="coach"
                defaultValue={filters.coach ?? ''}
                className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All coaches</option>
                {Object.entries(COACH_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                name="topic"
                defaultValue={filters.topic ?? ''}
                placeholder="Topic (for example OSCE, standups, market wrap)"
                className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Difficulty</span>
              <input
                type="number"
                name="difficultyMin"
                min={1}
                max={5}
                defaultValue={filters.difficultyMin ?? ''}
                placeholder="min"
                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <span>to</span>
              <input
                type="number"
                name="difficultyMax"
                min={1}
                max={5}
                defaultValue={filters.difficultyMax ?? ''}
                placeholder="max"
                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <span className="ml-4">From date</span>
              <input
                type="date"
                name="fromDate"
                defaultValue={filters.fromDate ?? ''}
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="ml-auto inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                Apply
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <header className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Results
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {results.length > 0
                ? `Found ${results.length} item${results.length === 1 ? '' : 's'}`
                : 'No results yet'}
            </h2>
          </div>
          {activeKind && (
            <p className="text-xs text-slate-500">
              Filtered to:{' '}
              <span className="font-semibold">{KIND_LABEL[activeKind]}</span>
            </p>
          )}
        </header>

        {!hasQuery && (
          <p className="mt-4 text-sm text-slate-500">
            Start by entering a keyword or phrase above. For example, try “STAR story”,
            “IELTS Part 2”, or “architecture walkthrough”.
          </p>
        )}

        {hasQuery && results.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No items matched your search. Try broadening your query or removing filters,
            then search again.
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => {
              const coachKey = item.coachKey ?? null
              const coachLabel =
                coachKey && COACH_LABELS[coachKey] ? COACH_LABELS[coachKey] : null
              const coachAvatar = coachKey ? getCoachAvatarMeta(coachKey) : null

              return (
                <Link
                  key={`${item.kind}-${item.id}`}
                  href={item.href}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 text-left transition hover:border-sky-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {KIND_LABEL[item.kind]}
                    </p>
                    {coachLabel && (
                      <div className="flex max-w-[70%] items-center gap-2">
                        {coachAvatar && (
                          <Image
                            src={coachAvatar.src}
                            alt={coachAvatar.alt}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        )}
                        <span className="truncate text-[11px] text-slate-500">
                          {coachLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500">
                    {item.createdAt && <span>{formatDate(item.createdAt)}</span>}
                    {item.minutes != null && item.minutes > 0 && (
                      <span className={item.createdAt ? 'ml-2' : undefined}>
                        {item.minutes} min est.
                      </span>
                    )}
                    {item.difficulty != null && (
                      <span
                        className={
                          item.createdAt || item.minutes != null ? 'ml-2' : undefined
                        }
                      >
                        Level {item.difficulty}/5
                      </span>
                    )}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300"
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

function KindToggle({
  label,
  kind,
  activeKind,
}: {
  label: string
  kind: SearchKind | null
  activeKind: SearchKind | null
}) {
  const isActive = activeKind === kind

  return (
    <button
      type="submit"
      name="kind"
      value={kind ?? ''}
      className={[
        'inline-flex items-center rounded-2xl px-3 py-1.5 text-xs font-medium transition',
        isActive
          ? 'bg-slate-900 text-white dark:bg-sky-600'
          : 'border border-slate-200 bg-white text-slate-700 hover:border-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </button>
  )
}

function parseFilters(searchParams?: SearchParams): ParsedFilters {
  const q = typeof searchParams?.q === 'string' ? searchParams.q.trim() : ''
  const coachRaw =
    typeof searchParams?.coach === 'string' ? searchParams.coach.trim() : ''
  const kindRaw =
    typeof searchParams?.kind === 'string' ? searchParams.kind.trim() : ''
  const topicRaw =
    typeof searchParams?.topic === 'string' ? searchParams.topic.trim() : ''
  const fromDateRaw =
    typeof searchParams?.fromDate === 'string' ? searchParams.fromDate.trim() : ''

  const coach = coachRaw && isCoachKey(coachRaw) ? (coachRaw as CoachKey) : null
  const kind = (['drill', 'expression', 'session', 'feature'] as SearchKind[]).includes(
    kindRaw as SearchKind,
  )
    ? (kindRaw as SearchKind)
    : null
  const topic = topicRaw || null
  const fromDate = fromDateRaw || null

  const difficultyMin = parseIntParam(searchParams?.difficultyMin)
  const difficultyMax = parseIntParam(searchParams?.difficultyMax)

  return { q, coach, kind, topic, difficultyMin, difficultyMax, fromDate }
}

function parseIntParam(value: string | string[] | undefined): number | null {
  if (Array.isArray(value)) value = value[0]
  if (typeof value !== 'string') return null
  const num = Number.parseInt(value, 10)
  return Number.isFinite(num) ? num : null
}

async function fetchSearch(
  userId: string,
  filters: ParsedFilters,
): Promise<SearchResult[]> {
  try {
    const res = await coreGet<SearchResponse>('/v1/search', {
      headers: { 'x-user-id': userId },
      cache: 'no-store',
      search: {
        q: filters.q || undefined,
        coach: filters.coach || undefined,
        kind: filters.kind || undefined,
        topic: filters.topic || undefined,
        difficultyMin: filters.difficultyMin ?? undefined,
        difficultyMax: filters.difficultyMax ?? undefined,
        fromDate: filters.fromDate ?? undefined,
      },
    })
    return res?.results ?? []
  } catch (error) {
    console.error('[search] core search failed', error)
    return []
  }
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
      new Date(value),
    )
  } catch {
    return value ?? ''
  }
}
