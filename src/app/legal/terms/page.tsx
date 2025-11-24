// src/app/legal/terms/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service • Polaris Coach',
  description:
    'Read the terms and conditions for using Polaris Coach, including subscriptions, acceptable use, and important disclaimers for medical, finance, and exam-related practice.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 pb-16 pt-10 text-slate-800 dark:text-slate-100">
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of Polaris Coach.
          By creating an account or using the app, you agree to these Terms and to our{' '}
          <Link href="/legal/privacy" className="font-semibold underline">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Last updated: 15 November 2025
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          1. Overview
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Polaris Coach is a practice and coaching application that pairs you with profession-specific
          AI coaches. It is designed for short, focused practice loops with feedback, Expressions Packs,
          and weekly recaps. Polaris Coach is an educational support tool and does not replace certified
          study materials, official exam guidance, licensed medical care, or professional financial advice.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          2. Eligibility and accounts
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            You must be old enough to form a binding contract with the service under the laws of your
            jurisdiction, and in any case at least 13 years old (or the minimum age of digital consent
            where you live).
          </li>
          <li>
            You are responsible for maintaining the confidentiality of your account and for all activity
            that occurs under it. If you believe your account has been compromised, you should notify us
            and update your credentials.
          </li>
          <li>
            If you use an email address provided by an organization (for example a school or employer),
            you confirm that you are authorized to use that address and understand that the organization
            may have rights to manage the account.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          3. Plans, billing, and refunds
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Polaris Coach offers Free, Pro, and VIP tiers, as described on the{' '}
          <Link href="/pricing" className="font-semibold underline">
            Pricing
          </Link>{' '}
          page. Plan features and limits are enforced through entitlements managed by our backend.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <span className="font-semibold">Free tier.</span> The Free tier provides limited access
            to coaches, tools, and daily usage, and may change over time as we tune product limits.
          </li>
          <li>
            <span className="font-semibold">Paid subscriptions.</span> Pro and VIP are subscription
            plans billed by third-party providers such as PayPal and PayMongo. Unless stated
            otherwise, subscriptions renew automatically at the end of each billing period until you
            cancel.
          </li>
          <li>
            <span className="font-semibold">Payments and billing data.</span> Payment processing is
            handled by providers. We do not store full card numbers. We store payment metadata
            (for example plan, status, provider reference) to manage entitlements and maintain an
            auditable ledger.
          </li>
          <li>
            <span className="font-semibold">Managing your plan.</span> You can view or change your
            subscription from the account billing portal linked on your{' '}
            <Link href="/account" className="font-semibold underline">
              Account
            </Link>{' '}
            page. Changes typically apply at the end of the current billing period, as described in
            the provider&apos;s terms.
          </li>
          <li>
            <span className="font-semibold">Refunds.</span> Except where required by law or expressly
            stated, fees are non-refundable. Any refunds are handled in line with the policies of
            the payment provider and local consumer regulations.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          4. Use of Polaris Coach
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          You agree to use Polaris Coach in a lawful, respectful way and to follow any usage limits
          communicated in the product (such as daily minutes, active coach limits, or cooldown rules).
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            Do not use Polaris Coach for illegal activities, harassment, discrimination, or to create
            harmful or abusive content.
          </li>
          <li>
            Do not attempt to bypass rate limits, entitlements, or security features, or to access data
            belonging to other users.
          </li>
          <li>
            Do not misrepresent content generated in the app as professional advice, medical diagnosis,
            financial planning, or official exam scoring.
          </li>
          <li>
            Do not reverse engineer or scrape the service in a way that could harm system stability,
            security, or the rights of others.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          5. Your content and license
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          You retain ownership of the practice content you submit to Polaris Coach, including prompts,
          responses, recordings, and notes.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            You grant Polaris Coach a limited license to host, process, and analyze your content for
            the purpose of operating the service, generating feedback and Expressions Packs, running
            analytics, and improving product quality and safety.
          </li>
          <li>
            We may use aggregated or de-identified data (for example statistics about usage, success
            rates, or content patterns) to improve the product and maintain reliability.
          </li>
          <li>
            Content may be processed by model providers (for example OpenAI) under their terms,
            solely to provide features like chat, transcription, and TTS. We do not intentionally
            send raw payment card data to model providers.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          6. Disclaimers and limitations
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Polaris Coach is an educational practice tool. It does not provide medical care, financial
          advice, legal advice, or guarantees of exam outcomes.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            Medical, nursing, and finance drills include prominent educational disclaimers in the app.
            You must consult qualified professionals before making decisions in these domains.
          </li>
          <li>
            We work to keep the service available and accurate, but we do not promise that the app will
            be uninterrupted, error-free, or free of inaccuracies.
          </li>
          <li>
            To the fullest extent permitted by law, Polaris Coach and its operators are not liable for
            indirect, incidental, or consequential damages arising from use of the service.
          </li>
          <li>
            Where liability cannot be excluded, it is limited to the amount you paid to use Polaris Coach
            in the 12 months before the event giving rise to the claim.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          7. Termination and suspension
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            You may stop using Polaris Coach at any time. You can request export or deletion of your
            data from the{' '}
            <Link href="/account/export" className="font-semibold underline">
              data export
            </Link>{' '}
            and{' '}
            <Link href="/account/delete" className="font-semibold underline">
              account delete
            </Link>{' '}
            pages.
          </li>
          <li>
            We may suspend or terminate access if you materially breach these Terms, abuse the service,
            or create risks for other users or for the platform.
          </li>
          <li>
            We may also remove or restrict content that violates these Terms, harms others, or conflicts
            with safety, legal, or policy requirements.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          8. Changes to the service and these Terms
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We are continuously improving Polaris Coach. Features, limits, and pricing may change over time.
          When we make material changes to these Terms or to how the service works, we will update the
          &quot;Last updated&quot; date and may provide additional notice in the app or by email.
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your continued use of Polaris Coach after changes take effect means you accept the updated Terms.
          If you do not agree, you should stop using the service and, if desired, request export or
          deletion of your data.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          9. Governing law
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          These Terms apply to the extent permitted by the laws of your country or region. Local consumer
          protection laws may give you additional rights that these Terms cannot limit.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          10. Contact
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          If you have questions about these Terms or how they apply to your use of Polaris Coach, email{' '}
          <a
            href="mailto:polaris@chizsaleei.com"
            className="font-semibold text-slate-900 underline dark:text-slate-100"
          >
            polaris@chizsaleei.com
          </a>
          . Please include the email address associated with your Polaris Coach account so we can verify
          ownership.
        </p>
      </section>
    </main>
  )
}
