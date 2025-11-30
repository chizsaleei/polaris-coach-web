// src/components/app/SessionsList.tsx
import Link from 'next/link'

import type { CoachKey } from '@/types'
import { COACH_AVATAR, COACH_LABELS } from '@/lib/coaches'

export interface SessionsListItem {
  id: string
  coachKey?: string | null
  startedAt: string
  durationMinutes?: number | null
  score?: number | null
  wordsPerMinute?: number | null
  href?: string
}

export interface SessionsListProps {
  items: SessionsListItem[]
  heading?: string
  subheading?: string
  emptyMessage?: string
  ctaHref?: string
  ctaLabel?: string
}

/**
 * SessionsList
 *
 * Shared list for recent practice sessions, matching the dashboard
 * layout and metrics (score, minutes, WPM). Shows coach avatar and label
 * when a known coachKey is present.
 */
export default function SessionsList({
  items,
  heading = 'Recent practice',
  subheading = 'Last sessions',
  emptyMessage = 'No sessions yet. Start a drill or chat with your coach to see progress here.',
  ctaHref = '/chat',
  ctaLabel = 'Open chat',
}: SessionsListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {heading}
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {subheading}
          </h2>
        </div>
        {ctaHref && (
          <Link className="text-sm font-semibold text-sky-600" href={ctaHref}>
            {ctaLabel}
          </Link>
        )}
      </header>

      <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
        {items.length === 0 && (
          <li className="py-5 text-sm text-slate-500">
            {emptyMessage}
          </li>
        )}

        {items.map((session) => {
          const rawCoachKey = session.coachKey ?? undefined
          const coachKey = rawCoachKey && isCoachKey(rawCoachKey) ? rawCoachKey : undefined
          const coachLabel = coachKey
            ? COACH_LABELS[coachKey] ?? `Coach ${coachKey}`
            : 'Practice session'
          const coachAvatarSrc = coachKey ? COACH_AVATAR[coachKey] : null

          const scoreLabel =
            session.score != null ? `${formatNumber(session.score)} pts` : '-'
          const durationLabel =
            session.durationMinutes != null
              ? `${session.durationMinutes} min`
              : 'Live'
          const wpmLabel =
            session.wordsPerMinute != null
              ? `${formatNumber(session.wordsPerMinute)} wpm`
              : null

          const rowContent = (
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                {coachAvatarSrc && (
                  <img
                    src={coachAvatarSrc}
                    alt={coachLabel}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="max-w-xs truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {coachLabel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(session.startedAt)}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {scoreLabel}
                </p>
                <p className="text-xs text-slate-500">
                  {durationLabel}
                  {wpmLabel && <span> · {wpmLabel}</span>}
                </p>
              </div>
            </div>
          )

          return (
            <li key={session.id}>
              {session.href ? (
                <Link href={session.href} className="block">
                  {rowContent}
                </Link>
              ) : (
                rowContent
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function isCoachKey(value: string): value is CoachKey {
  return Object.prototype.hasOwnProperty.call(COACH_LABELS, value)
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
