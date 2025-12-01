// src/utils/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

type Database = any
export type AppSupabaseMiddlewareClient = SupabaseClient<Database>

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

/**
 * Build a Supabase client within Next middleware.
 * Returns both the Supabase client and a response with refreshed auth cookies.
 */
export function createClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  return { supabase, response }
}

function getRequiredEnv(key: string) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key} while creating the Supabase middleware client`)
  }
  return value
}
