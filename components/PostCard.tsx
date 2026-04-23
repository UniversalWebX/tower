"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toEmbedSrc } from "@/lib/video";

export type FeedPost = {
  id: string;
  title: string;
  videoUrl?: string;
  ageMin: number;
  ageMax: number;
  score: number;
  tags: string[];
  author: { id: string; username: string };
};

function PostCardInner({ post, index }: { post: FeedPost; index: number }) {
  const router = useRouter();
  const embed = post.videoUrl ? toEmbedSrc(post.videoUrl) : null;
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleClick = () => {
    router.push(`/posts/${post.id}`);
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`);
      alert('Post link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
    setShowShareMenu(false);
  };

  const shareToUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    const username = prompt('Enter username to share this post with:');
    if (username) {
      // Here you could implement a direct share functionality
      alert(`Post shared to ${username}! (Feature coming soon)`);
    }
    setShowShareMenu(false);
  };

  const toggleShareMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  return (
    <motion.article
      layout
        initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.24), duration: 0.35 }}
      onClick={handleClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] ring-1 ring-white/5 cursor-pointer hover:border-cyan-400/30"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-px bg-gradient-to-br from-violet-500/15 via-transparent to-cyan-400/10" />
      </div>
      <div className="relative grid gap-3 p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="rounded-full bg-white/5 px-2 py-0.5 font-medium text-zinc-200">@{post.author.username}</span>
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-200">
              Ages {post.ageMin}–{post.ageMax}
            </span>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-cyan-200">rank {post.score.toFixed(1)}</span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-50">{post.title}</h2>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 14).map((t) => (
              <span key={t} className="rounded-md bg-black/40 px-2 py-0.5 text-[11px] text-zinc-300 ring-1 ring-white/10">
                #{t}
              </span>
            ))}
            {post.tags.length > 14 ? (
              <span className="text-[11px] text-zinc-500">+{post.tags.length - 14} tags</span>
            ) : null}
          </div>
        </div>
        {embed ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {embed.kind === "youtube" ? (
              <iframe
                title={post.title}
                className="aspect-video w-full"
                src={embed.src}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : embed.kind === "video" ? (
              <video className="aspect-video w-full" controls preload="metadata" src={embed.src} />
            ) : (
              <div className="flex aspect-video items-center justify-center px-4 text-center text-xs text-zinc-500">
                Invalid video URL format.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-dashed border-white/20 bg-black/20">
            <div className="flex aspect-video items-center justify-center px-4 text-center text-xs text-zinc-500">
              Text-only post
            </div>
          </div>
        )}
      </div>
      {/* Share dropdown menu */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={toggleShareMenu}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
          </svg>
        </button>
        {showShareMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg z-50">
            <div className="p-2">
              <button
                onClick={copyToClipboard}
                className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 rounded-md text-zinc-700"
              >
                <span className="mr-2">Copy Link</span>
              </button>
              <button
                onClick={shareToUser}
                className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 rounded-md text-zinc-700"
              >
                <span className="mr-2">Share to User</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export const PostCard = memo(PostCardInner);
