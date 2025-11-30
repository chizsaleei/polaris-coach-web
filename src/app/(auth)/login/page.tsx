import type { Metadata } from 'next'
import Link from 'next/link'

import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import EmailSignInForm from '@/components/auth/EmailSignInForm'

export const metadata: Metadata = {
  title: 'Sign in · Polaris Coach',
  description:
    'Sign in to practice with your profession-specific AI coach, save Expressions Packs, and manage your Polaris account.',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-white px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sign in</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome back to Polaris Coach</h1>
        <p className="mt-4 text-sm text-slate-600">
          Pick up where you left off with your coach, Practice Packs, and weekly recap. We use secure sign-in and short-lived
          verification codes to keep your account safe.
        </p>

        <div className="mt-8 space-y-4">
          <GoogleSignInButton nextPath="/dashboard" />

          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or continue with email</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <EmailSignInForm nextPath="/dashboard" />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          By continuing, you agree to our{' '}
          <Link href="/legal/terms" className="font-semibold text-slate-900 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="font-semibold text-slate-900 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Codes expire within a few minutes. Open the latest email or SMS right away.</li>
            <li>If you enter the wrong code twice, request a new one from the code screen.</li>
            <li>
              Still stuck? Email{' '}
              <a
                className="font-semibold text-slate-900 hover:underline"
                href="mailto:polaris@chizsaleei.com"
              >
                polaris@chizsaleei.com
              </a>
              .
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
            Create one now
          </Link>
        </div>
      </div>
    </main>
  )
}
