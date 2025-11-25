// src/app/(app)/account/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CreditCard, Download, ShieldCheck, Trash2, UserRound } from 'lucide-react'

import { getSupabaseServerClient, requireUser } from '@/lib/supabase/server'
import { corePost, idempotencyKey } from '@/lib/fetch-core'
import type { CoachKey } from '@/types'
import { COACH_AVATAR, COACH_LABELS, isCoachKey } from '@/lib/coaches'

export const metadata: Metadata = {
  title: 'Account · Polaris Coach',
  description:
    'Manage your Polaris Coach profile, billing plan, data exports, and safety controls.',
}

export const revalidate = 0

type TierName = 'free' | 'pro' | 'vip'

type ProfileRow = {
  id: string
  full_name: string | null
  profession: string | null
  goals: string | null
  tier: TierName
  country: string | null
  active_coach_key: string | null
  created_at: string
}

type EntitlementRow = {
  plan: TierName
  provider: string | null
  status: 'active' | 'canceled' | 'expired' | 'past_due'
  starts_at: string | null
  ends_at: string | null
  cancel_at: string | null
}

type AccountStats = {
  attempts: number
  expressions: number
  lastPracticeAt: string | null
}

type AccountOverview = {
  profile: ProfileRow | null
  entitlement: EntitlementRow | null
  stats: AccountStats
}

type SearchParams = Record<string, string | string[] | undefined>

const PLAN_FEATURES: Record<TierName, string[]> = {
  free: ['Daily 5-minute drills', 'Weekly recap email', 'Save up to 50 expressions'],
  pro: [
    'Unlimited drills and transcripts',
    'Expression packs sync across devices',
    'Priority async coaching replies',
  ],
  vip: [
    'Live coach sessions included',
    'Custom rubrics and scoring tuned to you',
    'Concierge onboarding and proactive support',
  ],
}

