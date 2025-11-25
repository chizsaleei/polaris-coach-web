// src/app/(app)/admin/editorial/page.tsx

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { getSupabaseServerClient, requireUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const editorialLog = logger.child('admin:editorial')

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Editorial • Polaris Coach',
  description:
    'Review and manage drills in the editorial workflow backed by Polaris Core.',
}

type EditorialState =
  | 'draft'
  | 'auto_qa'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'deprecated'

type EditorialItem = {
  id: string
  title: string
  coachKey: string | null
  topicKey: string | null
  domainKey: string | null
  difficulty: number | null
  tags: string[]
  state: EditorialState
  isPublic: boolean
  createdAt: string
  updatedAt: string
  autoQaScore: number | null
  autoQaStatus: string | null
  flagged: boolean
}

type EditorialRow = {
  id: string
  title?: string | null
  coach_key?: string | null
  topic_key?: string | null
  domain_key?: string | null
  difficulty?: number | null
  tags?: string[] | null
  state?: string | null
  is_public?: boolean | null
  created_at: string
  updated_at?: string | null
  auto_qa_score?: number | null
  auto_qa_status?: string | null
  flagged?: boolean | null
}

type AdminUser =
  | Pick<User, 'app_metadata' | 'user_metadata'>
  | {
      app_metadata?: Record<string, unknown> | null
      user_metadata?: Record<string, unknown> | null
    }

type EditorialSummary = {
  totalItems: number
  drafts: number
  autoQa: number
  inReview: number
  approved: number
  published: number
  deprecated: number
  flaggedCount: number
}

export default async function AdminEditorialPage() {
  const user = await requireUser('/login')

  if (!isAdminUser(user)) {
    redirect('/dashboard')
  }

  const items = await loadEditorialItems()
  const summary = buildEditorialSummary(items)

  return (
    <main className="space-y-6 pb-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Editorial queue
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Drills flowing through Generate, Auto QA, human review, and publishing.
          </p>
        </div>
      </header>

      <EditorialSummaryPanel summary={summary} />
      <EditorialItemsList items={items} />
    </main>
  )
}

