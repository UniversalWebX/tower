"use client";

import { useState } from "react";
import Link from "next/link";

const emptyTopics = () => ["", "", "", "", ""];

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(18);
  const [topics, setTopics] = useState(emptyTopics);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function setTopic(i: number, v: string) {
    setTopics((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, age, topics }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      window.location.assign("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <div className="tower-enter space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Join Tower</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Pick five topics you care about — the feed matches tags on each post to these interests, then layers in your
            age and how fresh the post is.
          </p>
        </div>
        <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-300">Username</span>
            <input
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-300">Password</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-300">Your age</span>
            <input
              type="number"
              min={13}
              max={120}
              required
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
          <div className="space-y-2">
            <p className="text-sm text-zinc-300">Five topics you like</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {topics.map((t, i) => (
                <input
                  key={i}
                  required
                  value={t}
                  onChange={(e) => setTopic(i, e.target.value)}
                  placeholder={`Topic ${i + 1}`}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-violet-400/60"
                />
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link className="text-cyan-300 hover:text-cyan-200" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
