// src/components/layout/Header.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import SignOutButton from '@/components/auth/SignOutButton'

const siteName = 'Polaris Coach'

const linksMarketing = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/help-center', label: 'Help' },
  { href: '/path', label: 'Path' },
]

const linksApp = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/explore', label: 'Explore' },
  { href: '/chat', label: 'Practice' },
  { href: '/chat/live', label: 'Live' },
  { href: '/search', label: 'Search' },
]

function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  const base =
    'inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition'
  const activeCls =
    'bg-[var(--color-surface)] text-base-foreground dark:bg-[#042838] dark:text-white'
  const idleCls =
    'text-base-foreground hover:bg-[var(--color-surface)] dark:text-white dark:hover:bg-[#042838]'

  return (
    <Link
      className={`${base} ${active ? activeCls : idleCls}`}
      href={href}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const appPrefixes = [
    '/dashboard',
    '/explore',
    '/chat',
    '/onboarding',
    '/search',
    '/account',
  ]

  const isApp = appPrefixes.some((prefix) => pathname?.startsWith(prefix))
  const leftLinks = isApp ? linksApp : linksMarketing

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#001C29]/70">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={`${siteName} home`}
        >
          <Image
            src="/favicon-48.png"
            alt="Polaris Coach logo"
            width={24}
            height={24}
            priority
          />
          <span className="hidden text-base font-semibold text-base-foreground sm:inline">
            {siteName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="ml-2 hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {leftLinks.map((l) => {
            const active =
              pathname === l.href ||
              (pathname?.startsWith(l.href + '/') ?? false)

            return (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                active={Boolean(active)}
              />
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth + Controls */}
        <div className="hidden items-center gap-2 md:flex">
          <GoogleSignInButton />
          <SignOutButton />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((s) => !s)}
            className="rounded-xl p-2 hover:bg-[var(--color-surface)] dark:hover:bg-[#042838]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-black/5 bg-white p-3 dark:border-white/10 dark:bg-[#001C29] md:hidden"
        >
          <nav className="grid gap-1" aria-label="Mobile">
            {leftLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-base-foreground hover:bg-[var(--color-surface)] dark:text-white dark:hover:bg-[#042838]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <GoogleSignInButton />
              <SignOutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
