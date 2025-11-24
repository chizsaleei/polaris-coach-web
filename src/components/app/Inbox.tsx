// src/components/app/Inbox.tsx
import Link from 'next/link'
import { Inbox as InboxIcon, CalendarDays, Target, Sparkles, Wallet } from 'lucide-react'

export type InboxKind = 'recap' | 'drill' | 'pack' | 'payment' | 'system'

export interface InboxItem {
  id: string
  title: string
  body: string
  kind?: InboxKind
  date?: string | null
  href?: string
  unread?: boolean
}

export interface InboxProps {
  items: InboxItem[]
  heading?: string
  description?: string
  emptyMessage?: string
}

/**
 * Inbox
 *
 * Simple list of recent updates: weekly recaps, new drills,
 * Expressions Packs, and billing or system notices.
 * Data should be fetched server-side and passed in as props.
 */
export default function Inbox({
  items,
  heading = 'Inbox',
  description = 'Recaps, new drills, and important account updates in one place.',
  emptyMessage = 'Nothing new yet. Finish a drill or check back after your next session.',
}: InboxProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <InboxIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Updates
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
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => {
            const content = (
              <div
                className={[
                  'flex items-start gap-3 rounded-2xl border px-3 py-3 text-xs transition',
                  item.unread
                    ? 'border-slate-200 bg-slate-50 hover:border-sky-200 dark:border-slate-700 dark:bg-slate-900/40'
                    : 'border-slate-200 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
                  {iconForKind(item.kind)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    {item.unread && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {item.body}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-wide">
                      {kindLabel(item.kind)}
                    </span>
                    {item.date && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span>{formatDate(item.date)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link href={item.href} className="block">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function iconForKind(kind?: InboxKind) {
  if (kind === 'recap') return <CalendarDays className="h-3.5 w-3.5" />
  if (kind === 'drill') return <Target className="h-3.5 w-3.5" />
  if (kind === 'pack') return <Sparkles className="h-3.5 w-3.5" />
  if (kind === 'payment') return <Wallet className="h-3.5 w-3.5" />
  return <InboxIcon className="h-3.5 w-3.5" />
}

function kindLabel(kind?: InboxKind) {
  switch (kind) {
    case 'recap':
      return 'Weekly recap'
    case 'drill':
      return 'Drill'
    case 'pack':
      return 'Expressions Pack'
    case 'payment':
      return 'Billing'
    case 'system':
    default:
      return 'System'
  }
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}
