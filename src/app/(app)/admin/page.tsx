// src/app/(app)/admin/page.tsx

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getSupabaseServerClient, requireUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const adminLog = logger.child('admin:home')

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin • Polaris Coach',
  description: 'Overview of Polaris Core users, content, events, and campaigns.',
}

type AdminOverviewStats = {
  totalUsers: number
  activeUsers7d: number
  totalDrills: number
  publicDrills: number
  events24h: number
  activeDripCampaigns: number
  itemsInReview: number
  flaggedItems: number
}

export default async function AdminHomePage() {
  const user = await requireUser('/login')

  if (!isAdminUser(user)) {
    redirect('/dashboard')
  }

  const stats = await loadAdminOverviewStats()

  return (
    <main className="space-y-8 pb-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Polaris control center
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            High level view of users, drills, events, and lifecycle campaigns written by Polaris Core.
          </p>
        </div>
      </header>

      <AdminStatsGrid stats={stats} />
      <AdminQuickLinks />
    </main>
  )
}

function AdminStatsGrid({ stats }: { stats: AdminOverviewStats }) {
  const cards = [
    {
      label: 'Users',
      primary: formatNumber(stats.totalUsers),
      primaryHint: 'total accounts',
      secondary: `${formatNumber(stats.activeUsers7d)} active`,
      secondaryHint: 'in the last 7 days',
    },
    {
      label: 'Drills',
      primary: formatNumber(stats.totalDrills),
      primaryHint: 'total drills',
      secondary: `${formatNumber(stats.publicDrills)} public`,
      secondaryHint: 'published exemplars',
    },
    {
      label: 'Events',
      primary: formatNumber(stats.events24h),
      primaryHint: 'events in 24 hours',
      secondary: `${formatNumber(stats.activeDripCampaigns)} campaigns`,
      secondaryHint: 'active drip flows',
    },
    {
      label: 'Editorial',
      primary: formatNumber(stats.itemsInReview),
      primaryHint: 'items in review',
      secondary: `${formatNumber(stats.flaggedItems)} flagged`,
      secondaryHint: 'need attention',
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {card.primary}
          </p>
          <p className="text-xs text-slate-500">{card.primaryHint}</p>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            {card.secondary}
          </p>
          <p className="text-xs text-slate-500">{card.secondaryHint}</p>
        </div>
      ))}
    </section>
  )
}

function AdminQuickLinks() {
  const links = [
    {
      href: '/admin/audit',
      title: 'Audit log',
      description: 'Inspect recent analytics events and system activity.',
    },
    {
      href: '/admin/editorial',
      title: 'Editorial queue',
      description: 'Review generated drills, Auto QA results, and publishing state.',
    },
    {
      href: '/admin/drip',
      title: 'Drip campaigns',
      description: 'Monitor lifecycle and recap campaigns backed by core metrics.',
    },
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Navigation
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Admin tools
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Linked directly to tables and views that Polaris Core writes to.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm transition hover:border-sky-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {link.href.replace('/admin/', '').toUpperCase()}
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                {link.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{link.description}</p>
            </div>
            <p className="mt-3 text-xs font-semibold text-sky-600">
              Open
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}

async function loadAdminOverviewStats(): Promise<AdminOverviewStats> {
  const supabase = getSupabaseServerClient()
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [
    usersRes,
    activeUsersRes,
    drillsRes,
    publicDrillsRes,
    events24hRes,
    activeDripRes,
    inReviewRes,
    flaggedRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('v_user_progress')
      .select('user_id', { count: 'exact', head: true })
      .gt('days_active_7d', 0),
    supabase.from('drills').select('id', { count: 'exact', head: true }),
    supabase
      .from('drills')
      .select('id', { count: 'exact', head: true })
      .eq('is_public', true)
      .eq('state', 'published'),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since24h),
    supabase
      .from('drip_campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('drills')
      .select('id', { count: 'exact', head: true })
      .eq('state', 'in_review'),
    supabase
      .from('drills')
      .select('id', { count: 'exact', head: true })
      .eq('flagged', true),
  ])

  const totalUsers = extractCount('profiles', usersRes)
  const activeUsers7d = extractCount('v_user_progress', activeUsersRes, true)
  const totalDrills = extractCount('drills', drillsRes, true)
  const publicDrills = extractCount('drills_public', publicDrillsRes, true)
  const events24h = extractCount('events_24h', events24hRes, true)
  const activeDripCampaigns = extractCount('drip_campaigns_active', activeDripRes, true)
  const itemsInReview = extractCount('drills_in_review', inReviewRes, true)
  const flaggedItems = extractCount('drills_flagged', flaggedRes, true)

  return {
    totalUsers,
    activeUsers7d,
    totalDrills,
    publicDrills,
    events24h,
    activeDripCampaigns,
    itemsInReview,
    flaggedItems,
  }
}

function extractCount(
  label: string,
  result: { error: { message?: string } | null; count: number | null },
  tolerateMissing = false,
): number {
  const { error, count } = result

  if (error) {
    if (tolerateMissing && isMissingRelation(error)) {
      adminLog.warn(`${label} count skipped because relation is missing`, {
        error: error.message,
      })
      return 0
    }
    adminLog.error(`${label} count query failed`, { error: error.message })
    return 0
  }

  return typeof count === 'number' ? count : 0
}

function isAdminUser(user: unknown): boolean {
  const u = user as {
    app_metadata?: Record<string, unknown>
    user_metadata?: Record<string, unknown>
  } | null

  const appMeta = (u?.app_metadata ?? {}) as Record<string, unknown>
  const userMeta = (u?.user_metadata ?? {}) as Record<string, unknown>

  const role = (appMeta.role ??
    userMeta.role ??
    userMeta.polaris_role) as string | undefined

  const isAdminFlag =
    (userMeta.is_admin as boolean | undefined) ??
    (appMeta.is_admin as boolean | undefined)

  return role === 'admin' || role === 'superadmin' || Boolean(isAdminFlag)
}

function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num)
}

function isMissingRelation(error?: { message?: string }) {
  const msg = (error?.message || '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('missing')
}
