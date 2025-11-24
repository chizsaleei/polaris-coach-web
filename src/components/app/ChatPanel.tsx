"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

type ChatPanelProps = {
  userId: string;
  userName?: string | null;
  starterPrompts?: string[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export default function ChatPanel({ userId, userName, starterPrompts = [] }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${userName?.split(" ")[0] || "there"}! I can run quick drills, summarize transcripts, or role-play tricky scenarios. What would you like to practice?`,
      createdAt: Date.now(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const historyPayload = useCallback(
    (nextContent?: string) =>
      [...messages, ...(nextContent ? [{ role: "user" as const, content: nextContent }] : [])].map(
        (msg) => ({ role: msg.role, content: msg.content }),
      ),
    [messages],
  );

  const sendMessage = useCallback(
    async (contentOverride?: string) => {
      if (busy) return;
      const trimmed = (contentOverride ?? input).trim();
      if (!trimmed) return;

      setInput("");
      setError(null);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setBusy(true);

      try {
        const payload = {
          userId,
          messages: historyPayload(trimmed),
        };

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });

        if (!response.ok) {
          const text = await safeText(response);
          throw new Error(text || `Chat request failed (${response.status})`);
        }

        const data = await response.json();
        const replyText =
          data?.reply ||
          data?.content ||
          data?.message ||
          data?.choices?.[0]?.message?.content ||
          "";
        if (!replyText) {
          throw new Error("The coach sent an empty reply. Try again.");
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: replyText,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error("[chat] send failed", err);
        setError(err instanceof Error ? err.message : "Unable to send message.");
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        setInput(trimmed);
      } finally {
        setBusy(false);
      }
    },
    [busy, historyPayload, input, userId],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const quickPrompts = useMemo(() => starterPrompts.filter(Boolean).slice(0, 4), [starterPrompts]);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:bg-[#04121B]">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coach chat</p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Practice with your AI coach</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Ask for drills, role-play scenarios, or get follow-up explanations. Sessions clear when you leave the page.
        </p>
      </header>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/20">
        <div className="h-[420px] overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#042838] text-white"
                    : "bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {quickPrompts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {quickPrompts.map((prompt, index) => (
            <button
              key={`${prompt}-${index}`}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</label>
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask for a 3-minute listening drill or paste a transcript for feedback..."
            rows={3}
            className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-800 shadow-inner outline-none transition focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0EA5E9] text-white transition hover:bg-[#0284C7] disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </article>
  );
}

async function safeText(response: Response) {
  try {
    return await response.text();
  } catch {
    return null;
  }
}
