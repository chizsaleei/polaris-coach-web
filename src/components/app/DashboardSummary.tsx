// src/components/app/DashboardSummary.tsx
import Image from 'next/image'
import PracticeNowButton from '@/components/app/PracticeNowButton'

type TierName = 'free' | 'pro' | 'vip'

export type ProfileSummary = {
  id: string
  fullName: string
  avatarUrl: string | null
  tier: TierName
  activeCoachKey: string | null
  memberSince: string | null
}

export type EntitlementSummary = {
  plan: TierName
  status: string | null
  provider: string | null
  expiresAt: string | null
} | null

export type ProgressSnapshot = {
  minutes7d: number
  attempts7d: number
  attemptsAll: number
  passRate28d: number | null
  avgScore28d: number | null
  avgWpm28d: number | null
  daysActive7d: number
  lastActivityAt: string | null
  topCoach: string | null
  topTopic: string | null
}

export interface DashboardSummaryProps {
  profile: ProfileSummary
  entitlement: EntitlementSummary
  progress: ProgressSnapshot
  weeklyGoal?: number
}

type CoachAvatarMeta = {
  src: string
  name: string
}

// Shared map: CoachKey -> avatar in public/coach-assets/<coach-slug>/avatar-256.webp
export const COACH_AVATAR: Record<string, CoachAvatarMeta> = {
  // Chase Krashen
  chase_krashen: {
    src: '/coach-assets/chase-krashen/avatar-256.webp',
    name: 'Chase Krashen',
  },
  'chase-krashen': {
    src: '/coach-assets/chase-krashen/avatar-256.webp',
    name: 'Chase Krashen',
  },

  // Dr. Claire Swales
  dr_claire_swales: {
    src: '/coach-assets/claire-swales/avatar-256.webp',
    name: 'Dr. Claire Swales',
  },
  'claire-swales': {
    src: '/coach-assets/claire-swales/avatar-256.webp',
    name: 'Dr. Claire Swales',
  },

  // Carter Goleman
  carter_goleman: {
    src: '/coach-assets/carter-goleman/avatar-256.webp',
    name: 'Carter Goleman',
  },
  'carter-goleman': {
    src: '/coach-assets/carter-goleman/avatar-256.webp',
    name: 'Carter Goleman',
  },

  // Chelsea Lightbown
  chelsea_lightbown: {
    src: '/coach-assets/chelsea-lightbown/avatar-256.webp',
    name: 'Chelsea Lightbown',
  },
  'chelsea-lightbown': {
    src: '/coach-assets/chelsea-lightbown/avatar-256.webp',
    name: 'Chelsea Lightbown',
  },

  // Dr. Clark Atul
  dr_clark_atul: {
    src: '/coach-assets/clark-atul/avatar-256.webp',
    name: 'Dr. Clark Atul',
  },
  'clark-atul': {
    src: '/coach-assets/clark-atul/avatar-256.webp',
    name: 'Dr. Clark Atul',
  },

  // Dr. Crystal Benner
  dr_crystal_benner: {
    src: '/coach-assets/crystal-benner/avatar-256.webp',
    name: 'Dr. Crystal Benner',
  },
  'crystal-benner': {
    src: '/coach-assets/crystal-benner/avatar-256.webp',
    name: 'Dr. Crystal Benner',
  },

  // Christopher Buffett
  christopher_buffett: {
    src: '/coach-assets/christopher-buffett/avatar-256.webp',
    name: 'Christopher Buffett',
  },
  'christopher-buffett': {
    src: '/coach-assets/christopher-buffett/avatar-256.webp',
    name: 'Christopher Buffett',
  },

  // Colton Covey
  colton_covey: {
    src: '/coach-assets/colton-covey/avatar-256.webp',
    name: 'Colton Covey',
  },
  'colton-covey': {
    src: '/coach-assets/colton-covey/avatar-256.webp',
    name: 'Colton Covey',
  },

  // Cody Turing
  cody_turing: {
    src: '/coach-assets/cody-turing/avatar-256.webp',
    name: 'Cody Turing',
  },
  'cody-turing': {
    src: '/coach-assets/cody-turing/avatar-256.webp',
    name: 'Cody Turing',
  },

  // Chloe Sinek
  chloe_sinek: {
    src: '/coach-assets/chloe-sinek/avatar-256.webp',
    name: 'Chloe Sinek',
  },
  'chloe-sinek': {
    src: '/coach-assets/chloe-sinek/avatar-256.webp',
    name: 'Chloe Sinek',
  },
}

function getCoachAvatarMeta(coachKey: string | null | undefined): CoachAvatarMeta | null {
  if (!coachKey) return null
  return COACH_AVATAR[coachKey] ?? null
}

/**
 * DashboardSummary
 *
 * Compact overview card that mirrors the dashboard hero and key stats.
 * Can be used on the main Dashboard page or other screens that want
 * a quick snapshot of practice time, drills, streak, and active coach.
 */
export default function DashboardSummary({
  profile,
  entitlement,
  progress,
  weeklyGoal = 10,
}: DashboardSummaryProps) {
  const plan = (entitlement?.plan ?? profile.tier).toUpperCase()
  const expires =
    entitlement?.expiresAt &&
    formatDate(entitlement.expiresAt, { dateStyle: 'medium' })
  const greeting = firstName(profile.fullName)
  const weeklyCompleted = Math.min(progress.attempts7d, weeklyGoal)
  const activeCoach = getCoachAvatarMeta(profile.activeCoachKey)

  const stats = [
    {
      label: 'Minutes (7d)',
      value: formatNumber(progress.minutes7d, 1),
      hint: 'Practice time',
    },
    {
      label: 'Drills (7d)',
      value: formatNumber(progress.attempts7d),
      hint: `${formatNumber(progress.attemptsAll)} all time`,
    },
    {
      label: 'Streak',
      value: `${Math.min(progress.daysActive7d, 7)}`,
      hint: 'days active',
    },
    {
      label: 'Pass rate (28d)',
      value: formatPercent(progress.passRate28d),
      hint: 'Avg rubric pass',
    },
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14">
            {/* User avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="User avatar"
              src={profile.avatarUrl ?? '/avatar-fallback.png'}
              className="h-14 w-14 rounded-full object-cover"
            />
            {/* Active coach avatar overlay */}
            {activeCoach && (
              <Image
                src={activeCoach.src}
                alt={`${activeCoach.name} avatar`}
                width={24}
                height={24}
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white object-cover dark:border-slate-900"
              />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Ready for your next drill, {greeting}?
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Plan: <span className="font-semibold">{plan}</span>
              {expires && (
                <span className="text-slate-500"> · renews {expires}</span>
              )}
            </p>
            {activeCoach && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active coach:{' '}
                <span className="font-semibold">{activeCoach.name}</span>
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {progress.lastActivityAt
                ? `Last practiced ${formatDate(progress.lastActivityAt)}`
                : 'No practice logged yet. Try a 3 minute warmup.'}
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs rounded-2xl bg-slate-900 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Need a warm up?
          </p>
          <PracticeNowButton
            className="mt-3 w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          />
          <p className="mt-3 text-[11px] text-white/80">
            Weekly goal: {weeklyCompleted}/{weeklyGoal} drills
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-500">{stat.hint}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatDate(
  value: string | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', options).format(new Date(value))
  } catch {
    return ''
  }
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

function formatPercent(value: number | null) {
  if (value == null) return '-'
  return `${formatNumber(value * 100)}%`
}

function firstName(fullName: string) {
  return fullName.split(' ')[0] || 'there'
}
