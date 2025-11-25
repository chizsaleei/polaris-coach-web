// src/components/ui/theme-provider.tsx
'use client'

import type { ReactNode } from 'react'

export interface ThemeProviderProps {
  children: ReactNode
  attribute?: string
  defaultTheme?: 'light' | 'dark' | 'system'
  enableSystem?: boolean
}

/**
 * Minimal ThemeProvider compatible with the app layout.
 * Actual theme switching is handled by ThemeToggle, which
 * applies/removes the `dark` class on documentElement.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
