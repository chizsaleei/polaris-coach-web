// src/lib/supabase/server.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'

import {
  createClient as createFrameworkClient,
  type AppSupabaseServerClient,
} from '@/utils/supabase/server'

type ServerSupabaseClient = AppSupabaseServerClient
type CookieStore = ReturnType<typeof cookies>

export function getSupabaseServerClient(
  cookieStore?: CookieStore,
): ServerSupabaseClient {
  const store = cookieStore ?? cookies()
  return createFrameworkClient(store)
}

export type ServerSession = Session

/**
 * Fetch current session on the server.
 * Returns the Supabase session (includes access_token and user).
 */
export async function getServerSession(
  cookieStore?: CookieStore,
): Promise<ServerSession | null> {
  const supabase = getSupabaseServerClient(cookieStore)
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) return null
    return data.session ?? null
  } catch {
    return null
  }
}

/**
 * Fetch current user on the server.
 */
export async function getServerUser(cookieStore?: CookieStore) {
  const session = await getServerSession(cookieStore)
  return session?.user ?? null
}

/**
 * Redirect to /login if no user.
 */
export async function requireUser(
  redirectTo = '/login',
  cookieStore?: CookieStore,
) {
  const user = await getServerUser(cookieStore)
  if (!user) redirect(redirectTo)
  return user
}

/**
 * Simple admin check using your SQL helper.
 * You have an is_admin SQL helper in policies. This calls it.
 */
export async function requireAdmin(
  redirectTo = '/',
  cookieStore?: CookieStore,
) {
  const store = cookieStore ?? cookies()
  const supabase = getSupabaseServerClient(store)
  const user = await getServerUser(store)
  if (!user) redirect('/login')

  // Prefer RPC if you published a SECURITY DEFINER function is_admin()
  const { data, error } = await supabase.rpc('is_admin')
  if (error || !data) redirect(redirectTo)

  return user
}
