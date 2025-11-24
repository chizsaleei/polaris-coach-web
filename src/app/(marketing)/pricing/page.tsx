'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Wallet, Repeat2 } from 'lucide-react'

type BillingCycle = 'monthly' | 'yearly'

type Plan = {
  key: 'free' | 'pro' | 'vip'
  name: string
  badge?: string
  priceMonthly: string
  priceYearly: string
  description: string
  ctaHref: (cycle: BillingCycle) => string
  ctaLabel: string
  bullets: string[]
}

const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    priceMonthly: '$0',
    priceYearly: '$0',
    description: 'Great for checking out Polaris drills and saving your first Practice Packs.',
    ctaHref: () => '/signup',
    ctaLabel: 'Start for free',
    bullets: [
      'One active coach',
      '10 minutes of real time talk per day',
      'One tool or feature at a time',
      'Browse the full coach catalog',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    badge: 'Most popular',
    priceMonthly: '$12.99',
    priceYearly: '$99',
    description: 'Ideal for steady weekly practice with richer feedback and vocab details.',
    ctaHref: (cycle) =>
      `/api/pay/checkout?plan=${cycle === 'monthly' ? 'pro_monthly' : 'pro_yearly'}`,
    ctaLabel: 'Choose Pro',
    bullets: [
      'One active coach',
      '30 minute sessions',
      'Any three tools or features',
      'Full vocabulary details and examples',
      'Weekly recap emails with WPM + rubric summary',
    ],
  },
  {
    key: 'vip',
    name: 'VIP',
    priceMonthly: '$29',
    priceYearly: '$199',
    description: 'For ambitious communicators who want every coach, tool, and concierge support.',
    ctaHref: (cycle) =>
      `/api/pay/checkout?plan=${cycle === 'monthly' ? 'vip_monthly' : 'vip_yearly'}`,
    ctaLabel: 'Go VIP',
    bullets: [
      'All coaches and tools',
      'Full vocabulary with filters and exports',
      'No coach switch cooldown',
      'Priority feature access and ticket responses',
      'Long form mock interviews with AI notetaker',
    ],
  },
]

type FeatureRow = {
  feature: string
  free: boolean | string
  pro: boolean | string
  vip: boolean | string
}

const COMPARISON: FeatureRow[] = [
  { feature: 'Active coaches', free: '1', pro: '1', vip: 'All' },
  { feature: 'Real time talk minutes', free: '10 per day', pro: '30 per session', vip: 'Based on plan' },
  { feature: 'Tools included', free: '1 at a time', pro: 'Any 3', vip: 'All tools' },
  { feature: 'Practice Packs', free: true, pro: true, vip: true },
  { feature: 'Vocabulary details', free: 'Basic highlights', pro: 'Full details', vip: 'Full + filters + export' },
  { feature: 'Coach switch cooldown', free: '72 hours', pro: '72 hours', vip: 'No cooldown' },
  { feature: 'Priority support', free: false, pro: false, vip: true },
]

type FAQ = { q: string; a: string }

const FAQS: FAQ[] = [
  {
    q: 'Can I change plans anytime?',
    a: 'Yes. Upgrades activate immediately and prorate through PayPal or PayMongo. Downgrades take effect at the next billing cycle.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'PayPal is available globally and PayMongo supports domestic cards, GCash, and bank transfers in the Philippines.',
  },
  {
    q: 'Will my Practice Packs disappear if I cancel?',
    a: 'No. Your saved drills, transcripts, and Practice Packs remain in your library even if you move to Free.',
  },
]

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
      <Sparkles className="h-3.5 w-3.5 text-sky-600" />
      {children}
    </span>
  )
}

function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`py-16 md:py-20 ${className}`}>{children}</section>
}

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-6 ${className}`}>{children}</div>
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const price = cycle === 'monthly' ? plan.priceMonthly : plan.priceYearly
  const billingSuffix = cycle === 'monthly' ? '/month' : '/year'

  return (
    <div
      className={`flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${
        plan.badge ? 'ring-2 ring-slate-900' : ''
      }`}
    >
      {plan.badge ? (
        <span className="mb-4 inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {plan.badge}
        </span>
      ) : null}
      <h3 className="text-2xl font-semibold text-slate-900">{plan.name}</h3>
      <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
      <div className="mt-6 flex items-end gap-1 text-slate-900">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-sm text-slate-500">{billingSuffix}</span>
      </div>
      <Link
        href={plan.ctaHref(cycle)}
        className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
          plan.key === 'free'
            ? 'border border-slate-300 text-slate-900 hover:border-slate-400'
            : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {plan.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
      <ul className="mt-6 space-y-3 text-sm text-slate-600">
        {plan.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <CheckCircle2 className="mt-1 h-4 w-4 text-slate-900" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircle2 className="mx-auto h-4 w-4 text-slate-900" aria-label="Included" />
    ) : (
      <span className="text-slate-400">—</span>
    )
  }
  return <span className="text-sm text-slate-900">{value}</span>
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  const cycleLabel = useMemo(
    () => (cycle === 'monthly' ? 'Monthly billing' : 'Yearly billing'),
    [cycle],
  )

  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-white">
      <Section className="pt-20">
        <Container className="text-center">
          <Pill>Clear plans for every practice rhythm</Pill>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Pricing for steady weekly progress
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Start free, grow with Pro, or unlock every coach and concierge support with VIP. PayPal
            globally and PayMongo locally.
          </p>
          <div className="mt-8 inline-flex rounded-2xl border border-slate-200 bg-white p-1 text-sm shadow">
            <button
              type="button"
              onClick={() => setCycle('monthly')}
              className={`rounded-xl px-4 py-2 font-semibold transition ${
                cycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle('yearly')}
              className={`rounded-xl px-4 py-2 font-semibold transition ${
                cycle === 'yearly'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly <span className="ml-1 text-xs text-slate-400">(save 36%)</span>
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">{cycleLabel}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.key} plan={plan} cycle={cycle} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Wallet className="h-5 w-5" />}
              title="Flexible billing"
              body="Switch between monthly and yearly anytime. Upgrades apply immediately with prorated charges."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Private & secure"
              body="Practice Packs, transcripts, and tickets stay in your workspace with full audit logs."
            />
            <FeatureCard
              icon={<Repeat2 className="h-5 w-5" />}
              title="Easy cancellations"
              body="Downgrade or pause with two clicks. We keep your history so you can return without friction."
            />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-3xl font-bold text-slate-900">Compare plans</h2>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-4 font-semibold">Feature</th>
                  <th className="px-4 py-4 text-center font-semibold">Free</th>
                  <th className="px-4 py-4 text-center font-semibold">Pro</th>
                  <th className="px-4 py-4 text-center font-semibold">VIP</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t border-slate-100">
                    <td className="px-4 py-4 text-slate-900">{row.feature}</td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={row.free} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={row.pro} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureValue value={row.vip} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">FAQ</h2>
            <div className="mt-6 space-y-5">
              {FAQS.map((faq, idx) => (
                <details
                  key={faq.q}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                  open={idx === 0}
                >
                  <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">
                    {faq.q}
                  </summary>
                  <p className="mt-3 text-sm text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-slate-900">Not sure where to start?</h3>
            <p className="mt-3 text-slate-600">
              Chat with us about your target role, exam, or pitch. We will help you pick a coach
              and share a sample Practice Pack.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
              >
                Practice now
              </Link>
              <Link
                href="/about"
                className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400"
              >
                See how it works
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}

function FeatureCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/10 text-slate-900">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  )
}
