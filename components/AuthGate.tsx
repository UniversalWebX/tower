"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/me", { cache: "no-store", credentials: "include" });
      if (cancelled) return;
      let data: { user?: unknown } = {};
      try {
        data = (await res.json()) as { user?: unknown };
      } catch {
        data = {};
      }
      if (!data?.user) {
        router.replace("/login");
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="h-10 w-10 tower-spin" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return <>{children}</>;
}
