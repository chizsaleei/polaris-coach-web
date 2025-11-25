// src/components/app/ChatInterface.tsx
'use client'

import type { ComponentProps } from 'react'
import ChatPanel from './ChatPanel'

export type ChatInterfaceProps = ComponentProps<typeof ChatPanel>

/**
 * ChatInterface
 *
 * Thin wrapper around ChatPanel so other pages can
 * embed the same coach chat experience with a stable name.
 */
export default function ChatInterface(props: ChatInterfaceProps) {
  return <ChatPanel {...props} />
}
