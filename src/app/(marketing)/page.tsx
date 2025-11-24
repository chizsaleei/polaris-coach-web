// src/app/(marketing)/page.tsx
// Polaris Coach – Marketing Home

import Hero from '@/components/marketing/Hero'
import HowItHelps from '@/components/marketing/HowItHelps'
import WhoIsItFor from '@/components/marketing/WhoIsItFor'
import Link from 'next/link'
import Image from 'next/image'

type CoachStripItem = {
  slug: string
  name: string
  tag: string
}

const COACH_STRIP: CoachStripItem[] = [
  {
    slug: 'chase-krashen',
    name: 'Chase Krashen',
    tag: 'Academic English and exam strategy',
  },
  {
    slug: 'claire-swales',
    name: 'Dr. Claire Swales',
    tag: 'Grad admissions and research communication',
  },
  {
    slug: 'carter-goleman',
    name: 'Carter Goleman',
    tag: 'Job interviews and career stories',
  },
  {
    slug: 'chelsea-lightbown',
    name: 'Chelsea Lightbown',
    tag: 'IELTS and TOEFL speaking practice',
  },
  {
    slug: 'clark-atul',
    name: 'Dr. Clark Atul',
    tag: 'Ward rounds and clinical exams for doctors',
  },
  {
    slug: 'crystal-benner',
    name: 'Dr. Crystal Benner',
    tag: 'Bedside talk and exams for nurses',
  },
  {
    slug: 'christopher-buffett',
    name: 'Christopher Buffett',
    tag: 'Finance reports and client updates',
  },
  {
    slug: 'colton-covey',
    name: 'Colton Covey',
    tag: 'Business English and leadership',
  },
  {
    slug: 'cody-turing',
    name: 'Cody Turing',
    tag: 'Technical briefings and certifications',
  },
  {
    slug: 'chloe-sinek',
    name: 'Chloe Sinek',
    tag: 'Vision, storytelling, and personal brand',
  },
]

export default function MarketingHome() {
  return (
    <main className="bg-background text-base-foreground">
      <Hero />
      <HowItHelps />
      <WhoIsItFor />
      <CoachStrip />
      <FinalCta />
    </main>
  )
}

function CoachStrip() {
  return (
    <section className="bg-surface py-14 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              All ten coaches in one place
            </p>
            <h2 className="mt-1 text-2xl font-bold text-base-foreground">
              Specialists for the paths people really take
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Each coach focuses on a real world job or exam and comes with ready made speaking
              drills, follow up questions, and language packs you can reuse.
            </p>
          </div>
          <Link
            href="/path"
            className="inline-flex items-center gap-2 rounded-2xl border border-accent px-4 py-2 text-xs font-semibold text-primary hover:bg-white/70"
          >
            Browse full coach profiles
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COACH_STRIP.map((coach) => (
            <article
              key={coach.slug}
              className="rounded-2xl border border-accent/25 bg-white p-4 text-sm text-slate-800 shadow-card"
            >
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl bg-surface">
                <Image
                  src={`/coach-assets/${coach.slug}/card-960x1200.webp`}
                  alt={coach.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <h3 className="text-sm font-semibold text-base-foreground">{coach.name}</h3>
              <p className="mt-1 text-xs text-slate-600">{coach.tag}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-accent/30 bg-white p-8 text-center shadow-soft dark:bg-surface">
          <h3 className="text-2xl font-bold text-base-foreground">
            Ready to hear yourself improve this week
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-700">
            Take the quiz, meet your coach, and run your first ten minute drill. Next week you will
            already have new phrases, feedback, and a clear recap waiting.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-95"
            >
              Find your path quiz
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-surface px-5 py-3 text-sm font-semibold text-primary hover:opacity-95"
            >
              Start free, then upgrade when ready
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
