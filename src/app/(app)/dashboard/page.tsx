// src/app/(app)/dashboard/page.tsx
import type { Metadata } from "next"
import Image from "next/image"

import PracticeNowButton from "@/components/app/PracticeNowButton"
import { logger } from "@/lib/logger"
import { getSupabaseServerClient, requireUser } from "@/lib/supabase/server"

const dashLog = logger.child("dashboard")
const WEEKLY_DRILL_GOAL = 10

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard • Polaris Coach",
  description:
    "Track drills, streaks, and recommendations tailored to your current coach.",
}

type TierName = "free" | "pro" | "vip"

type ProfileSummary = {
  id: string
  fullName: string
  avatarUrl: string | null
  tier: TierName
  activeCoachKey: string | null
  memberSince: string | null
}

type EntitlementSummary =
  | {
      plan: TierName
      status: string | null
      provider: string | null
      expiresAt: string | null
    }
  | null

type ProgressSnapshot = {
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

type SessionSummary = {
  id: string
  coachKey: string | null
  startedAt: string
  durationMinutes: number | null
  score: number | null
  wordsPerMinute: number | null
}

type DrillSummary = {
  id: string
  title: string
  coachKey: string | null
  tags: string[]
  difficulty: number | null
  timeEstimate: number | null
}

type DashboardSnapshot = {
  profile: ProfileSummary
  entitlement: EntitlementSummary
  progress: ProgressSnapshot
  sessions: SessionSummary[]
  drills: DrillSummary[]
}

type CoachAvatarMeta = {
  src: string
  name: string
}

type ProfileRow = {
  id?: string
  full_name?: string | null
  avatar_url?: string | null
  tier?: string | null
  active_coach_key?: string | null
  created_at?: string | null
}

type EntitlementRow = {
  plan?: string | null
  status?: string | null
  provider?: string | null
  ends_at?: string | null
  cancel_at?: string | null
}

type ProgressRow = {
  minutes_7d?: number | null
  attempts_7d?: number | null
  attempts_all?: number | null
  days_active_7d?: number | null
  avg_score_28d?: number | null
  avg_wpm_28d?: number | null
  pass_rate_28d?: number | null
  last_activity_at?: string | null
  top_coach_id_28d?: string | null
  top_topic_28d?: string | null
  tier_current?: string | null
  active_coach_id?: string | null
  user_created_at?: string | null
  full_name?: string | null
}

type SessionRow = {
  id: string
  coach_key?: string | null
  started_at: string
  ended_at?: string | null
  duration_sec?: number | null
  score?: number | null
  words_per_minute?: number | null
}

type DrillRow = {
  id: string
  title: string
  tags?: string[] | null
  coach_key?: string | null
  time_estimate_minutes?: number | null
  difficulty?: number | null
}

// Shared map: CoachKey -> avatar in public/coach-assets/<coach-slug>/avatar-256.webp
// Supports both snake_case keys and kebab-case slugs for robustness.
const COACH_AVATAR: Record<string, CoachAvatarMeta> = {
  // Chase Krashen
  chase_krashen: {
    src: "/coach-assets/chase-krashen/avatar-256.webp",
    name: "Chase Krashen",
  },
  "chase-krashen": {
    src: "/coach-assets/chase-krashen/avatar-256.webp",
    name: "Chase Krashen",
  },

  // Dr. Claire Swales
  dr_claire_swales: {
    src: "/coach-assets/claire-swales/avatar-256.webp",
    name: "Dr. Claire Swales",
  },
  "claire-swales": {
    src: "/coach-assets/claire-swales/avatar-256.webp",
    name: "Dr. Claire Swales",
  },

  // Carter Goleman
  carter_goleman: {
    src: "/coach-assets/carter-goleman/avatar-256.webp",
    name: "Carter Goleman",
  },
  "carter-goleman": {
    src: "/coach-assets/carter-goleman/avatar-256.webp",
    name: "Carter Goleman",
  },

  // Chelsea Lightbown
  chelsea_lightbown: {
    src: "/coach-assets/chelsea-lightbown/avatar-256.webp",
    name: "Chelsea Lightbown",
  },
  "chelsea-lightbown": {
    src: "/coach-assets/chelsea-lightbown/avatar-256.webp",
    name: "Chelsea Lightbown",
  },

  // Dr. Clark Atul
  dr_clark_atul: {
    src: "/coach-assets/clark-atul/avatar-256.webp",
    name: "Dr. Clark Atul",
  },
  "clark-atul": {
    src: "/coach-assets/clark-atul/avatar-256.webp",
    name: "Dr. Clark Atul",
  },

  // Dr. Crystal Benner
  dr_crystal_benner: {
    src: "/coach-assets/crystal-benner/avatar-256.webp",
    name: "Dr. Crystal Benner",
  },
  "crystal-benner": {
    src: "/coach-assets/crystal-benner/avatar-256.webp",
    name: "Dr. Crystal Benner",
  },

  // Christopher Buffett
  christopher_buffett: {
    src: "/coach-assets/christopher-buffett/avatar-256.webp",
    name: "Christopher Buffett",
  },
  "christopher-buffett": {
    src: "/coach-assets/christopher-buffett/avatar-256.webp",
    name: "Christopher Buffett",
  },

  // Colton Covey
  colton_covey: {
    src: "/coach-assets/colton-covey/avatar-256.webp",
    name: "Colton Covey",
  },
  "colton-covey": {
    src: "/coach-assets/colton-covey/avatar-256.webp",
    name: "Colton Covey",
  },

  // Cody Turing
  cody_turing: {
    src: "/coach-assets/cody-turing/avatar-256.webp",
    name: "Cody Turing",
  },
  "cody-turing": {
    src: "/coach-assets/cody-turing/avatar-256.webp",
    name: "Cody Turing",
  },

  // Chloe Sinek
  chloe_sinek: {
    src: "/coach-assets/chloe-sinek/avatar-256.webp",
    name: "Chloe Sinek",
  },
  "chloe-sinek": {
    src: "/coach-assets/chloe-sinek/avatar-256.webp",
    name: "Chloe Sinek",
  },
}

function getCoachAvatarMeta(
  coachKey: string | null | undefined,
): CoachAvatarMeta | null {
  if (!coachKey) return null
  return COACH_AVATAR[coachKey] ?? null
}

/* -------------------------------------------------------------------------- */
/*  Data loading and mapping                                                  */
/* -------------------------------------------------------------------------- */

async function loadDashboardSnapshot(
  userId: string,
  fallbackName?: string | null,
): Promise<DashboardSnapshot> {
  const supabase = getSupabaseServerClient()

  const profileQuery = supabase
    .from("profiles")
    .select("id, full_name, avatar_url, tier, active_coach_key, created_at")
    .eq("id", userId)
    .maybeSingle()

  const entitlementQuery = supabase
    .from("entitlements")
    .select("plan, status, provider, ends_at, cancel_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const progressQuery = supabase
    .from("v_user_progress")
    .select(
      "minutes_7d, attempts_7d, attempts_all, days_active_7d, avg_score_28d, avg_wpm_28d, pass_rate_28d, last_activity_at, top_coach_id_28d, top_topic_28d, tier_current, active_coach_id, user_created_at, full_name",
    )
    .eq("user_id", userId)
    .maybeSingle()

  const sessionsQuery = supabase
    .from("sessions")
    .select(
      "id, coach_key, started_at, ended_at, duration_sec, score, words_per_minute",
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(5)

  const drillsQuery = supabase
    .from("drills")
    .select(
      "id, title, tags, coach_key, time_estimate_minutes, difficulty, state, is_public, created_at",
    )
    .eq("is_public", true)
    .eq("state", "published")
    .order("created_at", { ascending: false })
    .limit(6)

  const [profileRes, entitlementRes, progressRes, sessionsRes, drillsRes] =
    await Promise.all([
      profileQuery,
      entitlementQuery,
      progressQuery,
      sessionsQuery,
      drillsQuery,
    ])

  logPostgrestError("profiles", profileRes.error)
  logPostgrestError("entitlements", entitlementRes.error)
  if (progressRes.error && !isMissingRelation(progressRes.error)) {
    logPostgrestError("v_user_progress", progressRes.error)
  }
  logPostgrestError("sessions", sessionsRes.error)
  logPostgrestError("drills", drillsRes.error)

  const profileRow = (profileRes.data as ProfileRow | null) ?? null
  const progressRow = (progressRes.data as ProgressRow | null) ?? null
  const entitlementRow = (entitlementRes.data as EntitlementRow | null) ?? null

  const profile = mapProfile(profileRow, progressRow, userId, fallbackName)
  const entitlement = mapEntitlement(entitlementRow)
  const progress = mapProgress(progressRow)
  const sessions = mapSessions(
    Array.isArray(sessionsRes.data) ? (sessionsRes.data as SessionRow[]) : [],
  )
  const drills = mapDrills(
    Array.isArray(drillsRes.data) ? (drillsRes.data as DrillRow[]) : [],
  )

  return { profile, entitlement, progress, sessions, drills }
}

function mapProfile(
  row: ProfileRow | null,
  progressRow: ProgressRow | null,
  userId: string,
  fallbackName?: string | null,
): ProfileSummary {
  const tier = normalizeTier(row?.tier ?? progressRow?.tier_current)
  const name =
    (row?.full_name ?? progressRow?.full_name ?? fallbackName ?? "")
      .trim() || "there"

  return {
    id: row?.id ?? userId,
    fullName: name,
    avatarUrl: row?.avatar_url ?? null,
    tier,
    activeCoachKey: row?.active_coach_key ?? progressRow?.active_coach_id ?? null,
    memberSince: row?.created_at ?? progressRow?.user_created_at ?? null,
  }
}

function mapEntitlement(row: EntitlementRow | null): EntitlementSummary {
  if (!row) return null
  return {
    plan: normalizeTier(row.plan ?? undefined),
    status: row.status ?? null,
    provider: row.provider ?? null,
    expiresAt: row.cancel_at ?? row.ends_at ?? null,
  }
}

function mapProgress(row: ProgressRow | null): ProgressSnapshot {
  return {
    minutes7d: numberOrZero(row?.minutes_7d),
    attempts7d: numberOrZero(row?.attempts_7d),
    attemptsAll: numberOrZero(row?.attempts_all),
    passRate28d: nullableNumber(row?.pass_rate_28d),
    avgScore28d: nullableNumber(row?.avg_score_28d),
    avgWpm28d: nullableNumber(row?.avg_wpm_28d),
    daysActive7d: numberOrZero(row?.days_active_7d),
    lastActivityAt: row?.last_activity_at ?? null,
    topCoach: row?.top_coach_id_28d ?? null,
    topTopic: row?.top_topic_28d ?? null,
  }
}

function mapSessions(rows: SessionRow[]): SessionSummary[] {
  return rows.map((row) => ({
    id: row.id,
    coachKey: row.coach_key ?? null,
    startedAt: row.started_at,
    durationMinutes: deriveMinutes(row.duration_sec, row.started_at, row.ended_at),
    score: nullableNumber(row.score),
    wordsPerMinute: nullableNumber(row.words_per_minute),
  }))
}

function mapDrills(rows: DrillRow[]): DrillSummary[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    coachKey: row.coach_key ?? null,
    tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
    difficulty: nullableNumber(row.difficulty),
    timeEstimate: nullableNumber(row.time_estimate_minutes),
  }))
}

