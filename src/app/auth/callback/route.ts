import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next')

  console.info('auth_callback_received', { codePresent: Boolean(code), nextParam })

  if (!code) {
    return NextResponse.redirect(new URL('/auth-code-error', url.origin))
  }

  const supabase = createRouteHandlerClient({ cookies })

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

  return NextResponse.redirect(new URL(redirectPath, url.origin))
}
