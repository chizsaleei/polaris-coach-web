// src/lib/openai/client.ts
// Server-only OpenAI helper used by API routes.

import 'server-only'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'

type OpenAIErrorResponse = {
  error?: {
    message?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set; cannot call OpenAI')
  }
  return apiKey
}

function openAIUrl(path: string): string {
  const base = process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const apiKey = getApiKey()
  const res = await fetch(openAIUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let message = `OpenAI request failed with status ${res.status}`
    try {
      const errJson = (await res.json()) as OpenAIErrorResponse
      if (errJson?.error?.message) {
        message = `OpenAI error: ${errJson.error.message}`
      }
    } catch {
      // ignore JSON parse failures, keep default message
    }
    throw new Error(message)
  }

  return (await res.json()) as T
}

/**
 * Content parts for chat completions when the API returns
 * an array of content segments instead of a single string.
 */
type ChatContentPart =
  | string
  | {
      type?: string
      text?: string
      [key: string]: unknown
    }

type ChatCompletionMessageContent = string | ChatContentPart[]

type ChatCompletionMessage = {
  content?: ChatCompletionMessageContent | null
}

type ChatCompletionResponse = {
  choices: { message?: ChatCompletionMessage | null }[]
}

/** Simple chat completion helper for server-side use. */
export async function chatComplete({
  messages,
  model = process.env.OPENAI_CHAT_MODEL || 'gpt-5.1',
  temperature = 0.3,
  maxTokens = 700,
}: {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
}): Promise<string> {
  const data = await postJson<ChatCompletionResponse>('/chat/completions', {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  })

  const choice = data.choices[0]
  const content = choice?.message?.content

  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((part: ChatContentPart) => {
        if (typeof part === 'string') return part

        if (typeof part.text === 'string') {
          return part.text
        }

        // Some HTTP variants nest text as text.value
        const nested = (part as { text?: { value?: string } }).text
        if (nested && typeof nested.value === 'string') {
          return nested.value
        }

        return ''
      })
      .join('')
      .trim()
  }

  return ''
}

type EmbeddingResult = {
  embedding: number[]
}

type EmbeddingResponse = {
  data: EmbeddingResult[]
}

/** Embeddings helper for search and recommendations. */
export async function embedStrings({
  inputs,
  model = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
}: {
  inputs: string[] // keep strings < 8k tokens each
  model?: string
}): Promise<number[][]> {
  const data = await postJson<EmbeddingResponse>('/embeddings', {
    model,
    input: inputs,
  })

  return data.data.map((d: EmbeddingResult) => d.embedding)
}

type TtsFormat = 'mp3' | 'wav' | 'opus'

/** TTS helper. Your API route can call this and stream the audio. */
export async function tts({
  input,
  voice = process.env.OPENAI_TTS_VOICE || 'alloy',
  format = 'mp3',
  model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
}: {
  input: string
  voice?: string
  format?: TtsFormat
  model?: string
}): Promise<ArrayBuffer> {
  const apiKey = getApiKey()
  const body: Record<string, unknown> = {
    model,
    voice,
    input,
  }

  // OpenAI HTTP API uses response_format for non default formats
  if (format && format !== 'mp3') {
    body.response_format = format
  }

  const res = await fetch(openAIUrl('/audio/speech'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let message = `OpenAI TTS request failed with status ${res.status}`
    try {
      const errJson = (await res.json()) as OpenAIErrorResponse
      if (errJson?.error?.message) {
        message = `OpenAI TTS error: ${errJson.error.message}`
      }
    } catch {
      // ignore JSON parse failures
    }
    throw new Error(message)
  }

  // Return raw ArrayBuffer so callers can decide how to stream or encode.
  return res.arrayBuffer()
}
