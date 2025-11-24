// src/components/app/LiveCall.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Headphones,
  LoaderCircle,
  Mic2,
  PhoneOff,
} from 'lucide-react'

import { createRealtime } from '@/lib/openai/realtime'

type LiveState = 'idle' | 'connecting' | 'live' | 'stopped' | 'error'

export interface LiveCallProps {
  tokenUrl?: string
}

/**
 * LiveCall
 *
 * Client-side UI for a single live speaking session using
 * OpenAI Realtime via /api/realtime/token.
 *
 * It:
 * - Connects to the realtime backend and starts the mic
 * - Streams coach audio back to the user
 * - Shows the latest transcript text from the session
 */
export default function LiveCall({
  tokenUrl = '/api/realtime/token',
}: LiveCallProps) {
  const [state, setState] = useState<LiveState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')

  const [elapsedSec, setElapsedSec] = useState(0)
  const startedAtRef = useRef<number | null>(null)
  const rtcRef = useRef<Awaited<ReturnType<typeof createRealtime>> | null>(
    null,
  )

  // Timer for live session
  useEffect(() => {
    if (state !== 'live') return
    if (!startedAtRef.current) {
      startedAtRef.current = Date.now()
    }
    const id = setInterval(() => {
      if (!startedAtRef.current) return
      setElapsedSec(
        Math.max(
          0,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        ),
      )
    }, 1_000)
    return () => clearInterval(id)
  }, [state])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rtcRef.current) {
        rtcRef.current.stop()
        rtcRef.current = null
      }
    }
  }, [])

  const start = async () => {
    if (state === 'connecting' || state === 'live') return
    setError(null)
    setTranscript('')
    setElapsedSec(0)
    startedAtRef.current = null
    setState('connecting')

    try {
      const rtc = await createRealtime({
        tokenUrl,
        onTranscription: (text) => {
          setTranscript(text)
        },
      })

      rtcRef.current = rtc
      await rtc.startMic()
      startedAtRef.current = Date.now()
      setState('live')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Unable to start live session.')
      setState('error')
    }
  }

  const stop = () => {
    if (!rtcRef.current) {
      setState('stopped')
      return
    }
    rtcRef.current.stop()
    rtcRef.current = null
    setState('stopped')
  }

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = elapsedSec % 60

  const isBusy = state === 'connecting'
  const isLive = state === 'live'

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#04121B]">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Live call
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Speak with your AI coach
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Press start, speak as you would in a real conversation, and listen
            for realtime feedback. Transcripts appear below so you can spot
            phrasing and pacing patterns.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-900/50 dark:text-slate-100">
            <Headphones className="h-3.5 w-3.5" />
            <span>{stateLabel(state)}</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-900/50 dark:text-slate-100">
            <Activity className="h-3.5 w-3.5" />
            <span>
              {minutes}:{String(seconds).padStart(2, '0')} min
            </span>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isLive ? stop : start}
          disabled={isBusy}
          className={[
            'inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-white shadow-lg transition',
            isLive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-sky-600 hover:bg-sky-500 disabled:bg-slate-400',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={isLive ? 'Stop live call' : 'Start live call'}
        >
          {isBusy ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : isLive ? (
            <PhoneOff className="h-6 w-6" />
          ) : (
            <Mic2 className="h-6 w-6" />
          )}
        </button>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          {isLive
            ? 'You are live. Speak normally and pause to hear your coach.'
            : 'When you press start, your browser may ask for microphone permission.'}
        </p>
      </div>

      <section className="mt-5 flex-1 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Transcript (latest)
        </p>
        <div className="mt-2 h-52 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
          {transcript ? (
            <p>{transcript}</p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your transcript will appear here after you start speaking.
            </p>
          )}
        </div>
      </section>

      {error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}
    </article>
  )
}

function stateLabel(state: LiveState) {
  switch (state) {
    case 'idle':
      return 'Ready'
    case 'connecting':
      return 'Connecting'
    case 'live':
      return 'Live'
    case 'stopped':
      return 'Stopped'
    case 'error':
      return 'Error'
    default:
      return 'Ready'
  }
}
