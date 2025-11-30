import type { Metadata } from 'next'
import Link from 'next/link'

import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import EmailSignInForm from '@/components/auth/EmailSignInForm'

export const metadata: Metadata = {
  title: 'Create your account · Polaris Coach',
  description:
    'Sign up with your email or Google account to start practicing with your Polaris Coach, track drills, and unlock billing.',
}

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#04070f] px-4 py-12 text-white">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          Sign up for
        </p>
        <h1 className="mt-2 text-3xl font-bold">Polaris Coach</h1>
        <p className="mt-3 text-sm text-slate-300">
          Create your account with a secure magic link or your Google identity. You&apos;ll be ready to practice in seconds.
        </p>

        <div className="mt-8 space-y-4">
          <EmailSignInForm nextPath="/dashboard" variant="dark" />

          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            <span>or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <GoogleSignInButton
            nextPath="/dashboard"
            className="w-full justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          />
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
