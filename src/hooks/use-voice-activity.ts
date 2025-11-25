'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseVoiceActivityOptions {
  /** Smoothing for analyser (0 to 1). Default 0.8 */
  smoothing?: number
  /** RMS threshold (0 to 1) above which we treat as active speech. Default 0.08 */
  threshold?: number
  /** Milliseconds above threshold before marking active. Default 120 ms */
  activationTimeMs?: number
  /** Milliseconds below threshold before marking inactive. Default 250 ms */
  deactivationTimeMs?: number
  /** Optional callback on each sample with the current level (0 to 1) */
  onLevelChange?: (level: number) => void
}

export interface VoiceActivityState {
  /** Current RMS level 0 to 1 (for UI meters and rings) */
  level: number
  /** True when voice has been above threshold long enough */
  isActive: boolean
  /** Peak RMS level seen since this stream started */
  peak: number
  /** Timestamp in ms (performance.now) when speech was last detected */
  lastSpokeAt: number | null
}

/**
 * useVoiceActivity
 *
 * Lightweight browser side voice activity detector using Web Audio.
 * This is a UI helper hook only. It never talks to Polaris Core and
 * does not enforce timers or minutes. The server stays source of truth.
 *
 * Pass in a MediaStream (mic or remote audio) and get:
 *   - level 0 to 1: current RMS, good for waveforms or rings
 *   - isActive: debounced speaking flag based on RMS threshold
 *   - peak: highest level seen for this stream
 *   - lastSpokeAt: performance.now timestamp or null
 *
 * Example:
 *   const [stream, setStream] = useState<MediaStream | null>(null)
 *   const { level, isActive } = useVoiceActivity(stream)
 */
export function useVoiceActivity(
  stream: MediaStream | null,
  options: UseVoiceActivityOptions = {},
): VoiceActivityState {
  const [level, setLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [peak, setPeak] = useState(0)
  const [lastSpokeAt, setLastSpokeAt] = useState<number | null>(null)

  const {
    smoothing = 0.8,
    threshold = 0.08,
    activationTimeMs = 120,
    deactivationTimeMs = 250,
    onLevelChange,
  } = options

  // Internal refs to avoid effect restarts when isActive changes
  const activeSinceRef = useRef<number | null>(null)
  const inactiveSinceRef = useRef<number | null>(null)
  const isActiveRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!stream) {
      // Reset state when there is no stream
      setLevel(0)
      setIsActive(false)
      setPeak(0)
      setLastSpokeAt(null)
      activeSinceRef.current = null
      inactiveSinceRef.current = null
      isActiveRef.current = false
      return
    }

    let audioContext: AudioContext | null = null
    let sourceNode: MediaStreamAudioSourceNode | null = null
    let analyserNode: AnalyserNode | null = null
    let animationFrameId: number | null = null

    const sample = () => {
      if (!analyserNode) return

      const bufferLength = analyserNode.fftSize
      const timeDomainData = new Uint8Array(bufferLength)
      analyserNode.getByteTimeDomainData(timeDomainData)

      // Compute RMS from time domain samples, normalized 0 to 1
      let sumSquares = 0
      for (let index = 0; index < bufferLength; index += 1) {
        const sampleValue = (timeDomainData[index] - 128) / 128
        sumSquares += sampleValue * sampleValue
      }
      const rms = Math.sqrt(sumSquares / bufferLength)

      setLevel(rms)
      setPeak((prev) => (rms > prev ? rms : prev))
      if (onLevelChange) onLevelChange(rms)

      const now = performance.now()
      const aboveThreshold = rms >= threshold

      if (aboveThreshold) {
        // Reset inactivity timer
        inactiveSinceRef.current = null

        if (!isActiveRef.current) {
          // Not yet marked active, start or check activation window
          if (activeSinceRef.current == null) {
            activeSinceRef.current = now
          } else if (now - activeSinceRef.current >= activationTimeMs) {
            isActiveRef.current = true
            setIsActive(true)
            setLastSpokeAt(now)
          }
        } else {
          // Already active, just keep lastSpokeAt fresh
          setLastSpokeAt(now)
        }
      } else {
        // Below threshold, reset activation timer
        activeSinceRef.current = null

        if (isActiveRef.current) {
          // Was active, check if we have been quiet long enough
          if (inactiveSinceRef.current == null) {
            inactiveSinceRef.current = now
          } else if (now - inactiveSinceRef.current >= deactivationTimeMs) {
            isActiveRef.current = false
            setIsActive(false)
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(sample)
    }

    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as Window & {
          webkitAudioContext?: typeof AudioContext
        }).webkitAudioContext

      if (!AudioContextCtor) {
        throw new Error('AudioContext not supported')
      }

      audioContext = new AudioContextCtor()
      sourceNode = audioContext.createMediaStreamSource(stream)
      analyserNode = audioContext.createAnalyser()

      analyserNode.fftSize = 2048
      analyserNode.smoothingTimeConstant = smoothing

      sourceNode.connect(analyserNode)

      // Reset timers for a fresh stream
      activeSinceRef.current = null
      inactiveSinceRef.current = null
      isActiveRef.current = false
      setIsActive(false)
      setLevel(0)
      setPeak(0)
      setLastSpokeAt(null)

      animationFrameId = window.requestAnimationFrame(sample)
    } catch {
      // If AudioContext or nodes fail, fall back to idle state
      setLevel(0)
      setIsActive(false)
      setPeak(0)
      setLastSpokeAt(null)
    }

    return () => {
      if (animationFrameId != null) {
        window.cancelAnimationFrame(animationFrameId)
      }
      try {
        sourceNode?.disconnect()
      } catch {
        // ignore
      }
      try {
        analyserNode?.disconnect()
      } catch {
        // ignore
      }
      if (audioContext) {
        void audioContext.close().catch(() => {
          // ignore close errors
        })
      }
    }
  }, [stream, smoothing, threshold, activationTimeMs, deactivationTimeMs, onLevelChange])

  return { level, isActive, peak, lastSpokeAt }
}
