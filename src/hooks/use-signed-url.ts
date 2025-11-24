// src/hooks/use-signed-url.ts
'use client'

import { useCallback, useState } from 'react'

export interface SignedUploadRequest {
  /** Supabase Storage bucket name, e.g. 'user-media' */
  bucket: string
  /**
   * Object path within the bucket, e.g. 'sessions/<uuid>.webm'.
   * Polaris Core may normalize this into a `key`.
   */
  path: string
  /** MIME type for the upload, e.g. 'audio/webm' */
  contentType: string
}

/**
 * Normalized target you can use to upload a Blob/File.
 *
 * `url` and `headers` are safe to pass directly to `fetch`:
 *   fetch(target.url, { method: 'PUT', headers: target.headers, body: blob })
 *
 * `bucket` / `key` can be stored alongside any records that need to
 * reference the uploaded object, and `token` / `expiresAt` are exposed
 * in case you prefer to use Supabase's `uploadToSignedUrl` helpers.
 */
export interface SignedUploadTarget {
  bucket: string
  key: string
  url: string
  headers: Record<string, string>
  token?: string
  expiresAt?: string
}

export interface UseSignedUrlResult {
  createSignedUrl: (req: SignedUploadRequest) => Promise<SignedUploadTarget>
  loading: boolean
  error: string | null
}

/**
 * useSignedUrl
 *
 * Client-side helper for Polaris Core's `/api/upload` contract.
 *
 * - Calls `POST /api/upload` with `{ bucket, path, content_type }`
 * - Expects Core to return `{ ok, data: { bucket, key, upload_url, token, expires_at, content_type }, ... }`
 *   but also tolerates a simpler `{ data: { url, headers } }` shape
 * - Normalizes into `{ bucket, key, url, headers, token, expiresAt }`
 *
 * Upload flow (typical usage):
 *
 *   const { createSignedUrl } = useSignedUrl()
 *   const target = await createSignedUrl({
 *     bucket: 'user-media',
 *     path: `sessions/${crypto.randomUUID()}.webm`,
 *     contentType: 'audio/webm',
 *   })
 *   await fetch(target.url, {
 *     method: 'PUT',
 *     headers: target.headers,
 *     body: blob,
 *   })
 */
export function useSignedUrl(): UseSignedUrlResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSignedUrl = useCallback(
    async ({ bucket, path, contentType }: SignedUploadRequest): Promise<SignedUploadTarget> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            bucket,
            path,
            content_type: contentType,
          }),
          cache: 'no-store',
        })

        const json = await safeJson(res)

        if (!res.ok) {
          const msg =
            (json && typeof json.message === 'string' && json.message) ||
            `Upload URL request failed (${res.status})`
          throw new Error(msg)
        }

        const rawData = json && typeof json === 'object' && 'data' in json ? (json as any).data : json
        if (!rawData || typeof rawData !== 'object') {
          throw new Error('Upload URL response missing data.')
        }

        const data: any = rawData

        // Core-style contract: upload_url + content_type + token + expires_at + bucket + key
        const url: string | undefined = data.url ?? data.upload_url
        if (!url) {
          throw new Error('Upload URL missing from response.')
        }

        const headers: Record<string, string> =
          data.headers ??
          (data.content_type || contentType
            ? { 'Content-Type': (data.content_type as string) || contentType }
            : {})

        const target: SignedUploadTarget = {
          bucket: (data.bucket as string) || bucket,
          key: (data.key as string) || path,
          url,
          headers,
          token: data.token as string | undefined,
          expiresAt: data.expires_at as string | undefined,
        }

        return target
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { createSignedUrl, loading, error }
}

async function safeJson(res: Response): Promise<any | null> {
  try {
    return await res.json()
  } catch {
    return null
  }
}
