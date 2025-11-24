// src/hooks/use-intent.ts
'use client'

import { useMemo, useState } from 'react'
import type { IntentId, IntentChip } from '@/components/app/IntentChips'

export interface UseIntentOptions {
  initial?: IntentId | null
}

/**
 * useIntent
 *
 * Small helper for intent-aware chat and drills.
 * - Tracks the currently selected intent (quick drill, mock interview, etc.)
 * - Exposes a stable list of intent chips
 * - Provides starter prompts you can feed into ChatPanel or DrillRunner
 */
export function useIntent(options: UseIntentOptions = {}) {
  const [intent, setIntent] = useState<IntentId | null>(options.initial ?? null)

  const items: IntentChip[] = useMemo(
    () => [
      { id: 'quick_drill', label: 'Quick drill (3–5 min)' },
      { id: 'expressions_review', label: 'Review Expressions' },
      { id: 'mock_interview', label: 'Mock interview' },
      { id: 'exam_practice', label: 'Exam practice' },
    ],
    [],
  )

  const starterPrompts = useMemo(() => promptsForIntent(intent), [intent])

  return {
    intent,
    setIntent,
    items,
    starterPrompts,
  }
}

/** Returns a small set of starter prompts for the given intent. */
export function promptsForIntent(intent: IntentId | null): string[] {
  switch (intent) {
    case 'quick_drill':
      return [
        'Run a 3-minute warmup drill about my current project standup.',
        'Give me a 2-minute drill where I summarize yesterday and today in clear English.',
        'Ask me to compare two options and defend one in under 90 seconds.',
      ]
    case 'expressions_review':
      return [
        'Help me review and practice the last 10 upgraded expressions from my Packs.',
        'Pick 5 phrases I overuse and suggest better alternatives, then quiz me.',
        'Drill me on collocations for explaining risks and tradeoffs.',
      ]
    case 'mock_interview':
      return [
        'Run a behavioral interview about a time I disagreed with a stakeholder.',
        'Act as a hiring manager and ask me 3 questions about my last project.',
        'Give me follow-up questions after I answer “Tell me about yourself.”',
      ]
    case 'exam_practice':
      return [
        'Give me an IELTS Speaking Part 2 card about teamwork, with follow-up questions.',
        'Run an OSCE-style case where I explain a diagnosis to a patient in simple language.',
        'Give me a timed TOEFL integrated speaking task and then feedback.',
      ]
    default:
      return [
        'Give me a 3–5 minute drill that fits my current coach and level.',
        'Suggest a short speaking task that will surface useful expressions to save.',
      ]
  }
}
