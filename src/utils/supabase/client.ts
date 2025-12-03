// src/utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

type Database = any
export type AppSupabaseBrowserClient = SupabaseClient<Database>

const supabaseUrl = getRequiredEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_URL',
)
const supabaseKey = getRequiredEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
)

export function createClient(): AppSupabaseBrowserClient {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

function getRequiredEnv(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Missing ${key} while creating the Supabase browser client`)
  }
  return value
}
