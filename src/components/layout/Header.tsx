// src/components/layout/Header.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const siteName = 'Polaris Coach'

const linksMarketing = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/help-center', label: 'Help' },
  { href: '/path', label: 'Path' },
]

const currencyCountryNames = [
  'United States',
  'Canada',
  'China',
  'India',
  'South Korea',
  'Vietnam',
  'Thailand',
  'Philippines',
  'Indonesia',
  'Japan',
  'Brazil',
  'Mexico',
  'Turkey',
  'Colombia',
  'Argentina',
  'Peru',
  'Chile',
  'Saudi Arabia',
  'United Arab Emirates',
  'Qatar',
  'Kuwait',
  'Egypt',
  'Pakistan',
  'Bangladesh',
  'Nepal',
  'Sri Lanka',
  'Myanmar',
  'Kazakhstan',
  'Ukraine',
  'Morocco',
  'Algeria',
  'Ethiopia',
  'Other',
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
  const [contactOpen, setContactOpen] = useState(false)
  const [contactEmail, setContactEmail] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactCountry, setContactCountry] = useState('')
  const [contactMessage, setContactMessage] = useState('')

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

  const countries = useMemo(() => currencyCountryNames, [])

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const subject = encodeURIComponent('Contact request from Polaris Coach')
    const body = encodeURIComponent(
      `Name: ${contactName || 'N/A'}\nEmail: ${contactEmail}\nPhone: ${
        contactPhone || 'N/A'
      }\nCountry: ${contactCountry || 'N/A'}\n\nHow can we help?\n${contactMessage}`,
    )
    window.location.href = `mailto:polaris@chizsalee.com?subject=${subject}&body=${body}`
    setContactOpen(false)
  }

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
          <Link
            href="/login"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-400 dark:border-white/30 dark:text-white"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-white dark:text-white dark:hover:bg-white/10"
          >
            Contact
          </button>
          <Link
            href="/signup"
            className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-[#001C29]"
          >
            Sign up
          </Link>
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
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-900 hover:border-slate-400 dark:border-white/30 dark:text-white"
            >
              Log in
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setContactOpen(true)
              }}
              className="rounded-full border border-slate-900 px-4 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-white dark:text-white dark:hover:bg-white/10"
            >
              Contact
            </button>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-[#001C29]"
            >
              Sign up
            </Link>
          </nav>
        </div>
      )}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#00151F]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Talk to Polaris Coach
              </h2>
              <button
                type="button"
                aria-label="Close contact form"
                onClick={() => setContactOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleContactSubmit}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-white/20 dark:bg-transparent dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-white/20 dark:bg-transparent dark:text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Phone number (optional)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-white/20 dark:bg-transparent dark:text-white"
                    placeholder="(201) 555-0123"
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                <p className="font-semibold text-slate-900 dark:text-white">Review details</p>
                <dl className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      Name
                    </dt>
                    <dd className="text-right font-medium text-slate-900 dark:text-white">
                      {contactName || 'Not provided'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      Email
                    </dt>
                    <dd className="text-right font-medium text-slate-900 dark:text-white">
                      {contactEmail || 'Not provided'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      Phone
                    </dt>
                    <dd className="text-right font-medium text-slate-900 dark:text-white">
                      {contactPhone || 'Not provided'}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Country
                </label>
                <select
                  value={contactCountry}
                  onChange={(e) => setContactCountry(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-white/20 dark:bg-[#0b2030] dark:text-white dark:[color-scheme:dark] dark:[&_option]:bg-[#0b2030] dark:[&_option]:text-white"
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  How can we help?
                </label>
                <textarea
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-white/20 dark:bg-transparent dark:text-white"
                  placeholder="Tell us a bit about your needs…"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-[#001C29]"
              >
                Talk to Polaris Coach
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
