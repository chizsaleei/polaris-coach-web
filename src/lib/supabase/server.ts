// src/lib/supabase/server.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'

import {
  createClient as createFrameworkClient,
  type AppSupabaseServerClient,
} from '@/utils/supabase/server'

type CookieStore = ReturnType<typeof cookies>

export function getSupabaseServerClient(
  cookieStore?: CookieStore,
): AppSupabaseServerClient {
  const store = cookieStore ?? cookies()
  return createFrameworkClient(store)
}

export type ServerSession = Session

export async function getServerSession(cookieStore?: CookieStore) {
  const supabase = getSupabaseServerClient(cookieStore)
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session ?? null
}

export async function getServerUser(cookieStore?: CookieStore) {
  const session = await getServerSession(cookieStore)
  return session?.user ?? null
}

export async function requireUser(
  redirectTo = '/login',
  cookieStore?: CookieStore,
) {
  const user = await getServerUser(cookieStore)
  if (!user) redirect(redirectTo)
  return user
}

export async function requireAdmin(
  redirectTo = '/login',
  cookieStore?: CookieStore,
) {
  const store = cookieStore ?? cookies()
  const supabase = getSupabaseServerClient(store)
  const user = await getServerUser(store)
  if (!user) redirect(redirectTo)

  const { data, error } = await supabase.rpc('is_admin')
  if (error || !data) redirect(redirectTo)

  return user
}
