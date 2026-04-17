"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toEmbedSrc } from "@/lib/video";

type Post = {
  id: string;
  title: string;
  videoUrl?: string;
  ageMin: number;
  ageMax: number;
  createdAt: string;
  tags: string[];
  author: { id: string; username: string };
};

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            setError("Post not found");
          } else {
            setError("Failed to load post");
          }
          return;
        }
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError("Error loading post");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowDropdown(false);
    // You could add a toast notification here
  };

  const handleDelete = async () => {
    if (!post) return;
    
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        router.push("/feed");
        router.refresh();
      } else {
        setError("Failed to delete post");
      }
    } catch (err) {
      setError("Error deleting post");
    }
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-5.5rem)] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-[calc(100vh-5.5rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-rose-300">{error || "Post not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const embed = post.videoUrl ? toEmbedSrc(post.videoUrl) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header with actions */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="rounded-full bg-white/5 px-3 py-1 font-medium text-zinc-200">
                @{post.author.username}
              </span>
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-violet-200">
                Ages {post.ageMin}–{post.ageMax}
              </span>
              <span className="text-zinc-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Three-dot dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-white/10 bg-zinc-900 py-2 shadow-xl">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Share post
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-zinc-800"
                >
                  Delete post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-black/40 px-3 py-1 text-sm text-zinc-300 ring-1 ring-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Video/Content */}
        {embed ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
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
              <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-zinc-500">
                Invalid video URL format.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-dashed border-white/20 bg-black/20">
            <div className="flex aspect-[16/9] items-center justify-center px-4 text-center text-sm text-zinc-500">
              <div>
                <p className="mb-2">Text-only post</p>
                <p className="text-xs">No video content attached</p>
              </div>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="pt-4">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-zinc-800 px-6 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            ← Back to feed
          </button>
        </div>
      </motion.div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
