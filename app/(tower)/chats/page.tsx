"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type ChatRow = {
  id: string;
  type: string;
  title: string;
  members: { id: string; username: string }[];
  lastMessage: { body: string; at: string; from: string } | null;
};

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [gname, setGname] = useState("");
  const [gmembers, setGmembers] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/chats", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { chats: ChatRow[] };
    setChats(data.chats);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setUsers([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/users?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { users: { id: string; username: string }[] };
      setUsers(data.users);
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  async function startDm(userId: string) {
    setError(null);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "DM", userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not start chat");
      return;
    }
    window.location.href = `/chats/${data.id as string}`;
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const memberUsernames = gmembers
      .split(/[\n,]+/g)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "GROUP", name: gname, memberUsernames }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not create group");
      return;
    }
    setGname("");
    setGmembers("");
    window.location.href = `/chats/${data.id as string}`;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h1 className="text-2xl font-semibold text-zinc-50">Chats</h1>
        <p className="text-sm text-zinc-400">Direct messages and group rooms stay batched on the server for fast sends.</p>
        <ul className="space-y-2">
          {chats.map((c, i) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
            >
              <Link
                href={`/chats/${c.id}`}
                className="block rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 transition hover:border-cyan-400/40 hover:bg-zinc-900/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-100">{c.title}</p>
                    <p className="text-xs text-zinc-500">
                      {c.type === "GROUP" ? `${c.members.length} members` : "Direct message"}
                    </p>
                  </div>
                  {c.lastMessage ? (
                    <p className="max-w-[46%] truncate text-right text-xs text-zinc-400">{c.lastMessage.body}</p>
                  ) : null}
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
        {!chats.length ? <p className="text-sm text-zinc-500">No conversations yet.</p> : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950/50 p-5"
      >
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200">Message someone</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search username"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-violet-400/60"
          />
          <ul className="max-h-48 space-y-1 overflow-auto text-sm">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2 rounded-lg bg-black/30 px-2 py-1">
                <span className="text-zinc-200">@{u.username}</span>
                <button
                  type="button"
                  className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-100 hover:bg-white/15"
                  onClick={() => void startDm(u.id)}
                >
                  DM
                </button>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={(e) => void createGroup(e)} className="space-y-3 border-t border-white/10 pt-4">
          <h2 className="text-sm font-semibold text-zinc-200">New group</h2>
          <input
            required
            value={gname}
            onChange={(e) => setGname(e.target.value)}
            placeholder="Group name"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
          />
          <textarea
            required
            rows={3}
            value={gmembers}
            onChange={(e) => setGmembers(e.target.value)}
            placeholder="Other members’ usernames (comma or newline). You are added automatically."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100"
          />
          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-full bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Create group chat
          </button>
        </form>
      </motion.div>
    </div>
  );
}
