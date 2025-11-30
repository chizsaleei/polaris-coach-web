// src/components/app/AssignmentCard.tsx
import Link from 'next/link'
import { BookOpen, CalendarDays, CheckCircle2, Sparkles } from 'lucide-react'

import type { SevenDayPlanItem, CoachKey } from '@/types'
import { COACH_AVATAR, COACH_LABELS } from '@/lib/coaches'

export type AssignmentStatus = 'upcoming' | 'today' | 'completed'

export interface AssignmentCardProps {
  item: SevenDayPlanItem
  dayDate?: string | null
  status?: AssignmentStatus
  coachKey?: CoachKey | null
  coachLabel?: string
  minutes?: number | null
  tags?: string[]
  href?: string
}

const TYPE_LABEL: Record<SevenDayPlanItem['type'], string> = {
  drill: 'Drill',
  vocab: 'Vocabulary review',
  reflection: 'Reflection',
}

const TYPE_HINT: Record<SevenDayPlanItem['type'], string> = {
  drill: 'Run a focused 10–15 minute speaking drill.',
  vocab: 'Review saved expressions and add to spaced review.',
  reflection: 'Write or speak a short reflection on your week.',
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

function statusLabel(status?: AssignmentStatus) {
  if (!status) return null
  if (status === 'completed') return 'Completed'
  if (status === 'today') return 'Today'
  return 'Upcoming'
}

function statusClassName(status?: AssignmentStatus) {
  if (status === 'completed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-900/40'
  }
  if (status === 'today') {
    return 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/20 dark:text-sky-200 dark:border-sky-900/40'
  }
  return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-800'
}

export default function AssignmentCard({
  item,
  dayDate,
  status,
  coachKey,
  coachLabel,
  minutes,
  tags,
  href,
}: AssignmentCardProps) {
  const typeLabel = TYPE_LABEL[item.type]
  const typeHint = TYPE_HINT[item.type]
  const dateLabel = formatDate(dayDate)
  const statusText = statusLabel(status)

  const coachAvatarSrc = coachKey ? COACH_AVATAR[coachKey] : null
  const coachText =
    coachLabel ||
    (coachKey && COACH_LABELS[coachKey]) ||
    (coachKey ?? null)

  const content = (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 text-left shadow-sm shadow-slate-900/5 transition hover:border-sky-200 dark:border-slate-800 dark:bg-slate-900/50">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white dark:bg-sky-600">
            <BookOpen className="h-3.5 w-3.5" />
            Day {item.day} · {typeLabel}
          </span>
          {statusText && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClassName(
                status,
              )}`}
            >
              {status === 'completed' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {statusText}
            </span>
          )}
        </div>
        {(coachAvatarSrc || coachText) && (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            {coachAvatarSrc && (
              <img
                src={coachAvatarSrc}
                alt={coachText ?? 'Coach avatar'}
                className="h-6 w-6 rounded-full object-cover"
              />
            )}
            {coachText && (
              <span className="max-w-[8rem] truncate">
                {coachText}
              </span>
            )}
          </div>
        )}
      </header>

      <div className="mt-3 flex-1 space-y-1.5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {item.title}
        </h3>
        {item.prompt && (
          <p className="line-clamp-3 text-xs text-slate-600 dark:text-slate-300">
            {item.prompt}
          </p>
        )}
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{typeHint}</p>
      </div>

      <div className="mt-3 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          {dateLabel && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{dateLabel}</span>
            </span>
          )}
          {minutes != null && minutes > 0 && <span>~{minutes} min</span>}
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
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
      </div>

      {href && (
        <div className="mt-3 flex justify-end">
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-2xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Open assignment
          </Link>
        </div>
      )}
    </article>
  )

  return content
}
