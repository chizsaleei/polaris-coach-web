// src/components/ui/button.tsx
'use client'

import * as React from 'react'
import clsx from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * Design system button used by app components like PracticeNowButton.
 * Tailored to Polaris Coach colors and focus states.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ' +
      'disabled:cursor-not-allowed disabled:opacity-60'

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-slate-900 text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500',
      secondary:
        'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 ' +
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
      outline:
        'border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50 ' +
        'dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-900/40',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 ' +
        'dark:text-slate-200 dark:hover:bg-slate-900/40',
      danger:
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
    }

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    }

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(base, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
