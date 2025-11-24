// src/lib/feature-flags.ts
/**
 * Lightweight feature flag client with server and browser support.
 * Sources of truth (priority order):
 * 1) Runtime overrides (dev only, localStorage: pc_ff_* on the browser)
 * 2) Environment variables (server only: FF_<FLAG>=true|false)
 * 3) Code defaults from constants.ts (DEFAULT_FEATURE_FLAGS)
 *
 * Polaris Core remains the source of truth for capabilities; the web layer
 * only uses these flags for UI experiments and kill switches.
 */

import { DEFAULT_FEATURE_FLAGS } from './constants'

export type FlagName = keyof typeof DEFAULT_FEATURE_FLAGS
export type FeatureFlags = Partial<Record<FlagName, boolean>>

const ENV_PREFIX_SERVER = 'FF_'
const LS_PREFIX = 'pc_ff_'

function parseBool(v: unknown): boolean | undefined {
  if (v === true || v === 'true' || v === '1') return true
  if (v === false || v === 'false' || v === '0') return false
  return undefined
}

// Read flags from environment (Node only)
function envFlags(): FeatureFlags {
  const out: FeatureFlags = {}
  if (typeof window !== 'undefined') return out

  const keys = Object.keys(DEFAULT_FEATURE_FLAGS) as FlagName[]
  for (const k of keys) {
    const envKey = ENV_PREFIX_SERVER + k
    const raw = process.env?.[envKey]
    const parsed = parseBool(raw)
    if (typeof parsed === 'boolean') out[k] = parsed
  }
  return out
}

// Dev-only runtime overrides via localStorage
function localOverrides(): FeatureFlags {
  if (typeof window === 'undefined') return {}
  try {
    const out: FeatureFlags = {}
    const keys = Object.keys(DEFAULT_FEATURE_FLAGS) as FlagName[]
    for (const k of keys) {
      const raw = window.localStorage.getItem(LS_PREFIX + k)
      const parsed = parseBool(raw)
      if (typeof parsed === 'boolean') out[k] = parsed
    }
    return out
  } catch {
    return {}
  }
}

let cachedFlags: FeatureFlags | null = null

export function getFlags(): Record<FlagName, boolean> {
  if (!cachedFlags) {
    cachedFlags = {
      ...DEFAULT_FEATURE_FLAGS,
      ...envFlags(),
      ...localOverrides(),
    }
  }
  // Return a copy to avoid accidental mutation
  const full = {
    ...DEFAULT_FEATURE_FLAGS,
    ...cachedFlags,
  } as Record<FlagName, boolean>
  return full
}

export function isFlagEnabled(name: FlagName): boolean {
  return getFlags()[name] === true
}

export function refreshFlags(): void {
  cachedFlags = null
}

// Set a runtime override in browser for quick testing (dev only)
export function setLocalFlag(name: FlagName, value: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_PREFIX + name, String(value))
    refreshFlags()
    // Broadcast to other tabs
    window.dispatchEvent(
      new StorageEvent('storage', { key: LS_PREFIX + name, newValue: String(value) }),
    )
  } catch {
    /* ignore */
  }
}

// Clear a runtime override
export function clearLocalFlag(name: FlagName): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(LS_PREFIX + name)
    refreshFlags()
    window.dispatchEvent(
      new StorageEvent('storage', { key: LS_PREFIX + name, newValue: null as any }),
    )
  } catch {
    /* ignore */
  }
}

/** Simple A/B helper: returns "A" or "B" in a sticky way per userId and experiment key. */
export function abBucket(userId: string, experiment: string): 'A' | 'B' {
  const seed = `${userId}:${experiment}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % 2 === 0 ? 'A' : 'B'
}

/** React hook to subscribe to flag changes from localStorage in dev. */
export function subscribeToFlagChanges(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: StorageEvent) => {
    if (e.key && e.key.startsWith(LS_PREFIX)) {
      refreshFlags()
      cb()
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
