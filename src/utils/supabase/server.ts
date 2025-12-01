// src/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

type CookieStore = ReturnType<typeof cookies>
type Database = any
export type AppSupabaseServerClient = SupabaseClient<Database>

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

/**
 * Supabase App Framework helper.
 * Pass in the per-request cookie store; falls back to next/headers cookies().
 */
export function createClient(cookieStore?: CookieStore): AppSupabaseServerClient {
  const store = cookieStore ?? cookies()

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return store.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          )
        } catch {
          // cookies() can be read-only in server components; middleware should refresh sessions.
        }
      },
    },
  })
}

function getRequiredEnv(key: string) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key} while creating the Supabase server client`)
  }
  return value
}
