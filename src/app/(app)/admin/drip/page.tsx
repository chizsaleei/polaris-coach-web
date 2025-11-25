// src/app/(app)/admin/drip/page.tsx

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { getSupabaseServerClient, requireUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const dripLog = logger.child('admin:drip')

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Drip • Polaris Coach',
  description:
    'Inspect and monitor lifecycle campaigns driven by Polaris Core.',
}

type DripStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'error'

type DripChannel = 'email' | 'in_app' | 'sms' | 'unknown'

type DripCampaign = {
  id: string
  key: string
  name: string
  description: string | null
  status: DripStatus
  trigger: string | null
  audience: string | null
  channel: DripChannel
  createdAt: string
  updatedAt: string
  lastRunAt: string | null
  emailsSent24h: number
  emailsSent30d: number
  openRate30d: number | null
  clickRate30d: number | null
  churnRate30d: number | null
}

type DripCampaignRow = {
  id: string
  campaign_key?: string | null
  key?: string | null
  slug?: string | null
  name?: string | null
  description?: string | null
  status?: string | null
  trigger_kind?: string | null
  audience_key?: string | null
  channel?: string | null
  created_at: string
  updated_at?: string | null
  last_run_at?: string | null
  emails_sent_24h?: number | null
  emails_sent_30d?: number | null
  open_rate_30d?: number | null
  click_rate_30d?: number | null
  churn_rate_30d?: number | null
}

type AdminUser =
  | Pick<User, 'app_metadata' | 'user_metadata'>
  | {
      app_metadata?: Record<string, unknown> | null
      user_metadata?: Record<string, unknown> | null
    }

type DripSummary = {
  totalCampaigns: number
  activeCampaigns: number
  pausedCampaigns: number
  draftCampaigns: number
  totalSent24h: number
  totalSent30d: number
  avgOpenRate30d: number | null
  avgClickRate30d: number | null
}

export default async function AdminDripPage() {
  const user = await requireUser('/login')

  if (!isAdminUser(user)) {
    redirect('/dashboard')
  }

  const campaigns = await loadDripCampaigns()
  const summary = buildDripSummary(campaigns)

  return (
    <main className="space-y-6 pb-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Drip campaigns
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Lifecycle and recap campaigns powered by Polaris Core analytics.
          </p>
        </div>
      </header>

      <DripSummaryPanel summary={summary} />
      <DripCampaignsList campaigns={campaigns} />
    </main>
  )
}

function DripSummaryPanel({ summary }: { summary: DripSummary }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Snapshot
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Campaigns overview
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Based on the latest campaigns stored in the core drip tables.
          </p>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-4">
          <SummaryItem label="Total campaigns" value={summary.totalCampaigns} />
          <SummaryItem label="Active" value={summary.activeCampaigns} />
          <SummaryItem label="Drafts" value={summary.draftCampaigns} />
          <SummaryItem label="Paused" value={summary.pausedCampaigns} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
        <SummaryItem
          label="Sent (24h)"
          value={formatNumber(summary.totalSent24h)}
          hint="All campaigns"
        />
        <SummaryItem
          label="Sent (30d)"
          value={formatNumber(summary.totalSent30d)}
          hint="All campaigns"
        />
        <SummaryItem
          label="Avg open rate (30d)"
          value={formatPercent(summary.avgOpenRate30d)}
          hint="Weighted by campaigns"
        />
      </div>
    </section>
  )
}

