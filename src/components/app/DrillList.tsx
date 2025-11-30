// src/components/app/DrillList.tsx
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

import type { CoachKey } from '@/types'
import { COACH_AVATAR, COACH_LABELS, isCoachKey } from '@/lib/coaches'

export interface DrillListItem {
  id: string
  title: string
  coachKey?: CoachKey | string | null
  tags?: string[]
  difficulty?: number | null
  timeEstimate?: number | null
  createdAt?: string | null
  href?: string
}

export interface DrillListProps {
  items: DrillListItem[]
  heading?: string
  description?: string
  emptyMessage?: string
}

/**
 * DrillList
 *
 * Shared grid for listing public or recommended drills.
 * Used by dashboard and explore to show title, coach, tags, level, and minutes.
 */
export default function DrillList({
  items,
  heading = 'Drills',
  description,
  emptyMessage = 'No drills found. Try adjusting filters or using Practice now.',
}: DrillListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 dark:bg-[#03121A]">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Browse
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {heading}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((drill) => {
            const rawCoachKey = drill.coachKey ?? undefined

            let coachKey: CoachKey | undefined
            let coachLabel: string | null = null
            let coachAvatarSrc: string | null = null

            if (typeof rawCoachKey === 'string' && isCoachKey(rawCoachKey)) {
              coachKey = rawCoachKey
              coachLabel = COACH_LABELS[coachKey] ?? null
              coachAvatarSrc = COACH_AVATAR[coachKey] ?? null
            } else if (typeof rawCoachKey === 'string') {
              // Unknown string key - show it as a plain label, no avatar
              coachLabel = rawCoachKey
            }

            const href = drill.href ?? '/chat'

            return (
              <Link
                key={drill.id}
                href={href}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 text-left transition hover:border-sky-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {coachAvatarSrc && (
                      <img
                        src={coachAvatarSrc}
                        alt={coachLabel ?? 'Coach avatar'}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    )}
                    <p className="max-w-[11rem] truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {coachLabel ?? 'Featured drill'}
                    </p>
                  </div>
                  {drill.createdAt && (
                    <span className="text-[11px] text-slate-400">
                      {formatDate(drill.createdAt)}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {drill.title}
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  {drill.timeEstimate != null && drill.timeEstimate > 0 && (
                    <span>{drill.timeEstimate} min est.</span>
                  )}
                  {drill.difficulty != null && (
                    <span
                      className={
                        drill.timeEstimate != null && drill.timeEstimate > 0
                          ? 'ml-2'
                          : undefined
                      }
                    >
                      Level {drill.difficulty}/5
                    </span>
                  )}
                </p>

                {drill.tags && drill.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {drill.tags.slice(0, 4).map((tag) => (
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
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
      new Date(value),
    )
  } catch {
    return value
  }
}
