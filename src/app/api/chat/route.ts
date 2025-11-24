// src/app/api/chat/route.ts
// Thin bridge from the Next.js app to polaris-core /api/chat/coach

import { NextRequest, NextResponse } from 'next/server'

import { corePost, CoreError } from '@/lib/fetch-core'
import { getServerSession } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { ChatMessage } from '@/lib/openai/client'
import type { CoachKey } from '@/types'

export const dynamic = 'force-dynamic'

const log = logger.child('api-chat')

type ChatRequestBody = {
  coachKey: CoachKey
  messages: ChatMessage[]
}

type ChatUsage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

type CoreChatData = {
  reply: string
  coach_key: CoachKey
  model: string
  usage?: ChatUsage
}

type CoreChatResponse = {
  ok: boolean
  data?: CoreChatData
  correlation_id?: string
}

/**
 * POST /api/chat
 * Body: { coachKey: "chase_krashen", messages: ChatMessage[] }
 * Bridges to polaris-core /api/chat/coach and returns the reply.
 */
export async function POST(req: NextRequest) {
  let body: ChatRequestBody

  // Parse and validate body
  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    )
  }

  const { coachKey, messages } = body

  if (!coachKey || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'coachKey and at least one message are required' },
      { status: 400 },
    )
  }

  // Require logged-in user
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 },
    )
  }

  const payload = {
    coach_key: coachKey,
    messages,
    user_id: session.user.id,
  }

  try {
    const result = await corePost<CoreChatResponse>(
      '/api/chat/coach',
      payload,
      {
        authBearer: session.access_token,
        cache: 'no-store',
      },
    )

    if (!result.ok || !result.data) {
      log.warn('chat_core_not_ok', {
        correlation_id: result.correlation_id,
      })

      return NextResponse.json(
        { error: 'Chat service is temporarily unavailable' },
        { status: 502 },
      )
    }

    const { reply, coach_key, model, usage } = result.data

    // Client-friendly response
    return NextResponse.json(
      {
        reply,
        coachKey: coach_key,
        model,
        usage,
        correlationId: result.correlation_id,
      },
      { status: 200 },
    )
  } catch (err) {
    if (err instanceof CoreError) {
      log.error('chat_core_error', {
        code: err.code,
        status: err.status,
        requestId: err.requestId,
      })
    } else {
      log.error('chat_unexpected_error', { error: String(err) })
    }

    return NextResponse.json(
      { error: 'Chat service failed. Please try again.' },
      { status: 502 },
    )
  }
}
