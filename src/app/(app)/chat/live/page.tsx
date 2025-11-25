// src/app/(app)/chat/live/page.tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Headphones, Lightbulb, ShieldCheck, Sparkles } from 'lucide-react'

import LiveCoachPanel from '@/components/app/LiveCoachPanel'
import { getSupabaseServerClient, requireUser } from '@/lib/supabase/server'
import type { CoachKey } from '@/types'
import { COACH_AVATAR, COACH_LABELS, isCoachKey } from '@/lib/coaches'

export const metadata: Metadata = {
  title: 'Live speaking • Polaris Coach',
  description:
    'Run real-time speaking drills with your Polaris AI coach using your microphone and tailored rubrics.',
}

type CoachMeta = {
  src: string
  alt: string
  label: string
}

type UserMetadata = {
  full_name?: string | null
}

type ProfileSummary = {
  full_name: string | null
  active_coach_key: string | null
}

function getCoachMeta(key?: CoachKey | null): CoachMeta | null {
  if (!key) return null
  const src = COACH_AVATAR[key]
  const label = COACH_LABELS[key]
  if (!src || !label) return null

  return {
    src,
    alt: label,
    label,
  }
}

export default async function LiveChatPage() {
  const user = await requireUser('/login')
  const supabase = getSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, active_coach_key')
    .eq('id', user.id)
    .maybeSingle<ProfileSummary>()

  const userMetadata = (user.user_metadata ?? {}) as UserMetadata
  const fullName: string | undefined = profile?.full_name ?? userMetadata.full_name ?? undefined

  const firstName = fullName?.split(' ')[0] || 'there'
  const activeCoachKeyRaw = profile?.active_coach_key ?? null
  const coachKey: CoachKey | null =
    activeCoachKeyRaw && isCoachKey(activeCoachKeyRaw) ? (activeCoachKeyRaw as CoachKey) : null
  const coachMeta = getCoachMeta(coachKey)

  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Live speaking
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Practice live with your coach, {firstName}.
            </h1>
            <p className="mt-3 text-base text-slate-700 dark:text-slate-200">
              Use this tab for real-time speaking drills. Turn on your microphone, describe a case
              or situation, and let your coach guide the conversation with prompts and feedback.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Headphones className="h-4 w-4 text-sky-600" aria-hidden="true" />
              Before you start
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              <li>Use headphones if possible to avoid echo.</li>
              <li>Find a quiet space so the coach can hear you clearly.</li>
              <li>Decide on one concrete goal for this session.</li>
            </ul>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-3">
          <Checklist
            icon={<Sparkles className="h-4 w-4" />}
            label="Targeted drills"
            copy="Ask for 5–10 minute drills focused on one skill or scenario."
          />
          <Checklist
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Safe and private"
            copy="Sessions follow your safety settings and are not shared publicly."
          />
          <Checklist
            icon={<Lightbulb className="h-4 w-4" />}
            label="Actionable feedback"
            copy="End each drill with three wins, two fixes, and one next step."
          />
        </ul>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          {coachMeta && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
              <Image
                src={coachMeta.src}
                alt={coachMeta.alt}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Current coach
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {coachMeta.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live drills use this coach profile and rubric for guidance and scoring.
                </p>
              </div>
            </div>
          )}

          <LiveCoachPanel userId={user.id} userName={fullName} coachLabel={coachMeta?.label} />
        </div>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-[#04121B]">
            <header className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-amber-500" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ideas
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Live drill suggestions
                </h2>
              </div>
            </header>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>
                Present a patient case, project update, or research summary in 3–5 minutes, then ask
                for direct feedback.
              </li>
              <li>
                Role-play a difficult conversation, such as breaking bad news or pushing back on a
                deadline.
              </li>
              <li>
                Practice follow-up questions and signposting, for example “To summarize” or “My main
                concern is…”.
              </li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-[#04121B]">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Session tips</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <InfoRow
                title="Recommended length"
                value="Aim for focused 10–15 minute drills instead of very long calls."
              />
              <InfoRow
                title="Structure"
                value="Start with your goal, share a short context, then move into Q&A or role-play."
              />
              <InfoRow
                title="After the session"
                value="Write down three wins, two fixes, and one experiment for your next practice."
              />
              <InfoRow
                title="Need help"
                value="Email polaris@chizsaleei.com if you need to report or review a session."
              />
            </dl>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Prefer text-only practice Use the main{' '}
              <Link href="/chat" className="font-semibold underline">
                Practice now
              </Link>{' '}
              tab for typed conversations.
            </p>
          </article>
        </aside>
      </section>
    </main>
  )
}

function Checklist({
  icon,
  label,
  copy,
}: {
  icon: ReactNode
  label: string
  copy: string
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-slate-200/70 p-4">
      <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300">{copy}</p>
      </div>
    </li>
  )
}

function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</dt>
      <dd className="text-sm text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  )
}