export default async function AccountPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = getSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) redirect('/login')

  const overview = await loadAccountOverview(supabase, user.id)
  const tier = normalizeTier(overview.entitlement?.plan ?? overview.profile?.tier)
  const isFreeTier = tier === 'free'
  const billingLine = describeBilling(overview.entitlement)
  const lastPractice =
    overview.stats.lastPracticeAt &&
    formatDate(overview.stats.lastPracticeAt, { dateStyle: 'medium', timeStyle: 'short' })
  const billingError = getFlag(searchParams, 'billingError')
  const metadataFullName =
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined

  const activeCoachKeyRaw = overview.profile?.active_coach_key ?? null
  const activeCoachKey: CoachKey | null =
    activeCoachKeyRaw && isCoachKey(activeCoachKeyRaw) ? (activeCoachKeyRaw as CoachKey) : null
  const activeCoachLabel =
    activeCoachKey && COACH_LABELS[activeCoachKey]
      ? COACH_LABELS[activeCoachKey]
      : activeCoachKeyRaw || 'Not assigned'
  const activeCoachAvatar = activeCoachKey ? COACH_AVATAR[activeCoachKey] : null

  return (
    <main className="space-y-6 pb-16">
      {billingError && (
        <div
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          We could not open the billing portal. Try again or email{' '}
          <a className="font-semibold underline" href="mailto:polaris@chizsaleei.com">
            polaris@chizsaleei.com
          </a>
          .
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Account</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {overview.profile?.full_name ||
                metadataFullName ||
                'Your Polaris Coach'}
            </h1>
            <p className="mt-2 text-slate-600">
              {overview.profile?.profession ||
                overview.profile?.goals ||
                'Stay on track with weekly drills and saved expressions.'}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
            Member since {formatDate(overview.profile?.created_at ?? user.created_at)}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-900">{user.email}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              User ID
            </dt>
            <dd className="mt-2 truncate text-sm font-mono text-slate-900">{user.id}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Coach
            </dt>
            <dd className="mt-2 flex items-center gap-3 text-sm font-medium text-slate-900">
              {activeCoachAvatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeCoachAvatar}
                  alt={activeCoachLabel}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <span>{activeCoachLabel}</span>
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Region
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-900">
              {overview.profile?.country ?? 'Not set'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Membership
              </p>
              <h2 className="mt-2 text-2xl font-semibold capitalize text-slate-900">{tier} plan</h2>
              <p className="mt-1 text-sm text-slate-600">{billingLine}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            {PLAN_FEATURES[tier].map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            {isFreeTier ? (
              <Link
                prefetch={false}
                href="/pricing"
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Upgrade plan
              </Link>
            ) : (
              <>
                <form action={openBillingPortal} className="flex-1">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Manage billing
                  </button>
                </form>
                <Link
                  prefetch={false}
                  href="/pricing"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-300"
                >
                  Compare plans
                </Link>
              </>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Practice stats
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Progress snapshot</h2>
              <p className="mt-1 text-sm text-slate-600">
                Track how consistently you are finishing drills.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <StatLine label="Drills completed" value={overview.stats.attempts.toString()} />
            <StatLine label="Expressions saved" value={overview.stats.expressions.toString()} />
            <StatLine
              label="Last practice"
              value={lastPractice ?? 'No attempts yet'}
              hint={lastPractice ? 'Keep the streak alive.' : undefined}
            />
          </dl>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Security
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sign-in and devices</h2>
              <p className="mt-1 text-sm text-slate-600">
                Polaris uses passwordless codes. Protect your inbox and remove unused devices.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <StatLine label="Primary email" value={user.email ?? 'Not set'} />
            <StatLine
              label="Last sign-in"
              value={formatDate(user.last_sign_in_at) ?? 'Not recorded'}
              hint="Codes expire after a few minutes."
            />
            <StatLine
              label="Need to reset sessions?"
              value="Email support and request a device reset."
            />
          </dl>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Data controls
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Export or delete</h2>
              <p className="mt-1 text-sm text-slate-600">
                Download a copy of your practice records or schedule account deletion.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <Download className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              prefetch={false}
              href="/account/export"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:border-slate-300"
            >
              Request data export
            </Link>
            <Link
              prefetch={false}
              href="/account/delete"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700 hover:border-red-300"
            >
              Delete account
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-red-200 bg-red-50/60 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                Danger zone
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-red-900">Pause or leave</h2>
              <p className="mt-1 text-sm text-red-700">
                Stopping your membership removes access to live coaches and deletes queued drills.
              </p>
            </div>
            <div className="rounded-2xl bg-red-100 p-3 text-red-600">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-red-900">
            <li>Canceling takes effect at the end of your billing period.</li>
            <li>Deleting is permanent and removes drills, expressions, and recaps.</li>
            <li>Contact support if you need to restore access within 30 days.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            {isFreeTier ? (
              <Link
                prefetch={false}
                href="mailto:polaris@chizsaleei.com?subject=Close%20my%20Polaris%20account"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:border-red-300"
              >
                Contact support
              </Link>
            ) : (
              <form action={openBillingPortal} className="flex-1">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:border-red-300"
                >
                  Manage subscription
                </button>
              </form>
            )}
            <Link
              prefetch={false}
              href="/account/delete"
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Schedule deletion
            </Link>
          </div>
        </article>
      </section>
    </main>
  )
}

function StatLine({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-slate-900">{value}</dd>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

async function loadAccountOverview(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  userId: string,
): Promise<AccountOverview> {
  const profileQuery = supabase
    .from('profiles')
    .select('id, full_name, profession, goals, tier, country, active_coach_key, created_at')
    .eq('id', userId)
    .maybeSingle()

  const entitlementQuery = supabase
    .from('entitlements')
    .select('plan, provider, status, starts_at, ends_at, cancel_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const attemptsCountQuery = supabase
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const expressionsCountQuery = supabase
    .from('expressions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const lastAttemptQuery = supabase
    .from('attempts')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const [profileRes, entitlementRes, attemptsRes, expressionsRes, lastAttemptRes] =
    await Promise.all([
      profileQuery,
      entitlementQuery,
      attemptsCountQuery,
      expressionsCountQuery,
      lastAttemptQuery,
    ])

  const profile = profileRes.data ?? null
  const entitlement = entitlementRes.data ?? null
  const stats: AccountStats = {
    attempts: attemptsRes.count ?? 0,
    expressions: expressionsRes.count ?? 0,
    lastPracticeAt: getCreatedAt(lastAttemptRes.data),
  }

  return { profile, entitlement, stats }
}

function normalizeTier(value?: string | null): TierName {
  if (!value) return 'free'
  const lower = value.toLowerCase()
  if (lower.startsWith('vip')) return 'vip'
  if (lower.startsWith('pro')) return 'pro'
  return 'free'
}

function describeBilling(entitlement: EntitlementRow | null) {
  if (!entitlement) return 'Free plan managed in-app'
  const { status, ends_at, provider } = entitlement
  if (status === 'canceled' && ends_at) return `Cancels on ${formatDate(ends_at)}`
  if (ends_at) return `Renews on ${formatDate(ends_at)} via ${provider ?? 'billing partner'}`
  if (status === 'past_due') return 'Payment past due · update card'
  return `Status: ${status}`
}

function formatDate(
  value?: string | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) {
  if (!value) return undefined
  try {
    const date = new Date(value)
    return new Intl.DateTimeFormat('en', options).format(date)
  } catch {
    return undefined
  }
}

function getFlag(searchParams: SearchParams | undefined, key: string) {
  if (!searchParams) return false
  const value = searchParams[key]
  if (Array.isArray(value)) return value.includes('1')
  return value === '1' || value === 'true'
}

type PortalResponse = {
  ok: boolean
  data?: { url: string }
}

async function openBillingPortal() {
  'use server'
  const user = await requireUser('/login')
  const payload = {
    userId: user.id,
    returnUrl: makeAbsoluteUrl('/account'),
  }

  try {
    const result = await corePost<PortalResponse>('/v1/payments/portal', payload, {
      admin: true,
      headers: { 'idempotency-key': idempotencyKey() },
    })
    const url = result.data?.url
    if (!result.ok || !url) throw new Error('Missing billing portal URL')
    redirect(url)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('billing portal failed', error)
    redirect('/account?billingError=1')
  }
}

function makeAbsoluteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    process.env.APP_BASE_URL ||
    process.env.VERCEL_URL ||
    ''
  if (!base) return path
  const normalizedBase = base.startsWith('http') ? base : `https://${base}`
  const trimmedBase = normalizedBase.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${trimmedBase}${normalizedPath}`
}

function getCreatedAt(row: unknown): string | null {
  if (!row || typeof row !== 'object') return null
  const value = (row as { created_at?: unknown }).created_at
  return typeof value === 'string' ? value : null
}
