"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const load = useCallback(async (offset, append) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feed?offset=${offset}&limit=16`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();
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
    load(0, false);
  }, [load]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      load(nextOffset, true);
    }
  }, [hasMore, loading, nextOffset, load]);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Your feed</h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Ranked for your topics and age band, using tag overlap, age fit, and freshness. Posts load in batches and
          virtualize for smooth scrolling.
        </p>
      </motion.div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-zinc-400">Loading...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
          >
            Load more
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4">
          <div className="text-zinc-500">You've reached the end</div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, index }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const content = post.content || '';
  const tagMatch = content.match(/Tags:\s*(.+)/i);
  const postContent = content.replace(/Tags:\s*.+/i, '').trim();
  const tags = tagMatch ? tagMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [];

  const handlePostClick = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 cursor-pointer hover:bg-zinc-950/80 transition-colors"
      onClick={handlePostClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">{post.title}</h3>
          <p className="text-sm text-zinc-400 flex items-center gap-1">
              by {post.author?.username}
              {['darianbayan', 'admin'].includes(post.author?.username) && (
                <img 
                  src="/modicon.png" 
                  alt="Moderator" 
                  title="Moderator"
                  className="w-4 h-4 inline-block"
                />
              )}
            </p>
        </div>
        <div className="text-xs text-zinc-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      {postContent && (
        <div className="mb-4">
          <p className="text-zinc-300">
            {expanded || postContent.length <= 200 
              ? postContent 
              : postContent.substring(0, 200) + '...'
            }
            {postContent.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-cyan-400 hover:text-cyan-300 ml-2"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
        </div>
      )}

      {post.linkUrl && (
        <div className="mb-4">
          {post.linkUrl.includes('/uploads/') ? (
            post.linkUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={post.linkUrl} 
                alt="Post image" 
                className="w-full rounded-lg max-h-64 object-cover"
              />
            ) : (
              <video 
                src={post.linkUrl} 
                controls 
                className="w-full rounded-lg max-h-64"
              />
            )
          ) : (
            <a 
              href={post.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {post.linkUrl}
            </a>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <div>Age: {post.ageMin}-{post.ageMax}</div>
        <div>Score: {post.score ? post.score.toFixed(2) : 'N/A'}</div>
      </div>
    </motion.div>
  );
}
