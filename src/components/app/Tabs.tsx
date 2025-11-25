// src/components/app/Tabs.tsx
'use client'

import { useCallback, useEffect, useId, useState } from 'react'

export interface TabItem {
  id: string
  label: string
  badge?: string | number
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (id: string) => void
  className?: string
}

/**
 * Tabs
 *
 * Lightweight, accessible tab strip used across app pages.
 * It only renders the tab buttons; content panels are handled
 * by the parent via `value` and `onChange`.
 */
export default function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  className = '',
}: TabsProps) {
  const internalId = useId()
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue || items[0]?.id,
  )

  const activeId = value ?? internalValue ?? items[0]?.id

  useEffect(() => {
    if (!activeId && items[0]) {
      setInternalValue(items[0].id)
    }
  }, [activeId, items])

  const setActive = useCallback(
    (id: string) => {
      if (value === undefined) {
        setInternalValue(id)
      }
      onChange?.(id)
    },
    [onChange, value],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabledItems = items.filter((item) => !item.disabled)
    if (!enabledItems.length) return

    let nextId: string | null = null

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = items.slice(index + 1).find((item) => !item.disabled) ?? enabledItems[0]
      nextId = next.id
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const prev =
        [...items.slice(0, index)].reverse().find((item) => !item.disabled) ??
        enabledItems[enabledItems.length - 1]
      nextId = prev.id
    }

    if (nextId) {
      setActive(nextId)
      const btn = document.getElementById(tabButtonId(internalId, nextId))
      btn?.focus()
    }
  }

  return (
    <div
      className={[
        'inline-flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50/70 p-1.5 dark:bg-slate-900/40',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="tablist"
      aria-orientation="horizontal"
    >
      {items.map((item, index) => {
        const isActive = item.id === activeId
        const baseClasses =
          'inline-flex items-center gap-1 rounded-2xl px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60'
        const activeClasses = 'bg-slate-900 text-white dark:bg-sky-600'
        const inactiveClasses =
          'border border-slate-200 bg-white text-slate-700 hover:border-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

        return (
          <button
            key={item.id}
            id={tabButtonId(internalId, item.id)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={tabPanelId(internalId, item.id)}
            disabled={item.disabled}
            onClick={() => !item.disabled && setActive(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={[
              baseClasses,
              isActive ? activeClasses : inactiveClasses,
              item.disabled ? 'opacity-60 cursor-not-allowed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span>{item.label}</span>
            {item.badge != null && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-100">
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Helpers to build IDs; the parent can use these for aria-controls if desired.
export function tabButtonId(prefix: string, id: string) {
  return `${prefix}-tab-${id}`
}

export function tabPanelId(prefix: string, id: string) {
  return `${prefix}-panel-${id}`
}
