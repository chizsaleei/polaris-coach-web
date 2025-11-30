// src/lib/logger.ts
/**
 * Structured logger that works on server and client.
 * - Levels: debug, info, warn, error
 * - Namespaces to group logs
 * - Redaction for common PII keys
 * - Event logger for analytics breadcrumbs
 * - Timed helper to measure durations
 * - Optional Sentry relay if window.Sentry or global.Sentry exists
 */

type Level = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

// Read log level from env. Browser builds can expose NEXT_PUBLIC_LOG_LEVEL.
const DEFAULT_LEVEL: Level =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as Level) ||
  (process.env.LOG_LEVEL as Level) ||
  'info'

const PII_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'apiKey',
  'api_key',
  'secret',
  'client_secret',
  'card',
  'email',
  'phone',
  'ssn',
])

function redact(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(redact)

  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (PII_KEYS.has(k)) {
      out[k] = '[REDACTED]'
    } else if (v && typeof v === 'object') {
      out[k] = redact(v)
    } else {
      out[k] = v
    }
  }
  return out
}

function safeStringify(payload: unknown): string {
  try {
    return JSON.stringify(payload)
  } catch {
    return '[unserializable]'
  }
}

function consoleForLevel(level: Level): (...args: unknown[]) => void {
  if (level === 'debug') return console.debug.bind(console)
  if (level === 'info') return console.info.bind(console)
  if (level === 'warn') return console.warn.bind(console)
  return console.error.bind(console)
}

type SentryBridge = {
  captureMessage?: (message: string, options?: { level?: Level; extra?: Record<string, unknown> }) => void
  captureException?: (error: unknown, options?: { extra?: Record<string, unknown> }) => void
}

export type Logger = {
  level: Level
  debug: (msg: string, meta?: unknown) => void
  info: (msg: string, meta?: unknown) => void
  warn: (msg: string, meta?: unknown) => void
  error: (msg: string, meta?: unknown, err?: unknown) => void
  event: (name: string, meta?: Record<string, unknown>) => void
  timed<T>(label: string, fn: () => Promise<T> | T): Promise<T>
  /** Create a child logger with a namespaced label like "polaris:affiliates". */
  child: (childNs: string) => Logger
}

export function createLogger(namespace = 'app', level: Level = DEFAULT_LEVEL): Logger {
  function log(levelToUse: Level, msg: string, meta?: unknown, err?: unknown) {
    if (LEVEL_ORDER[levelToUse] < LEVEL_ORDER[level]) return

    const entry = {
      ts: new Date().toISOString(),
      level: levelToUse,
      ns: namespace,
      msg,
      meta: meta ? redact(meta) : undefined,
    }

    const line = `${entry.ts} [${entry.level}] ${entry.ns} — ${entry.msg}${
      entry.meta ? ' ' + safeStringify(entry.meta) : ''
    }`

    consoleForLevel(levelToUse)(line)

    // Optional Sentry relay if available
    const S = (globalThis as typeof globalThis & { Sentry?: SentryBridge }).Sentry
    if (S && typeof S.captureMessage === 'function') {
      if (levelToUse === 'error' && err && typeof S.captureException === 'function') {
        try {
          S.captureException(err, { extra: entry })
        } catch {
          // ignore Sentry failure
        }
      } else {
        try {
          S.captureMessage(`${namespace}: ${msg}`, {
            level: levelToUse,
            extra: entry,
          })
        } catch {
          // ignore Sentry failure
        }
      }
    }
  }

  async function timed<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
    const start = performanceNow()
    try {
      const res = await fn()
      const ms = performanceNow() - start
      log('info', `timed:${label}`, { ms })
      return res
    } catch (e) {
      const ms = performanceNow() - start
      log('error', `timed:${label}:failed`, { ms }, e)
      throw e
    }
  }

  return {
    level,
    debug: (msg, meta) => log('debug', msg, meta),
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta, err) => log('error', msg, meta, err),
    event: (name, meta) => {
      log('info', `event:${name}`, meta)
    },
    // child loggers always take a simple string namespace
    child: (childNs: string) => createLogger(`${namespace}:${childNs}`, level),
    timed,
  }
}

function performanceNow(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }
  // Node or non-performance environments, millisecond precision is fine
  return Date.now()
}

// A shared default logger for convenience
export const logger = createLogger('polaris')