/* -------------------------------------------------------------------------- */
/*  Page components                                                           */
/* -------------------------------------------------------------------------- */

function Hero({
  profile,
  entitlement,
  progress,
}: {
  profile: ProfileSummary
  entitlement: EntitlementSummary
  progress: ProgressSnapshot
}) {
  const plan = (entitlement?.plan ?? profile.tier).toUpperCase()
  const expires =
    entitlement?.expiresAt &&
    formatDate(entitlement.expiresAt, { dateStyle: "medium" })
  const greeting = firstName(profile.fullName)
  const activeCoach = getCoachAvatarMeta(profile.activeCoachKey)

  return (
    <section className="pc-section">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16">
            {/* User avatar */}
            <img
              alt="User avatar"
              src={profile.avatarUrl ?? "/avatar-fallback.png"}
              className="h-16 w-16 rounded-full object-cover"
            />
            {/* Active coach avatar overlay */}
            {activeCoach && (
              <Image
                src={activeCoach.src}
                alt={`${activeCoach.name} avatar`}
                width={28}
                height={28}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-surface object-cover"
              />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              Ready for your next drill, {greeting}?
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan: <span className="font-semibold">{plan}</span>
              {expires && (
                <span className="text-muted-foreground"> • renews {expires}</span>
              )}
            </p>
            {activeCoach && (
              <p className="text-xs text-muted-foreground">
                Active coach:{" "}
                <span className="font-semibold">{activeCoach.name}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {progress.lastActivityAt
                ? `Last practiced ${formatDate(progress.lastActivityAt)}`
                : "No practice logged yet. Try a 3-minute warmup."}
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs rounded-2xl bg-primary p-4 text-primary-foreground shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
            Need a warm-up?
          </p>
          <PracticeNowButton
            className="mt-3 w-full rounded-xl bg-primary-foreground/10 px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-foreground/20"
          />
          <p className="mt-3 text-xs text-primary-foreground/80">
            Weekly goal:{" "}
            {Math.min(progress.attempts7d, WEEKLY_DRILL_GOAL)}/
            {WEEKLY_DRILL_GOAL} drills
          </p>
        </div>
      </div>
    </section>
  )
}

function StatsGrid({ progress }: { progress: ProgressSnapshot }) {
  const stats: { label: string; value: string; hint: string }[] = [
    {
      label: "Minutes (7d)",
      value: formatNumber(progress.minutes7d, 1),
      hint: "Practice time",
    },
    {
      label: "Drills (7d)",
      value: formatNumber(progress.attempts7d),
      hint: `${formatNumber(progress.attemptsAll)} all time`,
    },
    {
      label: "Streak",
      value: `${Math.min(progress.daysActive7d, 7)}`,
      hint: "Days active",
    },
    {
      label: "Pass rate (28d)",
      value: formatPercent(progress.passRate28d),
      hint: "Avg rubric pass",
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="pc-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {stat.value}
          </p>
          <p className="text-xs text-muted-foreground">{stat.hint}</p>
        </div>
      ))}
    </section>
  )
}

function RecentSessions({ sessions }: { sessions: SessionSummary[] }) {
  return (
    <section className="pc-section">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent practice
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Last 5 sessions
          </h2>
        </div>
        <a className="text-sm font-semibold text-accent" href="/chat">
          Open chat
        </a>
      </header>

      <ul className="mt-4 divide-y divide-border">
        {sessions.length === 0 && (
          <li className="py-5 text-sm text-muted-foreground">
            No sessions yet. Start a drill or chat with your coach to see
            progress here.
          </li>
        )}
        {sessions.map((session) => {
          const coach = getCoachAvatarMeta(session.coachKey)

          return (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 py-4"
            >
              <div className="flex items-center gap-3">
                {coach && (
                  <Image
                    src={coach.src}
                    alt={`${coach.name} avatar`}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {coach ? coach.name : "Practice session"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(session.startedAt)}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-foreground">
                  {session.score != null
                    ? `${formatNumber(session.score)} pts`
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.durationMinutes != null
                    ? `${session.durationMinutes} min`
                    : "Live"}
                  {session.wordsPerMinute != null && (
                    <span>
                      {" "}
                      · {formatNumber(session.wordsPerMinute)} wpm
                    </span>
                  )}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function ProgressHighlights({ progress }: { progress: ProgressSnapshot }) {
  const completed = progress.attempts7d >= WEEKLY_DRILL_GOAL
  const drillsRemaining = Math.max(WEEKLY_DRILL_GOAL - progress.attempts7d, 0)
  const goalLabel = completed
    ? "Goal met. Keep the streak going."
    : `${drillsRemaining} drill${
        drillsRemaining === 1 ? "" : "s"
      } to hit your goal`
  const goalPercent = Math.min(progress.attempts7d / WEEKLY_DRILL_GOAL, 1)
  const focusCoach = getCoachAvatarMeta(progress.topCoach)

  return (
    <section className="pc-section">
      <h2 className="text-xl font-semibold text-foreground">Insights</h2>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">
            Weekly goal
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <span className="text-3xl font-semibold">
              {Math.min(progress.attempts7d, WEEKLY_DRILL_GOAL)}/
              {WEEKLY_DRILL_GOAL}
            </span>
            <span className="text-sm text-primary-foreground/90">
              {goalLabel}
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-primary-foreground/30">
            <div
              className="h-2 rounded-full bg-primary-foreground"
              style={{ width: `${goalPercent * 100}%` }}
            />
          </div>
        </div>

        <HighlightRow
          label="Avg. score (28d)"
          value={formatScore(progress.avgScore28d)}
          hint="Composite rubric"
        />
        <HighlightRow
          label="Avg. pace"
          value={
            progress.avgWpm28d != null
              ? `${formatNumber(progress.avgWpm28d)} wpm`
              : "-"
          }
          hint="Words per minute"
        />
        <HighlightRow
          label="Focus area"
          value={
            progress.topTopic ??
            (focusCoach ? focusCoach.name : "Varied practice")
          }
          hint={
            focusCoach
              ? `Mostly with ${focusCoach.name}`
              : "Try repeating one scenario"
          }
        />
      </div>
    </section>
  )
}

function HighlightRow({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="pc-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function RecommendedDrills({ drills }: { drills: DrillSummary[] }) {
  return (
    <section className="pc-section">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Keep the momentum
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            Recommended drills
          </h2>
        </div>
        <a className="text-sm font-semibold text-accent" href="/explore">
          Browse all
        </a>
      </header>

      {drills.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No public drills yet. Check back soon or ask your coach for a custom
          scenario.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drills.map((drill) => {
            const coach = getCoachAvatarMeta(drill.coachKey)

            return (
              <a
                key={drill.id}
                href="/chat"
                className="pc-card flex flex-col transition hover:border-accent hover:shadow-soft"
              >
                <div className="mb-2 flex items-center gap-3">
                  {coach && (
                    <Image
                      src={coach.src}
                      alt={`${coach.name} avatar`}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {coach ? coach.name : "Featured drill"}
                    </p>
                    <p className="mt-1 text-base font-semibold text-foreground">
                      {drill.title}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {drill.timeEstimate != null
                    ? `${formatNumber(drill.timeEstimate)} min est.`
                    : "Quick drill"}
                </p>
                {drill.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {drill.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                 */
/* -------------------------------------------------------------------------- */

function numberOrZero(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function deriveMinutes(
  durationSeconds?: unknown,
  startedAt?: string | null,
  endedAt?: string | null,
) {
  const direct = nullableNumber(durationSeconds)
  if (direct != null) {
    const minutes = direct / 60
    return minutes >= 1
      ? Math.round(minutes)
      : Math.max(Math.round(minutes * 10) / 10, 0)
  }
  if (startedAt && endedAt) {
    const start = Date.parse(startedAt)
    const end = Date.parse(endedAt)
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      return Math.round((end - start) / 60000)
    }
  }
  return null
}

function normalizeTier(value?: string | null): TierName {
  const tier = (value ?? "").toLowerCase()
  if (tier.startsWith("vip")) return "vip"
  if (tier.startsWith("pro")) return "pro"
  return "free"
}

function formatDate(
  value: string | null,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
) {
  if (!value) return ""
  try {
    return new Intl.DateTimeFormat("en", options).format(new Date(value))
  } catch {
    return ""
  }
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

function formatPercent(value: number | null) {
  if (value == null) return "-"
  return `${formatNumber(value * 100)}%`
}

function formatScore(value: number | null) {
  if (value == null) return "-"
  if (value <= 1) return `${formatNumber(value * 100)}%`
  return `${formatNumber(value)} / 100`
}

function firstName(fullName: string) {
  return fullName.split(" ")[0] || "there"
}

function logPostgrestError(
  label: string,
  error?: { message?: string } | null,
) {
  if (!error) return
  dashLog.error(`${label} query failed`, { error: error.message })
}

function isMissingRelation(error?: { message?: string }) {
  const msg = (error?.message || "").toLowerCase()
  return msg.includes("does not exist") || msg.includes("missing")
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default async function DashboardPage() {
  const user = await requireUser("/login")
  const fullName = (user.user_metadata as Record<string, string> | undefined)
    ?.full_name
  const snapshot = await loadDashboardSnapshot(user.id, fullName)

  return (
    <main className="space-y-8 pb-12">
      <Hero
        profile={snapshot.profile}
        entitlement={snapshot.entitlement}
        progress={snapshot.progress}
      />
      <StatsGrid progress={snapshot.progress} />
      <section className="grid gap-6 lg:grid-cols-[1.15fr,0.9fr]">
        <RecentSessions sessions={snapshot.sessions} />
        <ProgressHighlights progress={snapshot.progress} />
      </section>
      <RecommendedDrills drills={snapshot.drills} />
    </main>
  )
}
