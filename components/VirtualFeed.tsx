"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PostCard, type FeedPost } from "@/components/PostCard";

type FeedResponse = {
  posts: FeedPost[];
  nextOffset: number;
  hasMore: boolean;
};

export function VirtualFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async (offset: number, append: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feed?offset=${offset}&limit=16`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load feed");
      const data = (await res.json()) as FeedResponse;
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setNextOffset(data.nextOffset);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0, false);
  }, [load]);

  useEffect(() => {
    const el = parentRef.current;
    if (!posts.length || !el || !hasMore || loading) return;
    if (el.scrollHeight <= el.clientHeight + 120) {
      void load(nextOffset, true);
    }
  }, [hasMore, load, loading, nextOffset, posts.length]);

  const rowVirtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
    overscan: 4,
  });

  const items = useMemo(() => posts, [posts]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const onScroll = () => {
      if (!hasMore || loading) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 520) {
        void load(nextOffset, true);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, load, loading, nextOffset]);

  if (error) {
    return <p className="text-sm text-rose-300">{error}</p>;
  }

  if (!items.length && loading) {
    return <p className="text-sm text-zinc-500">Curating your tower…</p>;
  }

  if (!items.length) {
    return <p className="text-sm text-zinc-500">No posts yet. Upload a video to seed the network.</p>;
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const post = items[virtualRow.index];
          return (
            <div
              key={post.id}
              className="absolute left-0 top-0 w-full pb-4"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
            >
              <PostCard post={post} index={virtualRow.index} />
            </div>
          );
        })}
      </div>
      {loading && items.length > 0 ? (
        <div className="py-4 text-center text-xs text-zinc-500">Loading next batch…</div>
      ) : null}
    </div>
  );
}
