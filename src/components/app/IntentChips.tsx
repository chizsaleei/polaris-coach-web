// src/components/app/IntentChips.tsx
'use client'

import type { ReactNode } from 'react'
import { Sparkles, MessageSquareText, BookOpenCheck, Mic2 } from 'lucide-react'

export type IntentId =
  | 'quick_drill'
  | 'expressions_review'
  | 'mock_interview'
  | 'exam_practice'

export interface IntentChip {
  id: IntentId | string
  label: string
  description?: string
  icon?: ReactNode
}

export interface IntentChipsProps {
  items?: IntentChip[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}

/**
 * IntentChips
 *
 * Small row of suggested intents for the chat or drill runner,
 * aligned with Polaris Coach core flows: quick drills, Expressions review,
 * mock interviews, and exam practice.
 */
export default function IntentChips({
  items,
  selectedId,
  onSelect,
}: IntentChipsProps) {
  const intents = items && items.length > 0 ? items : DEFAULT_INTENTS

  if (!intents.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {intents.map((intent) => {
        const isActive = selectedId === intent.id
        const iconNode = intent.icon ?? iconForIntent(intent.id)

        return (
          <button
            key={intent.id}
            type="button"
            onClick={() => onSelect?.(intent.id)}
            className={[
              'inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-medium transition',
              isActive
                ? 'border-sky-500 bg-sky-50 text-sky-800 shadow-sm dark:border-sky-400 dark:bg-sky-900/40 dark:text-sky-100'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="flex h-4 w-4 items-center justify-center">
              {iconNode}
            </span>
            <span>{intent.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const DEFAULT_INTENTS: IntentChip[] = [
  {
    id: 'quick_drill',
    label: 'Quick drill (3–5 min)',
    description: 'Short warmup by skill or topic.',
  },
  {
    id: 'expressions_review',
    label: 'Review Expressions',
    description: 'Look at your saved upgrades.',
  },
  {
    id: 'mock_interview',
    label: 'Mock interview',
    description: 'Behavioral, case, or tech loops.',
  },
  {
    id: 'exam_practice',
    label: 'Exam practice',
    description: 'IELTS, TOEFL, OSCE, MRCP.',
  },
]

function iconForIntent(id: IntentChip['id']): ReactNode {
  if (id === 'quick_drill') {
    return <Mic2 className="h-3.5 w-3.5" />
  }
  if (id === 'expressions_review') {
    return <BookOpenCheck className="h-3.5 w-3.5" />
  }
  if (id === 'mock_interview') {
    return <MessageSquareText className="h-3.5 w-3.5" />
  }
  if (id === 'exam_practice') {
    return <Sparkles className="h-3.5 w-3.5" />
  }
  return <Sparkles className="h-3.5 w-3.5" />
}
