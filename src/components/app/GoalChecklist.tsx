// src/components/app/GoalChecklist.tsx
'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Target } from 'lucide-react'

export type GoalKind = 'onboarding' | 'weekly' | 'practice'

export interface GoalChecklistItem {
  id: string
  label: string
  description?: string
  kind?: GoalKind
  done?: boolean
}

export interface GoalChecklistProps {
  title?: string
  subtitle?: string
  items?: GoalChecklistItem[]
  onToggle?: (itemId: string, done: boolean) => void
}

/**
 * GoalChecklist
 *
 * Lightweight client-side checklist for core Polaris milestones:
 * onboarding quiz, coach pick, weekly drills, vocab review, and reflection.
 * State is local-only; server remains source of truth for entitlements.
 */
export default function GoalChecklist({
  title = 'This week’s focus',
  subtitle = 'Stay on a simple loop: drills, Expressions Packs, and one reflection.',
  items,
  onToggle,
}: GoalChecklistProps) {
  const [local, setLocal] = useState<GoalChecklistItem[]>(
    () => items && items.length > 0 ? items : DEFAULT_WEEKLY_GOALS,
  )

  const handleToggle = (id: string) => {
    setLocal((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    )
    const item = local.find((g) => g.id === id)
    if (item && onToggle) onToggle(id, !item.done)
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-sm shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <Target className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Goals
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      <ul className="mt-3 space-y-2">
        {local.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleToggle(item.id)}
              className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition hover:border-sky-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500/60"
            >
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400" aria-hidden="true" />
                )}
              </span>
              <span>
                <span className="font-semibold">{item.label}</span>
                {item.description && (
                  <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                    {item.description}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export const DEFAULT_WEEKLY_GOALS: GoalChecklistItem[] = [
  {
    id: 'onboarding',
    kind: 'onboarding',
    label: 'Complete the onboarding quiz',
    description:
      'Set your goal, domains, and difficulty so Polaris can match you to the right coach and plan.',
  },
  {
    id: 'coach',
    kind: 'onboarding',
    label: 'Pick one active coach',
    description:
      'Choose the coach that best fits your current goal. Free and Pro keep one active coach with a cooldown.',
  },
  {
    id: 'drills',
    kind: 'weekly',
    label: 'Run three focused drills',
    description:
      'Aim for 10–15 minutes per drill with timed answers and clear structure.',
  },
  {
    id: 'vocab',
    kind: 'weekly',
    label: 'Review one Expressions Pack',
    description:
      'Open your Expressions Pack, favorite key upgrades, and add a few to spaced review.',
  },
  {
    id: 'reflection',
    kind: 'weekly',
    label: 'Do one weekly reflection',
    description:
      'Write or speak a short reflection on what improved, what stayed hard, and your next focus.',
  },
]
