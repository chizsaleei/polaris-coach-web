import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Authentication</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Verification code invalid or expired</h1>
        <p className="mt-4 text-slate-600">
          The one-time code in your email or SMS is no longer valid. For security, codes expire quickly and each one can
          only be used once.
        </p>
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
          >
            Send a new code
          </button>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400"
          >
            Back to login
          </Link>
        </div>
        <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Check spam and promotions folders for the latest code.</li>
            <li>Each code is valid for only a few minutes. Request a fresh one if you waited too long.</li>
            <li>
              If you keep seeing this message, contact support and include the email address tied to your Polaris account.
            </li>
          </ul>
        </div>
        <div className="mt-6 text-center text-sm text-slate-500">
          Need help?{' '}
          <a className="font-semibold text-slate-900 hover:underline" href="mailto:polaris@chizsaleei.com">
            polaris@chizsaleei.com
          </a>
        </div>
      </div>
    </main>
  )
}
