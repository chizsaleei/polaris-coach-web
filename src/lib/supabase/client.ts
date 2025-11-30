'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type BrowserSupabaseClient = SupabaseClient<unknown>

let _client: BrowserSupabaseClient | null = null

export function getSupabaseBrowserClient(): BrowserSupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase browser client',
    )
  }

  _client = createClient<unknown>(url, anon, {
    auth: {
      flowType: 'pkce',
    },
  })

  return _client
}
