// src/components/app/ShadowingPlayer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, PlayCircle, Volume2 } from 'lucide-react'

export interface ShadowingPlayerProps {
  /** Text for the learner to shadow */
  text: string
  /** Optional voice id used by /api/tts; defaults to coach_default */
  voice?: string
  heading?: string
  description?: string
  autoPrepare?: boolean
  onError?: (message: string) => void
}

/**
 * ShadowingPlayer
 *
 * Plays a model recording of a line so the learner can shadow it.
 * Uses the web proxy /api/tts, which forwards to Polaris Core `/api/tts`.
 * Core returns { ok, data: { audio_url, duration_sec }, correlation_id }.
 */
export default function ShadowingPlayer({
  text,
  voice = 'coach_default',
  heading = 'Shadow this line',
  description = 'Listen once, then repeat aloud matching rhythm, stress, and melody.',
  autoPrepare = false,
  onError,
}: ShadowingPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!autoPrepare) return
    void ensureAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrepare, text, voice])

  const handlePlay = async () => {
    setError(null)
    if (!audioUrl) {
      const ok = await ensureAudio()
      if (!ok) return
    }
    const el = audioRef.current
    if (!el) return
    try {
      setPlaying(true)
      await el.play()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to play audio.'
      setError(msg)
      onError?.(msg)
      setPlaying(false)
    }
  }

  const ensureAudio = async (): Promise<boolean> => {
    if (loading) return false
    if (audioUrl) return true

    setLoading(true)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ voice, text }),
        cache: 'no-store',
      })

      if (!res.ok) {
        const data = await safeJson(res)
        const msg =
          (data && typeof data.message === 'string' && data.message) ||
          `TTS failed (${res.status})`
        throw new Error(msg)
      }

      const json: any = await res.json()
      const url: string | undefined = json?.data?.audio_url ?? json?.data?.url
      if (!url) throw new Error('Missing audio URL from TTS response.')
      setAudioUrl(url)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to generate audio.'
      setError(msg)
      onError?.(msg)
      return false
    } finally {
      setLoading(false)
    }
  }

  const displayText = text.trim()

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-sm text-slate-800 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A] dark:text-slate-100">
      <header className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-sky-600">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Shadowing
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {heading}
          </h2>
          {description && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
        {displayText}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlay}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Preparing audio
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              {playing ? 'Replay' : 'Play model audio'}
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Play once, then mute the coach and say it aloud twice.
        </p>
      </div>

      {error && (
        <p className="mt-2 text-[11px] text-red-500 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Hidden audio element for playback */}
      <audio
        ref={(el) => {
          if (!el) return
          audioRef.current = el
          el.onended = () => setPlaying(false)
        }}
        src={audioUrl ?? undefined}
      />
    </section>
  )
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
