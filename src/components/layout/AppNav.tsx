'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type NavItem = {
  label: string
  href: string
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Explore', href: '/explore' },
  { label: 'Practice Now', href: '/chat' },
  { label: 'Live', href: '/chat/live', badge: 'beta' },
  { label: 'Onboarding', href: '/onboarding' },
  { label: 'Search', href: '/search' },
  { label: 'Account', href: '/account' },
]

export default function AppNav() {
  const pathname = usePathname()
  const currentPath = useMemo(() => pathname?.split('?')[0] || '/', [pathname])

  const base =
    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]'
  const active =
    'bg-[#DBF7FF] text-[#042838] shadow-sm dark:bg-[#042838] dark:text-white'
  const idle =
    'text-[#042838] hover:bg-[#DBF7FF]/80 dark:text-white dark:hover:bg-[#042838]'

  return (
    <nav
      aria-label="App navigation"
      className="sticky top-0 z-30 -mx-4 mb-4 border-b border-black/5 bg-white/80 px-4 py-2 backdrop-blur dark:border-white/10 dark:bg-[#001C29]/70"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const isAccountLink = item.href === '/account'
          const isActive =
            currentPath === item.href || currentPath.startsWith(`${item.href}/`)
          const classes = [base, isActive ? active : idle, isAccountLink ? 'ml-auto' : '']
            .filter(Boolean)
            .join(' ')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classes}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-[#042838] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-white/20">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
