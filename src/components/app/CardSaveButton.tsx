// src/components/app/CardSaveButton.tsx
'use client'

import * as React from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'

export type SaveKind = 'drill' | 'expression' | 'pack' | 'session'

export interface CardSaveButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onChange'> {
  /** Stable id for the thing being saved, e.g. drill_id or pack_id */
  resourceId: string
  /** What type of item this is (used for analytics and backend routing) */
  resourceKind: SaveKind
  /** Initial saved state from the server/library */
  initialSaved?: boolean
  /** Optional extra metadata to send along with the save call */
  source?: string
  /** Called after a successful toggle */
  onChange?: (saved: boolean) => void
  /** Optional override for label text */
  labelSave?: string
  labelSaved?: string
}

/**
 * CardSaveButton
 *
 * Small optimistic-toggle button for saving or unsaving a drill,
 * expression, pack, or session into the user's Library / spaced review.
 *
 * It calls a web proxy:
 *   POST /api/library/save
 * with JSON: { resourceId, resourceKind, action: 'toggle', source }
 *
 * Implement the matching API route in your app so it forwards to
 * the appropriate Polaris Core endpoint for favorites / spaced review.
 */
export default function CardSaveButton({
  resourceId,
  resourceKind,
  initialSaved = false,
  source,
  onChange,
  labelSave = 'Save',
  labelSaved = 'Saved',
  disabled,
  className = '',
  ...buttonProps
}: CardSaveButtonProps) {
  const [saved, setSaved] = React.useState(initialSaved)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    setError(null)

    const next = !saved
    setSaved(next)

    try {
      const res = await fetch('/api/library/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          resourceKind,
          action: 'toggle',
          source,
          nextState: next,
        }),
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await safeJson(res)
        const msg =
          (data && typeof (data as any).error === 'string' && (data as any).error) ||
          `Request failed: ${res.status}`
        throw new Error(msg)
      }

      onChange?.(next)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setSaved(!next) // revert
    } finally {
      setBusy(false)
    }
  }

  const label = saved ? labelSaved : labelSave

  return (
    <div className="flex flex-col items-end gap-1 text-[11px]">
      <button
        type="button"
        aria-label={label}
        aria-pressed={saved}
        onClick={handleClick}
        disabled={busy || disabled}
        className={[
          'inline-flex items-center gap-1 rounded-2xl border px-2.5 py-1 text-[11px] font-medium transition',
          saved
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200'
            : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
          busy ? 'opacity-70 cursor-wait' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...buttonProps}
      >
        {saved ? (
          <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span>{label}</span>
      </button>
      {error && (
        <span className="text-[10px] text-red-500 dark:text-red-300">
          Could not save. Try again.
        </span>
      )}
    </div>
  )
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
