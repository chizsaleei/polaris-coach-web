// src/components/app/LiveCoachSwitch.tsx
import Link from 'next/link'
import { ArrowRight, Users2, Clock3 } from 'lucide-react'

/**
 * LiveCoachSwitch
 *
 * Small helper panel for the Live tab that explains
 * how coach switching works and points users to the
 * right place (Explore / Account) to change coaches.
 *
 * The actual cooldown and gating logic is enforced on
 * the server and surfaced via CoachSwitchNotice.
 */
export default function LiveCoachSwitch() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-sm text-slate-700 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#04121B] dark:text-slate-200">
      <header className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <Users2 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Coaches
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Switch coaches without losing progress
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Free and Pro keep one active coach with a cooldown between switches.
            VIP can switch any time. Your past drills and Expressions Packs stay in
            your library even if you change coaches.
          </p>
        </div>
      </header>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        <li className="flex items-start gap-2">
          <Clock3 className="mt-0.5 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <span>
            Cooldowns are enforced server-side. The yellow banner at the top of the app
            shows exactly when you can switch again.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <span>
            Use <Link href="/explore" className="font-semibold underline">Explore</Link> to see drills
            by each coach before you switch.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <span>
            Check your current tier and active coach on the{' '}
            <Link href="/account" className="font-semibold underline">Account</Link> page.
          </span>
        </li>
      </ul>
    </aside>
  )
}
