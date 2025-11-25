// src/components/marketing/HowItHelps.tsx
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Clock3, BookOpen, Users2, Sparkles, LineChart } from 'lucide-react'

export default function HowItHelps() {
  return (
    <section className="bg-white py-16 md:py-20 dark:bg-[#001C29]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 md:flex-row md:items-start">
        <div className="max-w-xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-base-foreground ring-1 ring-accent/30">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            How Polaris Coach helps
          </p>
          <h2 className="text-2xl font-bold leading-tight text-base-foreground md:text-3xl">
            Practice in short loops, keep better language, and see clear weekly progress.
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Polaris Coach pairs you with a profession specific AI coach for IELTS, MRCP, job
            interviews, leadership, technical talks, and more. You work in simple ten to fifteen
            minute sessions with clear questions and calm feedback.
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Every session ends with upgraded expressions you can save, plus a weekly recap that
            shows what improved and what to practice next. You do not have to design prompts or
            remember what to ask each time you come back.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-90"
          >
            Learn how sessions work
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <Card
            icon={<Clock3 className="h-4 w-4 text-accent" />}
            title="Short, focused drills"
            body="Run ten to fifteen minute speaking drills that fit between rounds, classes, or meetings, so practice actually happens."
          />
          <Card
            icon={<BookOpen className="h-4 w-4 text-accent" />}
            title="Expressions saved for you"
            body="After each session, Polaris builds an Expressions Pack with upgraded phrases, collocations, and gentle pronunciation tips."
          />
          <Card
            icon={<Users2 className="h-4 w-4 text-accent" />}
            title="Coaches for real paths"
            body="Ten coaches cover exams, clinical work, finance, business, technical roles, and personal growth, so your practice feels close to real life."
          />
          <Card
            icon={<LineChart className="h-4 w-4 text-accent" />}
            title="Weekly recap and next steps"
            body="A weekly recap reminds you what you practiced, what improved, and which drills or expressions to focus on next."
          />
        </div>
      </div>
    </section>
  )
}

function Card({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-white p-5 text-sm text-slate-700 shadow-card dark:bg-[#03121A] dark:text-slate-100">
      <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-1 text-xs font-semibold text-base-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <p>{body}</p>
    </div>
  )
}
