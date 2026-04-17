"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; username: string };
};

export default function ChatRoomPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [older, setOlder] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [batch, setBatch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadLatest = useCallback(async () => {
    const res = await fetch(`/api/chats/${chatId}/messages`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { messages: Msg[]; nextCursor: string | null };
    setMessages((prev) => {
      const incoming = data.messages;
      if (!prev.length) return incoming;
      const map = new Map<string, Msg>();
      for (const m of prev) map.set(m.id, m);
      for (const m of incoming) map.set(m.id, m);
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
    setOlder(data.nextCursor);
  }, [chatId]);

  const loadOlder = useCallback(async () => {
    if (!older) return;
    const res = await fetch(`/api/chats/${chatId}/messages?cursor=${encodeURIComponent(older)}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { messages: Msg[]; nextCursor: string | null };
    setMessages((prev) => {
      const map = new Map<string, Msg>();
      for (const m of data.messages) map.set(m.id, m);
      for (const m of prev) map.set(m.id, m);
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
    setOlder(data.nextCursor);
  }, [chatId, older]);

  useEffect(() => {
    void loadLatest();
  }, [loadLatest]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadLatest();
    }, 4000);
    return () => clearInterval(id);
  }, [loadLatest]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendOne(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text.trim() }),
    });
    if (res.ok) {
      setText("");
      void loadLatest();
    }
  }

  async function sendBatch() {
    const lines = batch
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bodies: lines }),
    });
    if (res.ok) {
      setBatch("");
      void loadLatest();
    }
  }

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-50">Room</h1>
        {older ? (
          <button
            type="button"
            className="text-xs text-cyan-300 hover:text-cyan-200"
            onClick={() => void loadOlder()}
          >
            Load older (batched)
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl bg-black/35 px-3 py-2 text-sm ring-1 ring-white/5"
            >
              <p className="text-xs text-zinc-500">
                @{m.sender.username}{" "}
                <span className="text-zinc-600">{new Date(m.createdAt).toLocaleTimeString()}</span>
              </p>
              <p className="text-zinc-100">{m.body}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      <form onSubmit={(e) => void sendOne(e)} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-zinc-100 focus:border-violet-400/60"
          placeholder="Message…"
        />
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Send
        </button>
      </form>
      <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 p-3">
        <p className="mb-2 text-xs text-zinc-400">Batch send (one line per message, up to 24)</p>
        <textarea
          rows={3}
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="mb-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100"
        />
        <button
          type="button"
          onClick={() => void sendBatch()}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 hover:bg-white/10"
        >
          Send batch
        </button>
      </div>
    </div>
  );
}