function EditorialSummaryPanel({ summary }: { summary: EditorialSummary }) {
  const rows = [
    { label: 'Total items', value: summary.totalItems },
    { label: 'Drafts', value: summary.drafts },
    { label: 'Auto QA', value: summary.autoQa },
    { label: 'In review', value: summary.inReview },
    { label: 'Approved', value: summary.approved },
    { label: 'Published', value: summary.published },
    { label: 'Deprecated', value: summary.deprecated },
    { label: 'Flagged', value: summary.flaggedCount },
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Snapshot
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Editorial workflow
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Based on the latest drills stored in the core content tables.
          </p>
        </div>
        <div className="grid gap-4 text-sm sm:grid-cols-4">
          {rows.slice(0, 4).map((row) => (
            <SummaryItem key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
        {rows.slice(4).map((row) => (
          <SummaryItem key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </section>
  )
}

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  )
}

function EditorialItemsList({ items }: { items: EditorialItem[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Items
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Drills by workflow state
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Showing up to {items.length} drills from the core{' '}
          <span className="font-mono">drills</span> table.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No drills found yet. Once Polaris Core generates or imports content,
          it will appear here for review and publishing.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4">Coach</th>
                <th className="py-2 pr-4">Domain / Topic</th>
                <th className="py-2 pr-4 text-right">Difficulty</th>
                <th className="py-2 pr-4">Tags</th>
                <th className="py-2 pr-4 text-right">Auto QA</th>
                <th className="py-2 pr-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="mt-0.5 font-mono text-[0.7rem] text-slate-500">
                        {truncateId(item.id)}
                      </span>
                      {item.isPublic && (
                        <span className="mt-1 inline-flex w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
                          Public exemplar
                        </span>
                      )}
                      {item.flagged && (
                        <span className="mt-1 inline-flex w-fit rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-medium text-rose-800 dark:bg-rose-900/30 dark:text-rose-100">
                          Needs attention
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <StateBadge state={item.state} />
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    {item.coachKey ? (
                      <span className="font-mono text-[0.7rem]">
                        {item.coachKey}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col gap-0.5">
                      <span>
                        {item.domainKey ?? (
                          <span className="italic text-slate-400">No domain</span>
                        )}
                      </span>
                      <span className="text-[0.7rem] text-slate-500">
                        {item.topicKey ?? (
                          <span className="italic text-slate-400">No topic</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-900 dark:text-white">
                    {item.difficulty != null ? item.difficulty : '-'}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    {item.tags.length === 0 ? (
                      <span className="italic text-slate-400">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 px-2 py-0.5 text-[0.65rem] text-slate-600 dark:border-slate-700 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 4 && (
                          <span className="text-[0.65rem] text-slate-400">
                            +{item.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-600 dark:text-slate-300">
                    {item.autoQaScore != null ? (
                      <>
                        <div>{formatPercent(item.autoQaScore)}</div>
                        {item.autoQaStatus && (
                          <div className="text-[0.65rem] text-slate-400">
                            {item.autoQaStatus}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="italic text-slate-400">Not run</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    <div>{formatTimestamp(item.updatedAt)}</div>
                    <div className="text-[0.65rem] text-slate-400">
                      {relativeTimeFromNow(item.updatedAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

async function loadEditorialItems(): Promise<EditorialItem[]> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('drills')
    .select(
      [
        'id',
        'title',
        'coach_key',
        'topic_key',
        'domain_key',
        'difficulty',
        'tags',
        'state',
        'is_public',
        'created_at',
        'updated_at',
        'auto_qa_score',
        'auto_qa_status',
        'flagged',
      ].join(', '),
    )
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) {
    if (isMissingRelation(error)) {
      editorialLog.warn('drills table or fields missing, returning empty set', {
        error: error.message,
      })
      return []
    }
    editorialLog.error('drills query failed', { error: error.message })
    return []
  }

  if (!data) return []

  const rows: unknown[] = Array.isArray(data) ? data : []

  return rows
    .filter(isEditorialRow)
    .map((row): EditorialItem => ({
      id: row.id,
      title: row.title ?? 'Untitled drill',
      coachKey: row.coach_key ?? null,
      topicKey: row.topic_key ?? null,
      domainKey: row.domain_key ?? null,
      difficulty: nullableNumber(row.difficulty),
      tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
      state: normalizeState(row.state),
      isPublic: Boolean(row.is_public),
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
      autoQaScore: nullableNumber(row.auto_qa_score),
      autoQaStatus: row.auto_qa_status ?? null,
      flagged: Boolean(row.flagged),
    }))
}

function buildEditorialSummary(items: EditorialItem[]): EditorialSummary {
  if (items.length === 0) {
    return {
      totalItems: 0,
      drafts: 0,
      autoQa: 0,
      inReview: 0,
      approved: 0,
      published: 0,
      deprecated: 0,
      flaggedCount: 0,
    }
  }

  const totalItems = items.length
  const drafts = items.filter((i) => i.state === 'draft').length
  const autoQa = items.filter((i) => i.state === 'auto_qa').length
  const inReview = items.filter((i) => i.state === 'in_review').length
  const approved = items.filter((i) => i.state === 'approved').length
  const published = items.filter((i) => i.state === 'published').length
  const deprecated = items.filter((i) => i.state === 'deprecated').length
  const flaggedCount = items.filter((i) => i.flagged).length

  return {
    totalItems,
    drafts,
    autoQa,
    inReview,
    approved,
    published,
    deprecated,
    flaggedCount,
  }
}

function StateBadge({ state }: { state: EditorialState }) {
  const label = (() => {
    switch (state) {
      case 'draft':
        return 'Draft'
      case 'auto_qa':
        return 'Auto QA'
      case 'in_review':
        return 'In review'
      case 'approved':
        return 'Approved'
      case 'published':
        return 'Published'
      case 'deprecated':
        return 'Deprecated'
      default:
        return state
    }
  })()

  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium'
  let extra =
    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700'

  if (state === 'draft') {
    extra =
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700'
  } else if (state === 'auto_qa') {
    extra =
      'bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-100 dark:border-sky-800'
  } else if (state === 'in_review') {
    extra =
      'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800'
  } else if (state === 'approved') {
    extra =
      'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800'
  } else if (state === 'published') {
    extra =
      'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-100 dark:border-indigo-800'
  } else if (state === 'deprecated') {
    extra =
      'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700'
  }

  return <span className={`${base} ${extra}`}>{label}</span>
}

function normalizeState(raw: unknown): EditorialState {
  const value = String(raw || '').toLowerCase()
  if (value === 'draft') return 'draft'
  if (value === 'auto_qa' || value === 'auto-qa') return 'auto_qa'
  if (value === 'in_review' || value === 'in-review' || value === 'review') {
    return 'in_review'
  }
  if (value === 'approved') return 'approved'
  if (value === 'published') return 'published'
  if (value === 'deprecated') return 'deprecated'
  // default to draft so unknown states do not break the UI
  return 'draft'
}

function isAdminUser(user: AdminUser | null): boolean {
  const appMeta = (user?.app_metadata ?? {}) as Record<string, unknown>
  const userMeta = (user?.user_metadata ?? {}) as Record<string, unknown>

  const role = (appMeta.role ??
    userMeta.role ??
    userMeta.polaris_role) as string | undefined

  const isAdminFlag =
    (userMeta.is_admin as boolean | undefined) ??
    (appMeta.is_admin as boolean | undefined)

  return role === 'admin' || role === 'superadmin' || Boolean(isAdminFlag)
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function formatPercent(value: number | null): string {
  if (value == null) return '-'
  return `${formatNumber(value * 100)}%`
}

function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num)
}

function formatTimestamp(value: string): string {
  try {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function relativeTimeFromNow(value: string): string {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  if (!Number.isFinite(diffMs)) return ''

  const seconds = Math.round(diffMs / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} h ago`
  return `${days} d ago`
}

function truncateId(id: string, length = 8): string {
  if (id.length <= length) return id
  return `${id.slice(0, length)}…`
}

function isMissingRelation(error?: { message?: string }) {
  const msg = (error?.message || '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('missing')
}

function isEditorialRow(row: unknown): row is EditorialRow {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return false
  const candidate = row as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.created_at === 'string'
}
