// src/app/(marketing)/about/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { HeartHandshake, Microscope, Route } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Polaris Coach',
  description:
    'Polaris Coach helps professionals practice real conversations with AI coaches tuned to their field.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020f1c] via-[#020a12] to-[#010509] text-slate-50">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-14 pt-16 md:px-8 md:pt-20">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            About Polaris
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Built for people who use English when it really matters
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
            Polaris Coach is designed for doctors, managers, researchers, and students who speak in
            high stakes situations and want a safe space to practice, refine, and review.
          </p>
        </header>

        {/* Values */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow-sm shadow-slate-900/60">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-50">
              Real life conversations first
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              Every drill starts from situations you face at work or in exams, not from random
              textbook dialogs.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow-sm shadow-slate-900/60">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
              <Microscope className="h-4 w-4" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-50">
              Clear, kind feedback
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              You get specific wins and fixes, plus better example sentences so you can hear and see
              what to change.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow-sm shadow-slate-900/60">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
              <Route className="h-4 w-4" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-50">
              Small steps, steady progress
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              Short 10-15 minute sessions, weekly recaps, and a growing expressions library keep you
              moving without burning out.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="border-t border-slate-800 bg-[#020c16]">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-14 md:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Why we built Polaris Coach
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
                Many of our learners are already experts in their field, but feel held back when they
                need to explain, persuade, or reassure in English. They do not need more theory. They
                need safe practice, honest feedback, and a way to keep track of better phrases over
                time.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 md:text-base">
                Polaris Coach combines short speaking drills, simple rubrics, and an expressions
                library so you can speak with more clarity and calm in the moments that matter.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 p-4 text-xs text-slate-200 shadow-sm shadow-slate-900/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                Who it is for
              </p>
              <ul className="mt-3 space-y-2">
                <li>Doctors and nurses who explain plans to patients and families</li>
                <li>Managers who lead meetings, reviews, or negotiations in English</li>
                <li>Students preparing for IELTS, OET, or professional exams</li>
                <li>Researchers and professionals presenting work to global teams</li>
              </ul>
              <p className="mt-3 text-xs text-slate-300">
                If you often think &ldquo;I know what to say, but not how to say it clearly&rdquo;,
                Polaris Coach is built for you.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <p>
              Start with a free path quiz, then choose a plan if you want longer sessions and more
              tools.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/path"
                className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-md shadow-amber-500/40 transition hover:bg-amber-300"
              >
                Learn how the quiz works
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-slate-600 bg-slate-900/40 px-4 py-2 text-xs font-semibold text-slate-50 transition hover:border-slate-300 hover:bg-slate-900/70"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
