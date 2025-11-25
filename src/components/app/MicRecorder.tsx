// src/components/app/MicRecorder.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Mic2, Square } from 'lucide-react'

export interface MicRecorderProps {
  onTranscribed?: (text: string) => void
  onError?: (message: string) => void
  labelIdle?: string
  labelRecording?: string
  showTranscript?: boolean
}

/**
 * MicRecorder
 *
 * Small client-side recorder that:
 * - Captures a short audio clip from the mic
 * - Uploads it via /api/upload
 * - Calls /api/transcribe with the uploaded URL
 * - Returns the transcript via onTranscribed
 */
const AUDIO_MIME = 'audio/webm'

export default function MicRecorder({
  onTranscribed,
  onError,
  labelIdle = 'Record answer',
  labelRecording = 'Recording… tap to stop',
  showTranscript = true,
}: MicRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [transcript, setTranscript] = useState<string>('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopInternal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = async () => {
    if (recording || uploading) return
    setError(null)
    setTranscript('')
    setElapsedSec(0)

    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = 'Microphone is not available in this browser.'
      setError(msg)
      onError?.(msg)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream, { mimeType: AUDIO_MIME })
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        void handleRecordingComplete()
      }

      recorder.start()
      setRecording(true)

      const startedAt = Date.now()
      timerRef.current = window.setInterval(() => {
        setElapsedSec(Math.round((Date.now() - startedAt) / 1000))
      }, 1000)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to access microphone. Check browser permissions.'
      setError(msg)
      onError?.(msg)
      stopInternal()
    }
  }

  const stop = () => {
    if (!recording) return
    recorderRef.current?.stop()
    setRecording(false)
    clearTimer()
  }

  const stopInternal = () => {
    try {
      recorderRef.current?.stop()
    } catch {
      // ignore
    }
    recorderRef.current = null
    chunksRef.current = []
    clearTimer()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setRecording(false)
  }

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleRecordingComplete = async () => {
    const blob = new Blob(chunksRef.current, { type: AUDIO_MIME })
    chunksRef.current = []

    if (!blob.size) {
      const msg = 'Recording was too short. Try again.'
      setError(msg)
      onError?.(msg)
      return
    }

    setUploading(true)
    try {
      const url = await uploadBlob(blob)
      const text = await requestTranscript(url)
      setTranscript(text)
      onTranscribed?.(text)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      onError?.(msg)
    } finally {
      setUploading(false)
      stopInternal()
    }
  }

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = elapsedSec % 60

  return (
    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={uploading}
        className={[
          'inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-semibold transition',
          recording
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500',
          uploading ? 'opacity-70 cursor-wait' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {uploading ? (
          <>
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Uploading and transcribing…
          </>
        ) : recording ? (
          <>
            <Square className="h-3.5 w-3.5" />
            {labelRecording}{' '}
            <span className="ml-1 text-[10px] opacity-80">
              {minutes}:{String(seconds).padStart(2, '0')}
            </span>
          </>
        ) : (
          <>
            <Mic2 className="h-3.5 w-3.5" />
            {labelIdle}
          </>
        )}
      </button>

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-300">
          {error}
        </p>
      )}

      {showTranscript && transcript && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Transcript
          </p>
          <p className="whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  )
}

async function uploadBlob(blob: Blob): Promise<string> {
  const path = `sessions/${crypto.randomUUID()}.webm`

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      bucket: 'user-media',
      path,
      content_type: AUDIO_MIME,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const data = await safeJson(res)
    const msg =
      (data && typeof data.message === 'string' && data.message) ||
      `Upload URL request failed (${res.status})`
    throw new Error(msg)
  }

  type UploadSignedUrlResponse = {
    data?: {
      url?: string
      headers?: Record<string, string>
    }
  }
  const json: UploadSignedUrlResponse = await res.json()
  const url: string | undefined = json.data?.url
  const headers: Record<string, string> | undefined = json.data?.headers

  if (!url) {
    throw new Error('Upload URL missing from response.')
  }

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: headers || { 'Content-Type': AUDIO_MIME },
    body: blob,
  })

  if (!putRes.ok) {
    throw new Error(`Uploading audio failed (${putRes.status})`)
  }

  return url
}

async function requestTranscript(url: string): Promise<string> {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, tool: 'mic_recorder' }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const data = await safeJson(res)
    const msg =
      (data && typeof data.message === 'string' && data.message) ||
      `Transcription failed (${res.status})`
    throw new Error(msg)
  }

  type TranscribeResponse = {
    data?: { text?: string }
    text?: string
  }
  const json: TranscribeResponse = await res.json()
  const text: string | undefined = json.data?.text ?? json.text
  if (!text) throw new Error('Transcription returned no text.')
  return text
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
