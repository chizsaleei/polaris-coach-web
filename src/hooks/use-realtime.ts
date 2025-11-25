// src/hooks/use-realtime.ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { createRealtime } from '@/lib/openai/realtime'

type RealtimeStatus = 'idle' | 'connecting' | 'ready' | 'live' | 'stopped' | 'error'

type RealtimeConn = Awaited<ReturnType<typeof createRealtime>>

export interface UseRealtimeOptions {
  tokenUrl?: string
}

/**
 * useRealtime
 *
 * React hook around the OpenAI Realtime helper in `lib/openai/realtime.ts`.
 * It:
 * - Connects to `/api/realtime/token` to mint an ephemeral key
 * - Manages the WebRTC connection lifecycle
 * - Exposes status, latest transcript, latest message, and helpers
 *   to connect, start the mic, stop, and send user events.
 *
 * Server remains source of truth for entitlements and minute limits; this
 * hook only manages the client-side connection.
 */
export function useRealtime(options: UseRealtimeOptions = {}) {
  const { tokenUrl = '/api/realtime/token' } = options

  const [status, setStatus] = useState<RealtimeStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [lastMessage, setLastMessage] = useState<unknown>(null)

  const connRef = useRef<RealtimeConn | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connRef.current) {
        connRef.current.stop()
        connRef.current = null
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (status === 'connecting' || status === 'ready' || status === 'live') return
    setError(null)
    setStatus('connecting')

    try {
      const conn = await createRealtime({
        tokenUrl,
        onTranscription: (text) => {
          setTranscript(text)
        },
        onResponse: (msg) => {
          setLastMessage(msg)
        },
      })
      connRef.current = conn
      setStatus('ready')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Unable to connect to realtime coach.')
      setStatus('error')
    }
  }, [status, tokenUrl])

  const startMic = useCallback(async () => {
    if (!connRef.current) {
      await connect()
    }
    if (!connRef.current) return
    setError(null)
    try {
      await connRef.current.startMic()
      setStatus('live')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Microphone access failed.')
      setStatus('error')
    }
  }, [connect])

  const stop = useCallback(() => {
    if (!connRef.current) {
      setStatus('stopped')
      return
    }
    connRef.current.stop()
    connRef.current = null
    setStatus('stopped')
  }, [])

  const sendUserEvent = useCallback((payload: unknown) => {
    if (!connRef.current) return
    connRef.current.sendUserEvent(payload)
  }, [])

  return {
    status,
    error,
    transcript,
    lastMessage,
    connect,
    startMic,
    stop,
    sendUserEvent,
  }
}
