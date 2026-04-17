"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/create", label: "Upload" },
  { href: "/chats", label: "Chats" },
];

const ADMIN_USERS = ["Admin", "DarianBayan", "TowerAdmin"];

export function TowerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.username);
        }
      } catch (err) {
        // Ignore errors
      }
    }
    getCurrentUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
    router.refresh();
  }

  const isAdmin = currentUser && ADMIN_USERS.includes(currentUser);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="text-sm font-semibold tracking-[0.22em] text-zinc-100">
            TOWER
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/feed" && pathname.startsWith(l.href));
              return (
                <Link key={l.href} href={l.href} className="relative px-3 py-1.5 text-sm font-medium text-zinc-300">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
            {isAdmin && (
              <Link href="/admin" className="relative px-3 py-1.5 text-sm font-medium text-rose-300">
                {pathname === "/admin" && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-rose-500/20 ring-1 ring-rose-500/30"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative">Admin</span>
              </Link>
            )}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
