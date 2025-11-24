// src/components/app/DrillRunner.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle, Sparkles, Timer } from 'lucide-react'

import type { CoachKey } from '@/types'
import { Analytics } from '@/lib/analytics'

export interface DrillRunnerProps {
  userId: string
  drillId: string
  title: string
  prompt: string
  coachKey?: CoachKey
  topic?: string | null
  difficulty?: number | null // 1–5 band
  estMinutes?: number | null
  onRequestAnotherLikeThis?: () => void
  onSwitchTopic?: () => void
}

/**
 * DrillRunner
 *
 * Client-side runner for a single drill:
 * - Shows the drill prompt
 * - Tracks time and word count
 * - Submits the response to /api/chat for coach feedback
 * - Emits practice_started and practice_submitted analytics
 */
export default function DrillRunner({
  userId,
  drillId,
  title,
  prompt,
  coachKey,
  topic,
  difficulty,
  estMinutes,
  onRequestAnotherLikeThis,
  onSwitchTopic,
}: DrillRunnerProps) {
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [submittedOnce, setSubmittedOnce] = useState(false)

  const difficultyBand = useMemo(() => {
    if (!difficulty) return undefined
    if (difficulty <= 2) return 'easy'
    if (difficulty <= 4) return 'medium'
    return 'hard'
  }, [difficulty])

  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => {
      setElapsedSec(Math.max(0, Math.round((Date.now() - startedAt) / 1000)))
    }, 1_000)
    return () => clearInterval(id)
  }, [startedAt])

  const words = useMemo(() => countWords(input), [input])

  const ensureStarted = useCallback(async () => {
    if (startedAt) return
    const now = Date.now()
    setStartedAt(now)
    try {
      await Analytics.practiceStarted({
        userId,
        coachId: coachKey,
        topic: topic ?? undefined,
        difficulty: difficultyBand,
        meta: { drillId },
      })
    } catch {
      // best-effort analytics; ignore failure
    }
  }, [startedAt, userId, coachKey, topic, difficultyBand, drillId])

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) event.preventDefault()
      if (busy) return
      const trimmed = input.trim()
      if (!trimmed) return

      await ensureStarted()
      const start = startedAt ?? Date.now()
      const elapsedMs = Date.now() - start
      const wpm = elapsedMs > 0 ? (words / (elapsedMs / 60000)) : null

      setBusy(true)
      setError(null)

      try {
        const systemPrompt = buildSystemPrompt(coachKey)
        const userContent = buildUserContent(title, prompt, trimmed)

        const payload = {
          userId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        })

        if (!res.ok) {
          const text = await safeText(res)
          throw new Error(text || `Drill feedback failed (${res.status})`)
        }

        const data: any = await res.json()
        const replyText =
          data?.reply ||
          data?.content ||
          data?.message ||
          data?.choices?.[0]?.message?.content ||
          ''

        if (!replyText) {
          throw new Error('The coach sent an empty reply. Try again.')
        }

        setFeedback(replyText)
        setSubmittedOnce(true)

        try {
          await Analytics.practiceSubmitted({
            userId,
            coachId: coachKey,
            topic: topic ?? undefined,
            difficulty: difficultyBand,
            msOnTask: elapsedMs,
            meta: {
              drillId,
              words,
              wpm,
            },
          })
        } catch {
          // ignore analytics errors
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
      } finally {
        setBusy(false)
      }
    },
    [
      busy,
      input,
      ensureStarted,
      startedAt,
      words,
      userId,
      coachKey,
      title,
      prompt,
      topic,
      difficultyBand,
      drillId,
    ],
  )

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-[#03121A]">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Drill runner
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {estMinutes ? `Aim for about ${estMinutes} minutes.` : 'Aim for about 10–15 minutes.'}{' '}
            Focus on clear structure, examples, and calm delivery.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
            <Timer className="h-3.5 w-3.5" />
            <span>
              {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')} min
            </span>
          </div>
          <span>{words} words typed</span>
          {difficulty && (
            <span>Level {difficulty}/5{difficultyBand ? ` · ${difficultyBand}` : ''}</span>
          )}
        </div>
      </header>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Prompt
        </p>
        <p>{prompt}</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Your response
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => void ensureStarted()}
          placeholder="Type your answer here or paste a transcript of what you said aloud..."
          rows={6}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span>{words} words</span>
          {estMinutes && (
            <span>
              Target ~{estMinutes * 120}–{estMinutes * 150} words
            </span>
          )}
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            {busy ? (
              <>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Scoring...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Get feedback
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-100">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
          <p>{error}</p>
        </div>
      )}

      {feedback && (
        <section className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm shadow-emerald-900/5 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100">
          <header className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wide">Feedback</p>
          </header>
          <p className="whitespace-pre-wrap text-xs leading-relaxed">{feedback}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            {onRequestAnotherLikeThis && (
              <button
                type="button"
                onClick={onRequestAnotherLikeThis}
                className="inline-flex items-center gap-1 rounded-2xl border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
              >
                <Sparkles className="h-3 w-3" />
                One more like this
              </button>
            )}
            {onSwitchTopic && (
              <button
                type="button"
                onClick={onSwitchTopic}
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Switch topic
              </button>
            )}
            {submittedOnce && !onRequestAnotherLikeThis && !onSwitchTopic && (
              <span className="text-[11px] text-emerald-800/80 dark:text-emerald-100/80">
                You can adjust your answer and resubmit for another pass.
              </span>
            )}
          </div>
        </section>
      )}
    </article>
  )
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function buildSystemPrompt(coachKey?: CoachKey) {
  const coachLabel = coachKey ? String(coachKey) : 'Polaris Coach'
  return [
    `You are ${coachLabel}, running a short speaking drill.`,
    'Evaluate the learner response and give concise feedback:',
    '- Three wins (what worked well)',
    '- Two fixes (specific improvements)',
    '- One next prompt to continue practice',
    'Use clear, encouraging language. Keep total length under 200 words.',
  ].join(' ')
}

function buildUserContent(title: string, prompt: string, response: string) {
  return `Drill title: ${title}\nPrompt: ${prompt}\n\nMy response:\n${response}`
}

async function safeText(res: Response) {
  try {
    return await res.text()
  } catch {
    return null
  }
}
