// src/components/app/LiveCoachPanel.tsx
'use client'

import { useEffect, useState } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

import { useVoiceActivity } from '@/hooks/use-voice-activity'

type LiveCoachPanelProps = {
  userId: string
  userName?: string
  coachLabel?: string
}

export default function LiveCoachPanel({
  userId, // reserved for future analytics / session tokens
  userName,
  coachLabel,
}: LiveCoachPanelProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { level, isActive } = useVoiceActivity(stream)

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          // ignore
        }
      })
    }
    setStream(null)
    setIsMicOn(false)
  }

  async function handleToggleMic() {
    if (isMicOn) {
      stopStream()
      return
    }

    setError(null)
    setIsBusy(true)

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support microphone access.')
      }

      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(nextStream)
      setIsMicOn(true)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'We could not access your microphone. Check browser permissions.'
      setError(message)
      stopStream()
    } finally {
      setIsBusy(false)
    }
  }

  const levelPercent = Math.min(100, Math.max(0, Math.round(level * 100)))

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-800 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Live speaking
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Tap the mic and start talking
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Your voice stays on this device while we detect activity. The session uses your current
            coach profile{coachLabel ? ` (${coachLabel})` : ''}.
          </p>
        </div>
        <button
          type="button"
          disabled={isBusy}
          onClick={handleToggleMic}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            isMicOn
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500'
          } ${isBusy ? 'opacity-75' : ''}`}
        >
          {isMicOn ? (
            <>
              <MicOff className="h-4 w-4" aria-hidden="true" />
              Stop mic
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" aria-hidden="true" />
              Start mic
            </>
          )}
        </button>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.4fr),minmax(0,0.8fr)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-sky-600">
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Voice meter
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isMicOn
                    ? isActive
                      ? 'We hear you. Keep speaking at this level.'
                      : 'Mic is on. Start speaking to see activity.'
                    : 'Mic is off. Turn it on to test your setup.'}
                </p>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Level: {levelPercent}%
            </p>
          </div>

          <div className="mt-3 h-3 rounded-full bg-slate-200/80 dark:bg-slate-800">
            <div
              className={`h-3 rounded-full transition-[width,background-color] duration-150 ${
                isActive
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : 'bg-sky-400/80 dark:bg-sky-500/80'
              }`}
              style={{ width: `${Math.max(4, levelPercent)}%` }}
            />
          </div>

          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            If the bar does not move when you speak, check your browser input device, close any
            other apps using the mic, and try again.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            How to use this
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Start the mic and say a short introduction or case description.</li>
            <li>Pause and let your coach respond, then answer follow-up questions.</li>
            <li>Use clear openings like “My main concern is…” or “My goal today is…”.</li>
          </ol>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            For now this panel focuses on voice and pacing. Future updates can connect this stream
            directly to live transcription and feedback.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
