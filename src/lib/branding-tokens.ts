// src/lib/branding-tokens.ts
/**
 * Central brand tokens for Polaris Coach.
 * Exposes both a typed JS object and a CSS variables injector.
 * WCAG AA intent: ensure on-color tokens are readable on filled surfaces.
 */

export type BrandTokens = {
  color: {
    primary: string
    primaryOn: string
    secondary: string
    secondaryOn: string
    accent: string
    accentOn: string
    surface: string
    surfaceOn: string
    base: string
    baseOn: string
    text: string
    success: string
    successOn: string
    warning: string
    warningOn: string
    danger: string
    dangerOn: string
    info: string
    infoOn: string
    focus: string
  }
  radius: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    pill: string
  }
  shadow: {
    sm: string
    md: string
    lg: string
  }
  space: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  font: {
    body: string
    heading: string
    mono: string
  }
}

/**
 * Light theme: soft, light backgrounds with dark text.
 * Used for :root.
 */
export const LIGHT_TOKENS: BrandTokens = {
  color: {
    // Light version of your teal brand
    primary: '#0EA5E9',      // buttons / links
    primaryOn: '#04101A',
    secondary: '#07435E',
    secondaryOn: '#F5FBFF',
    accent: '#FACC15',       // Polaris yellow accent
    accentOn: '#04101A',

    // Main surfaces
    surface: '#FFFFFF',      // cards, panels
    surfaceOn: '#04101A',
    base: '#F3F7FA',         // page background
    baseOn: '#04101A',

    // Body text
    text: '#04101A',

    // System states
    success: '#16A34A',
    successOn: '#FFFFFF',
    warning: '#C58A00',
    warningOn: '#111827',
    danger: '#CC3344',
    dangerOn: '#FFFFFF',
    info: '#3B82F6',
    infoOn: '#FFFFFF',

    // Focus ring
    focus: '#0EA5E9',
  },
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    pill: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.06)',
    md: '0 6px 20px rgba(15,23,42,0.14)',
    lg: '0 12px 40px rgba(15,23,42,0.2)',
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  font: {
    body:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    heading:
      'ui-serif, Georgia, "Times New Roman", Times, "Apple Color Emoji", "Segoe UI Emoji"',
    mono:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"',
  },
}

/**
 * Dark theme: matches the screenshot hero.
 * Deep navy/teal base, bright yellow accent, light text.
 * Used for html.dark.
 */
export const DARK_TOKENS: BrandTokens = {
  color: {
    primary: '#0EA5E9',      // bright teal for CTAs
    primaryOn: '#021019',
    secondary: '#001C29',
    secondaryOn: '#E5F2FF',
    accent: '#FACC15',       // Polaris wordmark yellow
    accentOn: '#021019',

    // Dark surfaces
    surface: '#03121A',      // cards on dark background
    surfaceOn: '#E5F2FF',
    base: '#00121B',         // page base / header
    baseOn: '#E5F2FF',

    // Body text on dark
    text: '#F9FAFB',

    // System states on dark
    success: '#22C55E',
    successOn: '#021019',
    warning: '#FACC15',
    warningOn: '#021019',
    danger: '#FB7185',
    dangerOn: '#021019',
    info: '#38BDF8',
    infoOn: '#021019',

    // Focus ring on dark
    focus: '#38BDF8',
  },
  radius: LIGHT_TOKENS.radius,
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.35)',
    md: '0 8px 24px rgba(0,0,0,0.55)',
    lg: '0 16px 48px rgba(0,0,0,0.7)',
  },
  space: LIGHT_TOKENS.space,
  font: LIGHT_TOKENS.font,
}

/**
 * Default export kept as light tokens so existing imports still work.
 */
export const TOKENS: BrandTokens = LIGHT_TOKENS

// Helper to build a CSS block for one theme
function blockFor(selector: string, t: BrandTokens): string {
  return `
${selector} {
  /* Colors */
  --pc-color-primary: ${t.color.primary};
  --pc-color-primary-on: ${t.color.primaryOn};
  --pc-color-secondary: ${t.color.secondary};
  --pc-color-secondary-on: ${t.color.secondaryOn};
  --pc-color-accent: ${t.color.accent};
  --pc-color-accent-on: ${t.color.accentOn};
  --pc-color-surface: ${t.color.surface};
  --pc-color-surface-on: ${t.color.surfaceOn};
  --pc-color-base: ${t.color.base};
  --pc-color-base-on: ${t.color.baseOn};
  --pc-color-text: ${t.color.text};
  --pc-color-success: ${t.color.success};
  --pc-color-success-on: ${t.color.successOn};
  --pc-color-warning: ${t.color.warning};
  --pc-color-warning-on: ${t.color.warningOn};
  --pc-color-danger: ${t.color.danger};
  --pc-color-danger-on: ${t.color.dangerOn};
  --pc-color-info: ${t.color.info};
  --pc-color-info-on: ${t.color.infoOn};
  --pc-color-focus: ${t.color.focus};

  /* Radius */
  --pc-radius-xs: ${t.radius.xs};
  --pc-radius-sm: ${t.radius.sm};
  --pc-radius-md: ${t.radius.md};
  --pc-radius-lg: ${t.radius.lg};
  --pc-radius-xl: ${t.radius.xl};
  --pc-radius-pill: ${t.radius.pill};

  /* Shadows */
  --pc-shadow-sm: ${t.shadow.sm};
  --pc-shadow-md: ${t.shadow.md};
  --pc-shadow-lg: ${t.shadow.lg};

  /* Spacing */
  --pc-space-xs: ${t.space.xs};
  --pc-space-sm: ${t.space.sm};
  --pc-space-md: ${t.space.md};
  --pc-space-lg: ${t.space.lg};
  --pc-space-xl: ${t.space.xl};

  /* Fonts */
  --pc-font-body: ${t.font.body};
  --pc-font-heading: ${t.font.heading};
  --pc-font-mono: ${t.font.mono};
}`
}

/**
 * Overload: keep old signature (one theme) and new one (light + dark).
 */
export function tokensToCssVars(t?: BrandTokens): string
export function tokensToCssVars(light: BrandTokens, dark: BrandTokens): string
export function tokensToCssVars(
  arg1: BrandTokens = TOKENS,
  arg2?: BrandTokens,
): string {
  const light = arg1
  const dark = arg2

  let css = blockFor(':root', light)

  // If a dark theme is supplied, emit a second block for html.dark
  if (dark) {
    css += '\n\n' + blockFor('html.dark', dark)
  }

  return css
}

/** Apply CSS variables to the document quickly on the client side. */
export function injectBrandingCss(
  light: BrandTokens = LIGHT_TOKENS,
  dark: BrandTokens = DARK_TOKENS,
) {
  if (typeof document === 'undefined') return
  const id = 'pc-branding-css'
  let el = document.getElementById(id) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = tokensToCssVars(light, dark)
}
