// src/app/(marketing)/path/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { Compass, ListChecks, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find Your Path | Polaris Coach',
  description:
    'Take a short quiz to match with the right AI coach for your goals, schedule, and profession.',
}

export default function PathPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#031827] via-[#021421] to-[#010910] text-slate-50">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-16 md:px-8 md:pt-20">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Find Your Path
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            A 3 minute quiz to match you with the right coach
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
            Tell us what you do, where you use English, and what feels hard right now. We match you
            with a coach and a one week plan that fits your real life, not a textbook.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300"
            >
              <Compass className="h-4 w-4" />
              Start the path quiz
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/40 px-5 py-2.5 text-sm font-semibold text-slate-50 transition hover:border-slate-300 hover:bg-slate-900/70"
            >
              See plans after the quiz
            </Link>
          </div>
        </header>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/60 p-4 shadow-sm shadow-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
              Step 1
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-50">
              Share your work and study life
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              Tell us your role, typical conversations, and where you want to sound more confident.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 p-4 shadow-sm shadow-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
              Step 2
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-50">
              Pick what you want to improve first
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              Choose goals like patient talks, meetings, interviews, exams, or everyday flow.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 p-4 shadow-sm shadow-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
              Step 3
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-50">
              Get a coach and a simple weekly plan
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              We suggest 1-2 coaches, 3 short drills, a vocab review, and one reflection for the
              week.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-t border-slate-800 bg-[#020f1b]">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-14 md:px-8">
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              What the quiz gives you
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              A clear starting point, not another long to do list
            </h2>
            <p className="mt-3 text-sm text-slate-200 md:text-base">
              Your results turn into a short weekly checklist you can actually finish, even on a busy
              schedule.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-900/70 p-4">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-50">
                Best fit coach suggestions
              </h3>
              <p className="mt-2 text-xs text-slate-300">
                We highlight coaches who handle cases and conversations similar to yours, so you do
                not waste time guessing.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 p-4">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                <ListChecks className="h-3.5 w-3.5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-50">
                One week practice plan
              </h3>
              <p className="mt-2 text-xs text-slate-300">
                Short drills that fit into 10-15 minutes, plus vocab and reflection prompts to
                capture your progress.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 p-4">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-50">
                Clear next step after each drill
              </h3>
              <p className="mt-2 text-xs text-slate-300">
                Every drill ends with three wins, two fixes, and one next prompt so you always know
                what to try next.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <p>
              The quiz is free and takes about 3 minutes. You can change coaches later if your focus
              shifts.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-md shadow-amber-500/40 transition hover:bg-amber-300"
            >
              Start now
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
