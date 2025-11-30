// Core fetch helper for server-side use in Next.js route handlers
// Connects Web to Polaris Core with consistent headers, errors, and idempotency.

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type CoreFetchOptions = {
  method?: HttpMethod
  body?: unknown
  admin?: boolean
  headers?: Record<string, string>
  search?: Record<string, string | number | boolean | null | undefined>
  authBearer?: string | null // pass a user access token if you have one
  requestId?: string
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

export type CoreErrorShape = {
  error?: { code?: string; message?: string }
  requestId?: string
  status?: number
  raw?: unknown
}

export class CoreError extends Error {
  code?: string
  status?: number
  requestId?: string
  raw?: unknown
  constructor(msg: string, init?: { code?: string; status?: number; requestId?: string; raw?: unknown }) {
    super(msg)
    this.name = 'CoreError'
    this.code = init?.code
    this.status = init?.status
    this.requestId = init?.requestId
    this.raw = init?.raw
  }
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var ${name} for coreFetch`)
  return v
}

function joinUrl(base: string, path: string): string {
  if (!base.endsWith('/')) base += '/'
  if (path.startsWith('/')) path = path.slice(1)
  return base + path
}

type RandomUuidSource = { randomUUID?: () => string }

function makeRequestId(): string {
  try {
    const cryptoObj =
      (typeof globalThis === 'object' &&
        (globalThis as typeof globalThis & { crypto?: RandomUuidSource }).crypto) ||
      undefined
    if (cryptoObj?.randomUUID) return cryptoObj.randomUUID()
  } catch {
    // ignore lack of crypto support; fallback below
  }
  return `req_${Math.random().toString(36).slice(2)}${Date.now()}`
}

function buildSearch(search?: CoreFetchOptions['search']): string {
  if (!search) return ''
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(search)) {
    if (v === undefined || v === null) continue
    params.set(k, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

export function idempotencyKey(): string {
  return makeRequestId()
}

/**
 * Main helper. Use inside server routes only.
 *
 * Example:
 *   const data = await coreFetch<{ redirectUrl: string }>(
 *     '/v1/payments/checkout',
 *     { method: 'POST', body: { plan: 'pro_monthly' }, authBearer, headers: { 'idempotency-key': idempotencyKey() } }
 *   )
 */
export async function coreFetch<T = unknown>(path: string, opts: CoreFetchOptions = {}): Promise<T> {
  const base = requireEnv('POLARIS_CORE_BASE_URL')
  const url = joinUrl(base, path) + buildSearch(opts.search)
  const requestId = opts.requestId || makeRequestId()

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-request-id': requestId,
    'x-app-version': process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    ...(opts.headers || {}),
  }

  if (opts.admin) {
    const adminKey = process.env.POLARIS_CORE_ADMIN_API_KEY || ''
    if (!adminKey) throw new Error('POLARIS_CORE_ADMIN_API_KEY not set for admin call')
    headers['x-admin-key'] = adminKey
  }

  const bearer = opts.authBearer
  if (bearer) headers['authorization'] = `Bearer ${bearer}`

  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache || 'no-store',
    next: opts.next,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!res.ok) {
    let payload: unknown = undefined
    try {
      payload = isJson ? await res.json() : await res.text()
    } catch {
      // ignore
    }
    const shape: CoreErrorShape =
      typeof payload === 'object' && payload !== null ? payload : { raw: payload }
    const err = new CoreError(shape?.error?.message || `Core error ${res.status}`, {
      code: shape?.error?.code,
      status: res.status,
      requestId: shape?.requestId || res.headers.get('x-request-id') || requestId,
      raw: payload,
    })
    throw err
  }

  if (!isJson) {
    // Allow non JSON for edge cases
    const text = await res.text()
    return text as unknown as T
  }
  return res.json() as Promise<T>
}

/**
 * Convenience wrappers
 */
export function coreGet<T = unknown>(path: string, opts: Omit<CoreFetchOptions, 'method' | 'body'> = {}) {
  return coreFetch<T>(path, { ...opts, method: 'GET' })
}

export function corePost<T = unknown>(path: string, body?: unknown, opts: Omit<CoreFetchOptions, 'method' | 'body'> = {}) {
  return coreFetch<T>(path, { ...opts, method: 'POST', body })
}

/**
 * Helper to forward the Authorization header from a Next.js Request
 * Use inside route handlers to pass the user token through to Core.
 */
export function forwardAuthHeader(req: Request): string | null {
  return req.headers.get('authorization')
}
