"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      window.location.assign("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="tower-enter space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-400">Sign in to Tower.</p>
        </div>
        <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-300">Username</span>
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-300">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          New here?{" "}
          <Link className="text-cyan-300 hover:text-cyan-200" href="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
