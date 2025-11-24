// src/app/(marketing)/help-center/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpenCheck, CreditCard, ShieldCheck, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center | Polaris Coach',
  description:
    'Find quick answers about getting started, plans and billing, and privacy on Polaris Coach.',
}

type HelpCard = {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

const helpCards: HelpCard[] = [
  {
    title: 'Getting started',
    description: 'How to take the path quiz, pick a coach, and run your first drills.',
    icon: <Sparkles className="h-4 w-4" />,
    href: '/help-center#getting-started',
  },
  {
    title: 'Plans and billing',
    description: 'What is included in Free, Pro, and VIP, plus how to change or cancel.',
    icon: <CreditCard className="h-4 w-4" />,
    href: '/help-center#plans',
  },
  {
    title: 'Practice and progress',
    description: 'How expressions are saved, how spaced review works, and weekly recaps.',
    icon: <BookOpenCheck className="h-4 w-4" />,
    href: '/help-center#practice',
  },
  {
    title: 'Privacy and safety',
    description: 'How we treat your recordings, notes, and sensitive topics.',
    icon: <ShieldCheck className="h-4 w-4" />,
    href: '/help-center#privacy',
  },
]

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020f1d] via-[#020a13] to-[#010508] text-slate-50">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-14 pt-16 md:px-8 md:pt-20">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Help Center
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Answers for busy learners
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
            Browse short guides on how to start, how billing works, and how we protect your data. No
            long manuals, just clear next steps.
          </p>
        </header>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {helpCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl bg-slate-900/70 p-4 text-left shadow-sm shadow-slate-900/60 transition hover:bg-slate-900"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                {card.icon}
              </div>
              <h2 className="mt-3 text-sm font-semibold text-slate-50">{card.title}</h2>
              <p className="mt-2 text-xs text-slate-300">{card.description}</p>
              <span className="mt-3 inline-flex text-xs font-semibold text-sky-300 group-hover:text-sky-200">
                Open guide
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Simple anchor sections so links have a destination */}
      <section
        id="getting-started"
        className="border-t border-slate-800 bg-[#020c16] px-4 py-10 text-xs text-slate-200 md:px-8"
      >
        <div className="mx-auto max-w-5xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">Getting started</h2>
          <p>
            1. Take the path quiz so we understand your role, goals, and schedule. 2. Pick the coach
            that feels right for your cases. 3. Try one short drill and review the feedback and
            expressions that are saved for you.
          </p>
        </div>
      </section>

      <section
        id="plans"
        className="border-t border-slate-800 bg-[#020913] px-4 py-10 text-xs text-slate-200 md:px-8"
      >
        <div className="mx-auto max-w-5xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">Plans and billing</h2>
          <p>
            Free lets you try one coach with a short daily session. Pro unlocks longer time with one
            coach and more tools. VIP lets you move across all coaches and tools as your work and
            studies change. You can change or cancel your plan from the billing page at any time.
          </p>
          <p>
            For details on prices in your currency, visit the{' '}
            <Link href="/pricing" className="text-sky-300 underline underline-offset-2">
              pricing page
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        id="practice"
        className="border-t border-slate-800 bg-[#020c16] px-4 py-10 text-xs text-slate-200 md:px-8"
      >
        <div className="mx-auto max-w-5xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">Practice and progress</h2>
          <p>
            After each drill, helpful expressions are saved to your library so you can review and
            reuse them. Spaced review gently reminds you of items over time so they move into your
            active speaking.
          </p>
          <p>
            Weekly recaps highlight what you completed, where you improved, and one small focus for
            the next week.
          </p>
        </div>
      </section>

      <section
        id="privacy"
        className="border-t border-slate-800 bg-[#020913] px-4 py-10 text-xs text-slate-200 md:px-8"
      >
        <div className="mx-auto max-w-5xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">Privacy and safety</h2>
          <p>
            Your practice sessions are private by default. You control what you keep, download, or
            delete from your account. We do not use your private drills as public examples.
          </p>
          <p>
            For medical and finance topics, we remind you that Polaris is an educational support
            tool, not a replacement for local laws, policies, or supervision.
          </p>
          <p>
            Full details are in our{' '}
            <Link href="/legal/privacy" className="text-sky-300 underline underline-offset-2">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/legal/terms" className="text-sky-300 underline underline-offset-2">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
