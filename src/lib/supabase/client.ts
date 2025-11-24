// src/lib/supabase/client.ts
'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * If you later generate typed Supabase definitions, you can replace `any`
 * with your Database type here.
 */
type TypedSupabaseClient = SupabaseClient<any>

let _client: TypedSupabaseClient | null = null

/**
 * Singleton browser client.
 * Uses anon key and respects RLS.
 */
export function getSupabaseBrowserClient(): TypedSupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase browser client',
    )
  }

  _client = createClient(url, anon)
  return _client
}
