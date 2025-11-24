// src/hooks/use-daily-random.ts
'use client'

import { useMemo } from 'react'

import { DAILY_RANDOM_SEED } from '@/lib/constants'

export interface DailyRandomOptions {
  /** Optional user id to keep picks stable per user */
  userId?: string
  /** Override date (Date or ISO string). Defaults to today (UTC) */
  date?: Date | string
  /** Extra salt for different streams (e.g. 'coach_carousel') */
  salt?: string
}

/**
 * useDailyRandom
 *
 * Deterministic daily RNG helper aligned with the core spec:
 *   seed = hash(user_id + YYYY-MM-DD + DAILY_RANDOM_SEED + salt)
 *
 * Useful for light client-side randomization (e.g. shuffling
 * coach tiles) that stays stable for a user within a day.
 * The server remains source of truth for real drill selection.
 */
export function useDailyRandom(options: DailyRandomOptions = {}) {
  const { userId, date, salt } = options

  return useMemo(() => {
    const dayKey = toDayKey(date)
    const id = userId || 'anon'
    const s = salt || DAILY_RANDOM_SEED
    const seedKey = `${id}:${dayKey}:${s}`
    const seed = hashStringToInt32(seedKey)
    const rng = mulberry32(seed)

    const next = () => rng()

    const pickIndex = (length: number) => {
      if (!Number.isFinite(length) || length <= 0) return -1
      return Math.floor(rng() * length)
    }

    const shuffle = <T,>(input: T[]): T[] => {
      const arr = input.slice()
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }

    return { dayKey, seed, next, pickIndex, shuffle }
  }, [userId, date, salt])
}

function toDayKey(date?: Date | string) {
  let d: Date
  if (!date) d = new Date()
  else if (typeof date === 'string') d = new Date(date)
  else d = date

  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function hashStringToInt32(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  // Force into unsigned 32-bit range
  return hash >>> 0
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return function () {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
