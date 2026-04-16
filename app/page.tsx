import Link from "next/link";
import { LandingMotion } from "@/components/LandingMotion";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20">
        <LandingMotion />
        <div className="mt-10 flex flex-wrap gap-3">
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
