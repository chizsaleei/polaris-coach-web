// src/hooks/use-session-timer.ts
'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseSessionTimerOptions {
  /** Start immediately on mount (default false) */
  autoStart?: boolean
  /** Soft target in minutes for UI hints only (server owns real limits) */
  targetMinutes?: number
}

/**
 * useSessionTimer
 *
 * Lightweight client timer for drills and live sessions.
 * - Server remains source of truth for minute accounting and gates.
 * - This hook is only for UX: showing elapsed time and soft targets.
 */
export function useSessionTimer(options: UseSessionTimerOptions = {}) {
  const { autoStart = false, targetMinutes } = options

  const [elapsedSec, setElapsedSec] = useState(0)
  const [running, setRunning] = useState(autoStart)
  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return

    if (!startedAtRef.current) {
      startedAtRef.current = Date.now() - elapsedSec * 1000
    }

    timerRef.current = window.setInterval(() => {
      if (!startedAtRef.current) return
      const diff = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))
      setElapsedSec(diff)
    }, 1000)

    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [running])

  useEffect(() => {
    if (!autoStart) return
    setRunning(true)
  }, [])

  const start = () => {
    if (running) return
    setRunning(true)
  }

  const pause = () => {
    setRunning(false)
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    startedAtRef.current = null
  }

  const reset = () => {
    pause()
    setElapsedSec(0)
  }

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = elapsedSec % 60

  const formatted = `${minutes}:${String(seconds).padStart(2, '0')}`

  const overTarget =
    typeof targetMinutes === 'number' && targetMinutes > 0
      ? elapsedSec >= targetMinutes * 60
      : false

  return {
    elapsedSec,
    running,
    minutes,
    seconds,
    formatted,
    overTarget,
    start,
    pause,
    reset,
  }
}
