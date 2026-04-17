"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { toEmbedSrc } from "@/lib/video";

export type FeedPost = {
  id: string;
  title: string;
  videoUrl: string;
  ageMin: number;
  ageMax: number;
  score: number;
  tags: string[];
  author: { id: string; username: string };
};

function PostCardInner({ post, index }: { post: FeedPost; index: number }) {
  const embed = toEmbedSrc(post.videoUrl);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.24), duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] ring-1 ring-white/5"
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
              Paste a YouTube watch URL or direct .mp4 link for inline playback.
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export const PostCard = memo(PostCardInner);
