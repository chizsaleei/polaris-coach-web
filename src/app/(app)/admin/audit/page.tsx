// src/app/(app)/admin/audit/page.tsx

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { getSupabaseServerClient, requireUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const auditLog = logger.child('admin:audit')

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Audit • Polaris Coach',
  description:
    'Inspect recent events and system activity recorded by Polaris Core.',
}

type AuditEvent = {
  id: string
  occurredAt: string
  eventKey: string
  userId: string | null
  source: string | null
  coachKey: string | null
  tier: string | null
  country: string | null
  props: Record<string, unknown> | null
}

type AuditSummary = {
  total: number
  uniqueEvents: number
  windowLabel: string
  topEvents: { eventKey: string; count: number }[]
}

type EventRow = {
  id: string
  created_at: string
  event?: string | null
  event_key?: string | null
  user_id?: string | null
  source?: string | null
  channel?: string | null
  coach_key?: string | null
  tier?: string | null
  tier_current?: string | null
  country?: string | null
  props?: Record<string, unknown> | null
}

export default async function AdminAuditPage() {
  const user = await requireUser('/login')

  if (!isAdminUser(user)) {
    redirect('/dashboard')
  }

  const events = await loadAuditEvents()
  const summary = buildAuditSummary(events)

  return (
    <main className="space-y-6 pb-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Audit log
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Recent events coming from Polaris Core analytics and system activity.
          </p>
        </div>
      </header>

      <AuditSummaryPanel summary={summary} />

      <AuditEventsList events={events} />
    </main>
  )
}

function AuditSummaryPanel({ summary }: { summary: AuditSummary }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Snapshot
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Last {summary.total} events
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {summary.windowLabel}
          </p>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total events
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {summary.total}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Event types
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {summary.uniqueEvents}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Top events
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {summary.topEvents.map((item) => (
                <span
                  key={item.eventKey}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                >
                  <span className="font-mono text-[0.7rem]">
                    {item.eventKey}
                  </span>
                  <span className="ml-1 text-[0.7rem] text-slate-500">
                    ({item.count})
                  </span>
                </span>
              ))}
              {summary.topEvents.length === 0 && (
                <span className="text-xs text-slate-500">No events yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AuditEventsList({ events }: { events: AuditEvent[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Events
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent activity
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Showing the last {events.length} events recorded in the core{' '}
          <span className="font-mono">events</span> table.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No events found yet. Once Polaris Core starts logging activity, they
          will appear here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {events.map((event) => (
            <li key={event.id} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[0.7rem] font-semibold text-white dark:bg-slate-800">
                      {event.eventKey}
                    </span>
                    {event.source && (
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                        {event.source}
                      </span>
                    )}
                    {event.tier && (
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                        Tier {event.tier}
                      </span>
                    )}
                    {event.coachKey && (
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[0.65rem] font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
                        {event.coachKey}
                      </span>
                    )}
                    {event.country && (
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                        {event.country}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    User:{' '}
                    {event.userId ? (
                      <span className="font-mono">
                        {truncateId(event.userId)}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">anonymous</span>
                    )}
                  </p>

                  {event.props && (
                    <p className="mt-1 text-xs text-slate-500">
                      {formatPropsPreview(event.props)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-0.5 text-right">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-100">
                    {formatTimestamp(event.occurredAt)}
                  </p>
                  <p className="text-[0.65rem] text-slate-400">
                    {relativeTimeFromNow(event.occurredAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

async function loadAuditEvents(): Promise<AuditEvent[]> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    auditLog.error('events query failed', { error: error.message })
    return []
  }

  if (!data) return []

  return data.filter(isEventRow).map(mapAuditEvent)
}

function mapAuditEvent(row: EventRow): AuditEvent {
  return {
    id: row.id,
    occurredAt: row.created_at,
    eventKey: row.event ?? row.event_key ?? 'unknown',
    userId: row.user_id ?? null,
    source: row.source ?? row.channel ?? null,
    coachKey: row.coach_key ?? null,
    tier: row.tier ?? row.tier_current ?? null,
    country: row.country ?? null,
    props: row.props ?? null,
  }
}

function buildAuditSummary(events: AuditEvent[]): AuditSummary {
  if (events.length === 0) {
    return {
      total: 0,
      uniqueEvents: 0,
      windowLabel: 'No data yet',
      topEvents: [],
    }
  }

  const total = events.length
  const eventCounts = new Map<string, number>()

  for (const event of events) {
    const key = event.eventKey || 'unknown'
    eventCounts.set(key, (eventCounts.get(key) ?? 0) + 1)
  }

  const uniqueEvents = eventCounts.size
  const topEvents = Array.from(eventCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([eventKey, count]) => ({ eventKey, count }))

  const newest = events[0]
  const oldest = events[events.length - 1]
  const windowLabel =
    newest && oldest
      ? `${formatShortDate(oldest.occurredAt)} - ${formatShortDate(
          newest.occurredAt,
        )}`
      : ''

  return {
    total,
    uniqueEvents,
    windowLabel,
    topEvents,
  }
}

function isAdminUser(user: AdminCheckUser | null): boolean {
  if (!user) return false
  const appMeta = toMetadataRecord(user.app_metadata)
  const userMeta = toMetadataRecord(user.user_metadata)

  const role =
    [appMeta.role, userMeta.role, userMeta.polaris_role].find(
      (value): value is string => typeof value === 'string' && value.length > 0,
    ) ?? null

  const isAdminFlag =
    (typeof userMeta.is_admin === 'boolean' && userMeta.is_admin) ||
    (typeof appMeta.is_admin === 'boolean' && appMeta.is_admin)

  return role === 'admin' || role === 'superadmin' || isAdminFlag
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

function formatShortDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
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

function formatPropsPreview(props: Record<string, unknown> | null): string {
  if (!props) return ''
  const entries = Object.entries(props)
  if (entries.length === 0) return ''

  const preview = entries.slice(0, 3).map(([key, value]) => {
    if (value === null || value === undefined) return `${key}: null`
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      const text = String(value)
      return `${key}: ${text.length > 40 ? `${text.slice(0, 37)}...` : text}`
    }
    return `${key}: object`
  })

  const suffix = entries.length > 3 ? ' +' : ''
  return preview.join(' · ') + suffix
}

function toMetadataRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function isEventRow(row: unknown): row is EventRow {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return false
  const candidate = row as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.created_at === 'string'
}

type AdminCheckUser = Pick<User, 'app_metadata' | 'user_metadata'> | {
  app_metadata?: Record<string, unknown> | null
  user_metadata?: Record<string, unknown> | null
}
