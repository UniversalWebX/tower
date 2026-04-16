import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20">
        <div className="space-y-6">
          <p className="tower-enter text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">Tower</p>
          <h1 className="tower-enter tower-enter-delay-1 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Video that climbs to the right people — by tags, topics, and age.
          </h1>
          <p className="tower-enter tower-enter-delay-2 max-w-2xl text-base leading-relaxed text-zinc-400">
            On signup you choose five topics; every upload carries 7–30 tags and an explicit age band. The feed ranks a
            large candidate pool in one query, then scores in-memory for overlap, age affinity, and freshness. Chats batch
            inserts for group and DM traffic, and the interface stays dark, animated, and motion-respecting.
          </p>
        </div>
        <div className="tower-enter tower-enter-delay-3 mt-10 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            Sign in
          </Link>
          <Link href="/feed" className="rounded-full px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200">
            Open feed →
          </Link>
        </div>
      </main>
    </div>
  );
}
