// src/components/marketing/Hero.tsx
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Sparkles, ArrowRight, Clock3, Users2, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-900/5 bg-[#F3F7FA] text-slate-900 dark:border-slate-900/40 dark:bg-[radial-gradient(circle_at_top,_#024b73,_#00121B)] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-70 dark:bg-[radial-gradient(circle_at_top,_#0EA5E9_0,_transparent_55%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-4 py-16 md:flex-row md:items-center md:py-20">
        <div className="w-full max-w-xl space-y-6">
          <Pill>Guided English practice for real careers</Pill>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl">
            Discover your path with <span className="text-accent">Polaris</span>
          </h1>

          <p className="text-base text-slate-700 dark:text-slate-200">
            Take a short quiz, meet an AI coach for your field, and practice in
            focused ten to fifteen minute sessions. Polaris remembers your
            goals and coach so you are not starting from a blank chat window
            every time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" />
              Find your path quiz
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-white/80 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface dark:bg-surface dark:text-slate-50"
            >
              Start free, upgrade anytime
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <li className="flex items-start gap-2">
              <Users2 className="mt-0.5 h-4 w-4 text-accent" />
              <span>
                <span className="font-semibold">Coaches for real roles.</span>{" "}
                Doctors, nurses, analysts, engineers, leaders, and creators get
                a coach who speaks their world.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 text-accent" />
              <span>
                <span className="font-semibold">
                  Short drills that fit your day.
                </span>{" "}
                Practice between rounds, classes, or calls without needing a
                full hour lesson.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 text-accent" />
              <span>
                <span className="font-semibold">
                  Expressions you can reuse.
                </span>{" "}
                Polaris collects better phrases and corrections so you can
                review them any time.
              </span>
            </li>
          </ul>

          <p className="pt-2 text-xs text-slate-500 dark:text-slate-300">
            Instead of leaving you to design your own prompts, Polaris starts
            with your path, your coach, and a weekly plan so you always know
            what to practice next.
          </p>
        </div>

        {/* How a session feels card */}
        <aside className="w-full max-w-md rounded-3xl border border-border bg-surface px-6 py-6 text-slate-800 shadow-card backdrop-blur-sm md:px-7 md:py-7 dark:border-surface dark:bg-base dark:text-slate-100">
          <div className="mb-5 overflow-hidden rounded-2xl bg-base/90">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/coach-assets/chelsea-lightbown/hero-1600x900.webp"
                alt="A friendly coach inside Polaris"
                fill
                className="object-contain object-top"
                sizes="(min-width: 1024px) 320px, 100vw"
              />
            </div>
          </div>

          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            How a session feels
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-100">
            In each session you answer one clear question. Your coach listens
            and sends you three wins, two simple fixes, and one small next step
            you can try right away.
          </p>

          <dl className="mt-4 space-y-3 text-xs text-slate-700 dark:text-slate-100">
            <InfoRow
              label="You only focus on speaking"
              value="Tap Practice Now and your coach brings the activity. You just speak or type."
            />
            <InfoRow
              label="Practice real situations"
              value="Cases feel like exams, handovers, interviews, and team updates you actually give."
            />
            <InfoRow
              label="Your phrases stay with you"
              value="Useful lines and corrections are saved so you can review and reuse them later."
            />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-base-foreground ring-1 ring-accent/30">
      <Sparkles className="h-3.5 w-3.5 text-accent" />
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 h-3 w-3 rounded-full bg-accent/30 dark:bg-accent/60" />
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {label}
        </dt>
        <dd className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-100">
          {value}
        </dd>
      </div>
    </div>
  );
}
