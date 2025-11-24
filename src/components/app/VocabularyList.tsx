// src/components/app/VocabularyList.tsx
import { BookOpen, Sparkles } from 'lucide-react'

export interface VocabularyItem {
  id: string
  term: string
  meaning: string
  example?: string
  simpleSynonym?: string
  topic?: string
  difficulty?: number | null // 1–5 band
  pronunciation?: string
  tags?: string[]
}

export interface VocabularyListProps {
  items: VocabularyItem[]
  heading?: string
  description?: string
  variant?: 'basic' | 'full' // Free = "basic", Pro/VIP = "full"
  emptyMessage?: string
}

/**
 * VocabularyList
 *
 * Renders vocabulary pulled from sessions or Expressions Packs.
 * For Free tiers, use variant="basic" to show highlights only.
 * For Pro and VIP, use variant="full" to show richer details.
 */
export default function VocabularyList({
  items,
  heading = 'Vocabulary from your sessions',
  description = 'Key words and phrases surfaced from recent drills. Use these for spaced review and future prompts.',
  variant = 'full',
  emptyMessage = 'No vocabulary yet. Finish a drill or Expressions Pack to see items here.',
}: VocabularyListProps) {
  const showFull = variant === 'full'

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-sm text-slate-800 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A] dark:text-slate-100">
      <header className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Vocabulary
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {heading}
          </h2>
          {description && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-800 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.term}
                    {item.pronunciation && (
                      <span className="ml-1 text-[11px] text-slate-500 dark:text-slate-300">
                        /{item.pronunciation}/
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-700 dark:text-slate-200">
                    {item.meaning}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500 dark:text-slate-400">
                  {item.topic && <p className="truncate max-w-[7rem]">{item.topic}</p>}
                  {item.difficulty != null && (
                    <p>Level {item.difficulty}/5</p>
                  )}
                </div>
              </div>

              {showFull && (item.simpleSynonym || item.example) && (
                <div className="mt-1.5 space-y-0.5">
                  {item.simpleSynonym && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-500 dark:text-slate-300">
                        Simple synonym:
                      </span>{' '}
                      {item.simpleSynonym}
                    </p>
                  )}
                  {item.example && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-500 dark:text-slate-300">
                        Example:
                      </span>{' '}
                      <span className="italic">{item.example}</span>
                    </p>
                  )}
                </div>
              )}

              {showFull && item.tags && item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 4).map((tag) => (
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
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
