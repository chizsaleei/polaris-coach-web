// src/app/(app)/layout.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'

import EntitlementGuard from '@/components/app/EntitlementGuard'
import PracticePackBanner from '@/components/app/PracticePackBanner'
import SafetyBanner from '@/components/app/SafetyBanner'
import WeeklyRecapCard from '@/components/app/WeeklyRecapCard'
import CoachSwitchNotice from '@/components/app/CoachSwitchNotice'
import AppNav from '@/components/layout/AppNav'

export const metadata: Metadata = {
  title: {
    default: 'App',
    template: '%s · Polaris Coach',
  },
  description:
    'Your practice space for short focused drills with instant feedback and saved Expressions Packs.',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // Server is source of truth for gates, minutes, and coach count
    <EntitlementGuard>
      <div className="space-y-4">
        <AppNav />

        {/* Global in-app notices that support safety and progress */}
        <div className="mx-auto w-full max-w-6xl px-4">
          <Suspense fallback={null}>
            <CoachSwitchNotice />
          </Suspense>

          <Suspense fallback={null}>
            <SafetyBanner />
          </Suspense>

          <Suspense fallback={null}>
            <PracticePackBanner />
          </Suspense>

          <Suspense fallback={null}>
            <WeeklyRecapCard />
          </Suspense>
        </div>

        {/* App pages */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:pb-10">{children}</section>
      </div>
    </EntitlementGuard>
  )
}
