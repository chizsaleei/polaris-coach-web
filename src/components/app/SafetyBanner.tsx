// src/components/app/SafetyBanner.tsx
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

/**
 * SafetyBanner
 *
 * Global in-app reminder that Polaris Coach is an educational
 * practice tool, not a source of medical, nursing, financial,
 * legal, or exam guarantees.
 */
export default function SafetyBanner() {
  return (
    <section className="mb-3 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-100">
      <div className="flex flex-wrap items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-white/80 text-red-600 shadow-sm dark:bg-red-900/40 dark:text-red-100">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide">
            Safety and educational use only
          </p>
          <p className="text-[11px] leading-snug">
            Polaris Coach is an educational practice tool. It does not provide medical,
            nursing, financial, legal, or other professional advice, and it does not
            replace certified study materials or official exam guidance.
          </p>
          <p className="text-[11px] leading-snug">
            Do not use this app for emergencies or real clinical or financial decisions.
            If you need urgent help, contact local emergency services or a licensed
            professional. Avoid entering highly sensitive personal data in prompts or notes.
          </p>
          <p className="text-[11px] text-red-900/80 dark:text-red-100/80">
            Learn more in{' '}
            <Link href="/legal/terms" className="font-semibold underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="font-semibold underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
