// src/components/app/PracticeNowButton.tsx
'use client'

/**
 * PracticeNowButton
 *
 * Small client-side button that calls the web proxy
 *   POST /api/adaptive/next-item
 * to fetch today's deterministic drill for the user.
 *
 * It accepts optional filters and exposes callbacks so the parent can
 * route to a drill page or open a modal.
 */

import * as React from 'react'

import { Button } from '@/components/ui/button'
import type { CoachKey } from '@/types'

// Keep in sync with the proxy and core shapes (core/src/core/scheduler/daily-deterministic.ts)
export type ItemFormat = 'drill' | 'vocab' | 'reflection' | 'scenario' | 'qbank' | string

export interface CatalogItem {
  id: string
  coach: CoachKey
  skill?: string
  topic?: string
  format?: ItemFormat
  difficulty?: 1 | 2 | 3 | 4 | 5
  language?: string
  minutes?: number
  tags?: string[]
  active?: boolean
}

export interface PickerMeta {
  rng: 'mulberry32'
  seed: string
  seedInt: number
  userId: string
  date: string
  appliedFilters: Record<string, unknown>
  excluded: { lru: number; inactive: number; gatedByTier: number; guardrails: number }
  candidates: number
  relaxed: { guardrails: boolean; lru: boolean }
  sampleIds: string[]
  reason: string[]
}

export interface PracticeNowResult {
  items: CatalogItem[]
  meta: PickerMeta
}

export interface PracticeNowFilters {
  coach?: CoachKey[]
  topic?: string[]
  skill?: string[]
  format?: string[]
  difficultyMin?: number
  difficultyMax?: number
  language?: string
}

export interface PracticeNowButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'onClick' | 'onError'> {
  /** How many items to request (default 1) */
  count?: number
  /** Optional filters to bias the scheduler */
  filters?: PracticeNowFilters
  /** Least recently used ids to avoid repeating */
  lru?: string[]
  /** Last selected id for tie-breaking */
  lastSelectedId?: string
  /** Called with the full scheduler result when successful */
  onResult?: (result: PracticeNowResult) => void
  /** Called when the request fails */
  onError?: (message: string) => void
  /** Button label when idle */
  labelIdle?: string
  /** Button label when busy */
  labelBusy?: string
}

export default function PracticeNowButton({
  count = 1,
  filters,
  lru,
  lastSelectedId,
  onResult,
  onError,
  labelIdle = 'Practice now',
  labelBusy = 'Finding…',
  disabled,
  ...btnProps
}: PracticeNowButtonProps) {
  const [busy, setBusy] = React.useState(false)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/adaptive/next-item', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ count, filters, lru, lastSelectedId }),
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await safeJson(res)
        const msg = data?.error || `Request failed: ${res.status}`
        throw new Error(typeof msg === 'string' ? msg : 'Request failed')
      }

      const data = (await res.json()) as PracticeNowResult
      if (onResult) {
        onResult(data)
      } else {
        console.debug('PracticeNow', data)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (onError) {
        onError(msg)
      } else {
        console.error('PracticeNow error', msg)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type="button"
      aria-label="Practice now"
      onClick={handleClick}
      disabled={busy || disabled}
      {...btnProps}
    >
      {busy ? labelBusy : labelIdle}
    </Button>
  )
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
