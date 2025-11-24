// src/app/api/middleware/rate-limit.ts

// Lightweight rate limiter for API routes.
// - Local/dev: in-memory bucket (per-process)
// - Prod: auto-uses Vercel KV if KV_REST_API_URL and KV_REST_API_TOKEN are set
// Bucketing: fixed window with standard RateLimit-* headers.

import type { NextRequest } from 'next/server'

type Store = {
  incr: (key: string, ttlSec: number) => Promise<number>
}

const KV_URL =
  process.env.POLARIS_REST_API_KV_REST_API_URL || process.env.KV_REST_API_URL
const KV_TOKEN =
  process.env.POLARIS_REST_API_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN

const hasKV = !!KV_URL && !!KV_TOKEN

/** In-memory store for local dev and as a fallback. */
class MemoryStore implements Store {
  private map = new Map<string, { count: number; exp: number }>()

  async incr(key: string, ttlSec: number): Promise<number> {
    const now = Math.floor(Date.now() / 1000)
    const bucket = this.map.get(key)

    if (!bucket || bucket.exp <= now) {
      this.map.set(key, { count: 1, exp: now + ttlSec })
      return 1
    }

    bucket.count += 1
    return bucket.count
  }
}

const memoryStore = new MemoryStore()

/** Minimal Vercel KV client (Upstash REST). */
class KVStore implements Store {
  private url = KV_URL!
  private token = KV_TOKEN!
  private fallback: MemoryStore

  constructor(fallback: MemoryStore) {
    this.fallback = fallback
  }

  // Use a small pipeline: INCR + EXPIRE if new
  async incr(key: string, ttlSec: number): Promise<number> {
    try {
      // 1) INCR
      const incrRes = await fetch(`${this.url}/incr/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}` },
        cache: 'no-store',
      })

      if (!incrRes.ok) {
        throw new Error(`KV incr failed: ${incrRes.status}`)
      }

      const json = (await incrRes.json()) as { result: number }
      const count = json.result

      // 2) If first hit, set expiry (best effort)
      if (count === 1) {
        void fetch(`${this.url}/expire/${encodeURIComponent(key)}/${ttlSec}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` },
          cache: 'no-store',
        }).catch(() => {
          // Expire failure is non-fatal
        })
      }

      return count
    } catch (err) {
      // In dev/local, fall back silently to in-memory to avoid crashing `npm run dev`
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[rate-limit] KV incr failed, falling back to in-memory store', err)
        return this.fallback.incr(key, ttlSec)
      }

      // In production, surfacing the error is safer so you notice KV issues
      if (err instanceof Error) {
        throw err
      }
      throw new Error(String(err))
    }
  }
}

const store: Store = hasKV ? new KVStore(memoryStore) : memoryStore

export type LimitSpec = {
  limit: number // max requests per window
  windowSec: number // window in seconds
  prefix?: string // key namespace
}

export type RateResult = {
  allowed: boolean
  remaining: number
  reset: number // unix seconds
  total: number
}

function getClientIp(req: NextRequest): string {
  // Prefer Vercel's x-forwarded-for. Fallback to NextRequest.ip or anonymous.
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || '0.0.0.0'

  const withIp = req as NextRequest & { ip?: string }
  return withIp.ip || '0.0.0.0'
}

function bucketKey(spec: LimitSpec, id: string, windowStart: number, routeKey: string): string {
  const prefix = spec.prefix ?? 'rl'
  return `${prefix}:${routeKey}:${id}:${windowStart}`
}

export async function checkRate(
  req: NextRequest,
  spec: LimitSpec,
  routeKey: string,
  customId?: string,
): Promise<RateResult> {
  const nowSec = Math.floor(Date.now() / 1000)
  const windowStart = nowSec - (nowSec % spec.windowSec)
  const id = customId || getClientIp(req)
  const key = bucketKey(spec, id, windowStart, routeKey)

  const total = await store.incr(key, spec.windowSec)
  const remaining = Math.max(0, spec.limit - total)
  const allowed = total <= spec.limit
  const reset = windowStart + spec.windowSec

  return { allowed, remaining, reset, total }
}

/** Attach standard RateLimit headers to a Response. */
export function withRateHeaders(res: Response, spec: LimitSpec, result: RateResult): Response {
  res.headers.set('RateLimit-Limit', String(spec.limit))
  res.headers.set('RateLimit-Remaining', String(result.remaining))
  res.headers.set('RateLimit-Reset', String(result.reset))
  return res
}

/** Route presets you can reuse in handlers or middleware. */
export const RatePresets = {
  // 60/min per IP
  defaultApi: { limit: 60, windowSec: 60, prefix: 'rl' } satisfies LimitSpec,
  // 10/min per IP
  authTight: {
    limit: 10,
    windowSec: 60,
    prefix: 'rl_auth',
  } satisfies LimitSpec,
  // 30/min per IP
  chatBurst: {
    limit: 30,
    windowSec: 60,
    prefix: 'rl_chat',
  } satisfies LimitSpec,
  // enough for retries
  webhook: {
    limit: 20,
    windowSec: 60,
    prefix: 'rl_hook',
  } satisfies LimitSpec,
}
