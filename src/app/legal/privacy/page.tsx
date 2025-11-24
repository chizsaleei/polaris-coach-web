// src/app/legal/privacy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy • Polaris Coach',
  description:
    'Learn how Polaris Coach collects, uses, and protects your data, including sessions, transcripts, Expressions Packs, and billing information.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 pb-16 pt-10 text-slate-800 dark:text-slate-100">
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          This Privacy Policy explains how Polaris Coach collects, uses, and protects your
          information when you use the app, including your practice sessions, transcripts, and
          billing details.
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Last updated: 15 November 2025
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Who we are</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Polaris Coach is a practice and coaching application that pairs you with
          profession-specific AI coaches. The web app uses Supabase for authentication, database,
          and storage, and integrates with model providers such as OpenAI, as well as payment
          processors like PayPal and PayMongo.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          2. Information we collect
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We collect the minimum information needed to run the product and improve your practice
          experience:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <span className="font-semibold">Account information.</span> Name, email address,
            profession, goals, country/region, and your selected coach and tier.
          </li>
          <li>
            <span className="font-semibold">Practice data.</span> Sessions, attempts, transcripts,
            recordings (if you opt in to audio features), scores, Expressions Packs, and derived
            metrics such as words per minute or rubric scores.
          </li>
          <li>
            <span className="font-semibold">Technical and usage data.</span> Device information,
            approximate region, IP address, browser user agent, and in-product events (for example
            onboarding completed, practice submitted, drill opened) used for analytics and safety.
          </li>
          <li>
            <span className="font-semibold">Billing information.</span> We do not store full card
            numbers. Payments are processed by providers such as PayPal and PayMongo. We receive
            and store payment metadata (plan, status, provider reference) to manage entitlements
            and an auditable ledger.
          </li>
          <li>
            <span className="font-semibold">Support and feedback.</span> Messages you send to
            support, in-app feedback, and moderation reports related to safety or misuse.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          3. How we use your information
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We use your information to provide and improve Polaris Coach:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Authenticate you, protect your account, and enforce rate limits and safety rules.</li>
          <li>
            Match you with appropriate coaches, set difficulty, and generate 7-day plans and
            recommended drills.
          </li>
          <li>
            Run practice sessions, generate feedback and Expressions Packs, and build weekly recaps
            showing your progress.
          </li>
          <li>
            Manage billing, entitlements, and receipts, including upgrades, downgrades, and
            cancellations.
          </li>
          <li>
            Monitor quality, reliability, and safety (for example error rates, abuse patterns, and
            aggregate performance).
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          4. Sharing and third parties
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We do not sell your personal data. We share limited information with the following
          categories of providers to run the service:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <span className="font-semibold">Infrastructure.</span> Supabase hosts authentication,
            database rows, and storage objects (for example audio files and exports).
          </li>
          <li>
            <span className="font-semibold">Model providers.</span> Text and audio snippets are sent
            to model providers such as OpenAI to generate feedback, transcripts, and TTS output.
            We do not intentionally send raw payment card data to model providers.
          </li>
          <li>
            <span className="font-semibold">Payments.</span> PayPal and PayMongo process payments.
            We receive provider event payloads (such as payment success, refund, or subscription
            status changes) to update entitlements and a payment ledger.
          </li>
          <li>
            <span className="font-semibold">Analytics and monitoring.</span> First-party analytics
            built on Supabase events, plus optional error and performance monitoring providers, are
            used to understand product usage and keep the app reliable.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Where required, we use data processing agreements and appropriate safeguards for
          international transfers.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          5. Retention, export, and deletion
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Polaris Coach keeps records only for as long as they are needed for your practice
          history, safety, or legal obligations.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            You can{' '}
            <Link href="/account/export" className="font-semibold underline">
              export your data
            </Link>{' '}
            to a machine-readable JSON archive.
          </li>
          <li>
            You can request account deletion from the{' '}
            <Link href="/account/delete" className="font-semibold underline">
              account delete
            </Link>{' '}
            page. Deletion removes drills, attempts, Expressions Packs, queued practice items, and
            associated analytics.
          </li>
          <li>
            Some minimal records, such as payment events or audit logs, may be retained for a
            limited period where required by law, accounting, or abuse prevention.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          6. Safety and sensitive domains
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Polaris Coach includes medical and finance-focused drills, but the app is for educational
          practice only. It is not a substitute for licensed medical, nursing, or financial advice.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            Medical and finance flows display fixed educational disclaimers and are not intended for
            urgent care or real transactions.
          </li>
          <li>
            Unsafe or abusive content may be suppressed from shared catalogs and flagged for
            internal review.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          7. Your choices and rights
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Depending on your location, you may have rights to access, correct, export, or delete
          your data, and to object to certain processing.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Update profile details (for example name, profession, goals) from your Account page.</li>
          <li>Export a copy of your practice history and Expressions Packs.</li>
          <li>Request deletion of your account and data.</li>
          <li>
            Contact us if you have questions about how we use your data or if you need help
            exercising a right.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">8. Contact</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          For privacy questions or requests, email{' '}
          <a
            href="mailto:polaris@chizsaleei.com"
            className="font-semibold text-slate-900 underline dark:text-slate-100"
          >
            polaris@chizsaleei.com
          </a>
          . Please include the email address associated with your Polaris Coach account so we can
          verify ownership.
        </p>
      </section>
    </main>
  )
}
