// src/components/app/ExpressionsList.tsx
import { Sparkles, Volume2 } from 'lucide-react'

import type { CoachKey, ExpressionItem } from '@/types'

export interface ExpressionsListItem extends ExpressionItem {
  id: string
  coachKey?: CoachKey | null
  topic?: string | null
  createdAt?: string | null
}

export interface ExpressionsListProps {
  items: ExpressionsListItem[]
  heading?: string
  description?: string
  emptyMessage?: string
}

/**
 * ExpressionsList
 *
 * Renders an Expressions Pack-style list showing upgraded phrases,
 * original lines, key collocations, optional pronunciation hints,
 * and example re-say prompts.
 */
export default function ExpressionsList({
  items,
  heading = 'Expressions Pack',
  description = 'Upgraded phrases, collocations, and pronunciation notes saved from your sessions.',
  emptyMessage = 'No expressions saved yet. Finish a drill to see your Expressions Pack here.',
}: ExpressionsListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Expressions
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
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => {
            const hasPronunciation = !!item.pronunciation
            const coachLabel =
              item.coachKey && COACH_LABELS[item.coachKey as CoachKey]
                ? COACH_LABELS[item.coachKey as CoachKey]
                : null

            return (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-800 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-sky-600">
                      <Sparkles className="h-3 w-3" />
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                    <span>Expression upgrade</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {coachLabel && <span className="truncate max-w-[9rem]">{coachLabel}</span>}
                    {item.topic && <span className="truncate max-w-[9rem]">{item.topic}</span>}
                    {item.createdAt && (
                      <span>{formatDate(item.createdAt)}</span>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Upgraded phrase
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.text_upgraded}
                  </p>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-500">From:</span>{' '}
                    <span>{item.text_original}</span>
                  </p>
                </div>

                {item.collocations && item.collocations.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Key collocations
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {item.collocations.slice(0, 4).map((col) => (
                        <span
                          key={col}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300"
                        >
                          <Sparkles className="h-3 w-3 text-sky-500" />
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasPronunciation && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="font-semibold">{item.pronunciation?.word}</span>
                    {item.pronunciation?.hint && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.pronunciation.hint}
                      </span>
                    )}
                  </div>
                )}

                {item.examples && item.examples.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Re-say prompts
                    </p>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {item.examples.slice(0, 3).map((ex) => (
                        <li key={ex} className="leading-snug">
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

const COACH_LABELS: Record<CoachKey, string> = {
  chase_krashen: 'Chase Krashen · Academic English',
  dr_claire_swales: 'Dr. Claire Swales · Admissions',
  carter_goleman: 'Carter Goleman · Interviews',
  chelsea_lightbown: 'Chelsea Lightbown · IELTS/TOEFL',
  dr_clark_atul: 'Dr. Clark Atul · Physicians',
  dr_crystal_benner: 'Dr. Crystal Benner · Nursing',
  christopher_buffett: 'Christopher Buffett · Finance',
  colton_covey: 'Colton Covey · Leadership',
  cody_turing: 'Cody Turing · Technical',
  chloe_sinek: 'Chloe Sinek · Personal vision',
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}
