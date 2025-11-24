// src/components/marketing/WhoIsItFor.tsx

import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import {
  GraduationCap,
  Briefcase,
  Stethoscope,
  Activity,
  Cpu,
  Sparkles,
} from 'lucide-react'

export default function WhoIsItFor() {
  return (
    <section className="bg-white py-16 md:py-20 dark:bg-[#001C29]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-base-foreground ring-1 ring-accent/30">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Who Polaris Coach is for
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-base-foreground md:text-3xl">
            Ten coaches, each focused on a real step in your career or studies.
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            Choose the coach that matches your next milestone. Each one comes with speaking drills,
            realistic scenarios, question sets, expression packs, and reflection prompts tuned to
            that domain.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CoachCard
            icon={<GraduationCap className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/chase-krashen/avatar-256.webp"
            name="Chase Krashen"
            role="Academic English and exam strategy"
            body="Helps senior high, gap year, and early university students turn class content into clear spoken and written answers."
            tools="Exam style speaking drills, study reflection prompts, question banks, and expression packs for essays and presentations."
          />
          <CoachCard
            icon={<GraduationCap className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/claire-swales/avatar-256.webp"
            name="Dr. Claire Swales"
            role="Grad admissions and research communication"
            body="Supports applicants who need confident statements of purpose, research pitches, and viva style answers."
            tools="Motivation and SOP drills, mock interview questions, research summary practice, and feedback on tone and structure."
          />
          <CoachCard
            icon={<Briefcase className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/carter-goleman/avatar-256.webp"
            name="Carter Goleman"
            role="Job interviews and career stories"
            body="Ideal for people preparing behavioral, case, and panel interviews or regular check ins with managers."
            tools="Mock interview drills, STAR story builders, salary and negotiation scenarios, and reusable phrases for confident answers."
          />
          <CoachCard
            icon={<GraduationCap className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/chelsea-lightbown/avatar-256.webp"
            name="Chelsea Lightbown"
            role="IELTS, TOEFL, and speaking confidence"
            body="For learners who want higher speaking scores and more natural conversation in study and travel."
            tools="Part 1, 2, and 3 card practice, feedback against band style rubrics, vocabulary packs, and pronunciation tips."
          />
          <CoachCard
            icon={<Stethoscope className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/clark-atul/avatar-256.webp"
            name="Dr. Clark Atul"
            role="Physician exams and ward rounds"
            body="Supports doctors practicing cases, handovers, escalation language, and calm explanations to patients and families."
            tools="OSCE style cases, handoff and escalation scripts, safety focused checklists, and debrief reflections after tricky scenarios."
          />
          <CoachCard
            icon={<Stethoscope className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/crystal-benner/avatar-256.webp"
            name="Dr. Crystal Benner"
            role="Nursing communication and exams"
            body="Helps nursing students and registered nurses with bedside talk, health teaching, and practical exam stations."
            tools="Bedside roleplays, teaching scripts, difficult conversation prompts, and expression packs for calm, kind language."
          />
          <CoachCard
            icon={<Activity className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/christopher-buffett/avatar-256.webp"
            name="Christopher Buffett"
            role="Finance English and client updates"
            body="For analysts and accountants who need to explain numbers, risks, and recommendations in simple language."
            tools="Earnings call style drills, client briefing templates, chart explanations, and vocabulary packs for markets and balance sheets."
          />
          <CoachCard
            icon={<Briefcase className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/colton-covey/avatar-256.webp"
            name="Colton Covey"
            role="Business English and leadership"
            body="Great for managers, sales leaders, and founders who run standups, pitch products, and align teams."
            tools="Standup and update drills, sales call roleplays, feedback conversations, and phrase banks for clear decisions."
          />
          <CoachCard
            icon={<Cpu className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/cody-turing/avatar-256.webp"
            name="Cody Turing"
            role="Technical briefings and certifications"
            body="Supports developers, cloud engineers, and security teams in explaining systems and incidents without heavy jargon."
            tools="Architecture walkthrough drills, incident and postmortem practice, certification question sets, and concise summary templates."
          />
          <CoachCard
            icon={<Sparkles className="h-4 w-4 text-accent" />}
            avatar="/coach-assets/chloe-sinek/avatar-256.webp"
            name="Chloe Sinek"
            role="Personal development and vision"
            body="For creators and early leaders who are shaping a message, values, and story they can share consistently."
            tools="Vision and values prompts, storytelling drills, content planning reflections, and language packs for talks and posts."
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-200">
          <p>
            Start with a one minute quiz. Polaris suggests a best fit coach and plan while keeping
            the full catalog open so you can explore all ten.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-2xl border border-accent px-4 py-2 text-sm font-semibold text-primary hover:bg-surface"
          >
            Take the quiz
          </Link>
        </div>
      </div>
    </section>
  )
}

function CoachCard({
  icon,
  avatar,
  name,
  role,
  body,
  tools,
}: {
  icon: ReactNode
  avatar: string
  name: string
  role: string
  body: string
  tools: string
}) {
  return (
    <article className="rounded-2xl border border-accent/20 bg-white p-5 text-sm text-slate-700 shadow-card dark:bg-surface dark:text-slate-100">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white bg-surface">
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-base-foreground">{name}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-300">{role}</p>
          </div>
        </div>
      </div>

      <p>{body}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
        Practice with: {tools}
      </p>
    </article>
  )
}
