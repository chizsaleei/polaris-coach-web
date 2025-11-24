// src/components/app/PronunciationHeatmap.tsx
import { Volume2 } from 'lucide-react'

export interface PronunciationStat {
  word: string
  hint?: string
  attempts: number
  accuracy: number // 0–1, where 1 = consistently correct
  lastPracticedAt?: string | null
}

export interface PronunciationHeatmapProps {
  items: PronunciationStat[]
  heading?: string
  description?: string
  emptyMessage?: string
}

/**
 * PronunciationHeatmap
 *
 * Visual summary of tricky words by accuracy and attempts.
 * Data should be computed server-side (for example from attempts)
 * and passed into this component.
 */
export default function PronunciationHeatmap({
  items,
  heading = 'Pronunciation focus',
  description = 'Words you have practiced recently, colored by accuracy. Darker means more practice; warmer means more work needed.',
  emptyMessage = 'No pronunciation stats yet. Finish a speaking drill with a mic to see patterns here.',
}: PronunciationHeatmapProps) {
  if (!items.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-xs text-slate-600 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A] dark:text-slate-300">
        <header className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Pronunciation
            </p>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {heading}
            </h2>
          </div>
        </header>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{emptyMessage}</p>
      </section>
    )
  }

  const maxAttempts = items.reduce((max, item) => Math.max(max, item.attempts), 0) || 1

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-xs text-slate-600 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A] dark:text-slate-300">
      <header className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Pronunciation
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {heading}
          </h2>
          {description && (
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      </header>

      <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => {
          const strength = item.attempts / maxAttempts
          const accuracy = clamp(item.accuracy, 0, 1)

          const bg = backgroundFor(accuracy, strength)
          const border = borderFor(accuracy)

          return (
            <div
              key={item.word}
              className={[
                'flex flex-col justify-between rounded-2xl p-3 transition',
                bg,
                border,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                  {item.word}
                </p>
                {item.hint && (
                  <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-200">
                    {item.hint}
                  </p>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-200">
                <span>
                  Accuracy:{' '}
                  <span className="font-semibold">
                    {Math.round(accuracy * 100)}%
                  </span>
                </span>
                <span>
                  Attempts:{' '}
                  <span className="font-semibold">{item.attempts}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-emerald-500/80" />
          <span>High accuracy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-400/80" />
          <span>Needs practice</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-slate-300/80" />
          <span>Few attempts so far</span>
        </div>
      </div>
    </section>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function backgroundFor(accuracy: number, strength: number) {
  // strength controls opacity; accuracy controls hue (green -> amber)
  const strong = strength > 0.66
  const mid = strength > 0.33

  if (accuracy >= 0.8) {
    return strong
      ? 'bg-emerald-500/30'
      : mid
      ? 'bg-emerald-400/20'
      : 'bg-slate-100'
  }

  if (accuracy >= 0.5) {
    return strong
      ? 'bg-amber-300/30'
      : mid
      ? 'bg-amber-200/25'
      : 'bg-slate-100'
  }

  return strong
    ? 'bg-amber-400/35'
    : mid
    ? 'bg-amber-300/25'
    : 'bg-slate-100'
}

function borderFor(accuracy: number) {
  if (accuracy >= 0.8) return 'border border-emerald-500/50'
  if (accuracy >= 0.5) return 'border border-amber-400/60'
  return 'border border-amber-500/70'
}