function SummaryItem({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
  hint?: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}

function DripCampaignsList({ campaigns }: { campaigns: DripCampaign[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Campaigns
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent lifecycle flows
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Showing up to {campaigns.length} campaigns from the core{' '}
          <span className="font-mono">drip_campaigns</span> table.
        </p>
      </header>

      {campaigns.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No drip campaigns found yet. Once Polaris Core creates recap or lifecycle
          sequences, they will appear here.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Trigger</th>
                <th className="py-2 pr-4">Audience</th>
                <th className="py-2 pr-4 text-right">Sent 24h</th>
                <th className="py-2 pr-4 text-right">Sent 30d</th>
                <th className="py-2 pr-4 text-right">Open 30d</th>
                <th className="py-2 pr-4 text-right">Click 30d</th>
                <th className="py-2 pr-4">Last run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.map((c) => (
                <tr key={c.id} className="align-top">
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                      <span className="mt-0.5 font-mono text-[0.7rem] text-slate-500">
                        {c.key}
                      </span>
                      {c.description && (
                        <span className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {c.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    {formatChannel(c.channel)}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    {c.trigger ?? '-'}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    {c.audience ?? '-'}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-900 dark:text-white">
                    {formatNumber(c.emailsSent24h)}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-900 dark:text-white">
                    {formatNumber(c.emailsSent30d)}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-600 dark:text-slate-300">
                    {formatPercent(c.openRate30d)}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-600 dark:text-slate-300">
                    {formatPercent(c.clickRate30d)}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-300">
                    {c.lastRunAt ? (
                      <>
                        <div>{formatTimestamp(c.lastRunAt)}</div>
                        <div className="text-[0.65rem] text-slate-400">
                          {relativeTimeFromNow(c.lastRunAt)}
                        </div>
                      </>
                    ) : (
                      <span className="italic text-slate-400">Never</span>
                    )}
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

async function loadDripCampaigns(): Promise<DripCampaign[]> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('drip_campaigns')
    .select(
      [
        'id',
        'campaign_key',
        'name',
        'description',
        'status',
        'trigger_kind',
        'audience_key',
        'channel',
        'created_at',
        'updated_at',
        'last_run_at',
        'emails_sent_24h',
        'emails_sent_30d',
        'open_rate_30d',
        'click_rate_30d',
        'churn_rate_30d',
      ].join(', '),
    )
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    if (isMissingRelation(error)) {
      dripLog.warn('drip_campaigns view or table is missing, returning empty set', {
        error: error.message,
      })
      return []
    }
    dripLog.error('drip_campaigns query failed', { error: error.message })
    return []
  }

  if (!data) return []

  const rows: unknown[] = Array.isArray(data) ? data : []

  return rows.filter(isDripCampaignRow).map((row) => ({
    id: row.id,
    key: row.campaign_key ?? row.key ?? row.slug ?? row.id,
    name: row.name ?? row.campaign_key ?? 'Untitled campaign',
    description: row.description ?? null,
    status: normalizeStatus(row.status),
    trigger: row.trigger_kind ?? null,
    audience: row.audience_key ?? null,
    channel: normalizeChannel(row.channel),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    lastRunAt: row.last_run_at ?? null,
    emailsSent24h: numberOrZero(row.emails_sent_24h),
    emailsSent30d: numberOrZero(row.emails_sent_30d),
    openRate30d: nullableNumber(row.open_rate_30d),
    clickRate30d: nullableNumber(row.click_rate_30d),
    churnRate30d: nullableNumber(row.churn_rate_30d),
  }))
}

function buildDripSummary(campaigns: DripCampaign[]): DripSummary {
  if (campaigns.length === 0) {
    return {
      totalCampaigns: 0,
      activeCampaigns: 0,
      pausedCampaigns: 0,
      draftCampaigns: 0,
      totalSent24h: 0,
      totalSent30d: 0,
      avgOpenRate30d: null,
      avgClickRate30d: null,
    }
  }

  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const pausedCampaigns = campaigns.filter((c) => c.status === 'paused').length
  const draftCampaigns = campaigns.filter((c) => c.status === 'draft').length

  const totalSent24h = campaigns.reduce(
    (sum, c) => sum + (c.emailsSent24h || 0),
    0,
  )
  const totalSent30d = campaigns.reduce(
    (sum, c) => sum + (c.emailsSent30d || 0),
    0,
  )

  const openRates = campaigns
    .map((c) => c.openRate30d)
    .filter((v): v is number => v != null)
  const clickRates = campaigns
    .map((c) => c.clickRate30d)
    .filter((v): v is number => v != null)

  const avgOpenRate30d =
    openRates.length > 0
      ? openRates.reduce((a, b) => a + b, 0) / openRates.length
      : null
  const avgClickRate30d =
    clickRates.length > 0
      ? clickRates.reduce((a, b) => a + b, 0) / clickRates.length
      : null

  return {
    totalCampaigns,
    activeCampaigns,
    pausedCampaigns,
    draftCampaigns,
    totalSent24h,
    totalSent30d,
    avgOpenRate30d,
    avgClickRate30d,
  }
}

function StatusBadge({ status }: { status: DripStatus }) {
  const label = (() => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'scheduled':
        return 'Scheduled'
      case 'active':
        return 'Active'
      case 'paused':
        return 'Paused'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
      default:
        return status
    }
  })()

  const baseClass =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium'
  let extra =
    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700'

  if (status === 'active') {
    extra =
      'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800'
  } else if (status === 'paused') {
    extra =
      'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800'
  } else if (status === 'error') {
    extra =
      'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-100 dark:border-rose-800'
  }

  return <span className={`${baseClass} ${extra}`}>{label}</span>
}

function normalizeStatus(raw: unknown): DripStatus {
  const value = String(raw || '').toLowerCase()
  if (value === 'draft') return 'draft'
  if (value === 'scheduled') return 'scheduled'
  if (value === 'active') return 'active'
  if (value === 'paused') return 'paused'
  if (value === 'completed' || value === 'done') return 'completed'
  if (value === 'error' || value === 'failed') return 'error'
  return 'draft'
}

function normalizeChannel(raw: unknown): DripChannel {
  const value = String(raw || '').toLowerCase()
  if (value === 'email') return 'email'
  if (value === 'in_app' || value === 'in-app') return 'in_app'
  if (value === 'sms') return 'sms'
  return 'unknown'
}

function formatChannel(channel: DripChannel): string {
  switch (channel) {
    case 'email':
      return 'Email'
    case 'in_app':
      return 'In app'
    case 'sms':
      return 'SMS'
    default:
      return 'Unknown'
  }
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

function numberOrZero(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num)
}

function formatPercent(value: number | null): string {
  if (value == null) return '-'
  return `${formatNumber(value * 100)}%`
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

function isMissingRelation(error?: { message?: string }) {
  const msg = (error?.message || '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('missing')
}

function isDripCampaignRow(row: unknown): row is DripCampaignRow {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return false
  const candidate = row as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.created_at === 'string'
}
