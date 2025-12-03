import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

const supabaseUrl = getEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
)

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next')

  console.info('auth_callback_received', { codePresent: Boolean(code), nextParam })

  if (!code) {
    return NextResponse.redirect(new URL('/auth-code-error', url.origin))
  }

  const pendingCookies: PendingCookie[] = []
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        pendingCookies.push({ name, value, options })
      },
      remove(name, options) {
        pendingCookies.push({
          name,
          value: '',
          options: { ...options, maxAge: 0 },
        })
      },
    },
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (data?.session) {
    console.info('auth_callback_exchange_success', {
      userId: data.session.user?.id,
      expiresAt: data.session.expires_at,
    })
  }
  if (error) {
    console.error('auth_callback_exchange_failed', error)
    return NextResponse.redirect(new URL('/auth-code-error', url.origin))
  }

  let redirectPath = '/dashboard'
  if (nextParam && nextParam.startsWith('/')) {
    redirectPath = nextParam
  }

  const response = NextResponse.redirect(new URL(redirectPath, url.origin))
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  }
  return response
}

type PendingCookie = { name: string; value: string; options?: CookieOptions }

function getEnv(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Missing env var ${key} for auth callback`)
  }
  return value
}
