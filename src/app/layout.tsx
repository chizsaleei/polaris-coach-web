// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Inter, Playfair_Display } from 'next/font/google'

// System fonts: Inter for UI, Playfair for headings
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const siteUrl =
  process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Polaris Coach',
    template: '%s · Polaris Coach',
  },
  description:
    'Pick a profession-specific AI coach, practice in short focused loops, save expressions automatically, and see clear progress every week.',
  applicationName: 'Polaris Coach',
  keywords: [
    'AI coach',
    'IELTS',
    'TOEFL',
    'medical communication',
    'business English',
    'technical interviews',
    'speaking drills',
    'expressions pack',
  ],
  authors: [{ name: 'Polaris Coach' }],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Polaris Coach',
    siteName: 'Polaris Coach',
    description:
      'Practice 10 to 15 minute drills with instant feedback and auto Expressions Pack.',
    images: [
      {
        url: '/og/Polaris_Coach_og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Polaris Coach',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polaris Coach',
    description:
      'Short focused drills, instant feedback, and your Expressions Pack saved automatically.',
    images: ['/og/Polaris_Coach_og-1200x630.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [{ url: '/favicon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#07435E' }, // Primary
    { media: '(prefers-color-scheme: dark)', color: '#001C29' }, // Base-dark
  ],
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          inter.variable,
          playfair.variable,
          'min-h-screen bg-white text-black antialiased',
          'dark:bg-[#001C29] dark:text-white',
        ].join(' ')}
      >
        {/* Skip link for keyboard users */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#DBF7FF] focus:px-3 focus:py-2 focus:text-[#042838] dark:focus:bg-[#042838] dark:focus:text-white"
        >
          Skip to content
        </a>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="grid min-h-screen grid-rows-[auto,1fr,auto]">
            <Header />
            <main
              id="content"
              className="container mx-auto w-full max-w-6xl px-4 py-6 sm:py-8"
            >
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
