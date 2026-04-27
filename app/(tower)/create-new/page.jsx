"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function splitTags(raw) {
  return raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [ageMin, setAgeMin] = useState(13);
  const [ageMax, setAgeMax] = useState(17);
  const [tagsRaw, setTagsRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const tags = useMemo(() => splitTags(tagsRaw), [tagsRaw]);

  const handleFileUpload = async (file) => {
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError("File too large. Maximum size is 50MB.");
      return;
    }

    setUploadedFile(file);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setLinkUrl(data.url);
        setError(null);
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, linkUrl, ageMin, ageMax, tags }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not create post");
      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Create a Rack</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Share your thoughts with text, images, or videos. Every post targets an age range and carries 3–10 distinct tags so Tower can route it safely and
          accurately.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-300">Title</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-cyan-400/60"
          />
        </label>
        
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-300">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={6}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60 resize-none"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-zinc-300">Upload File (Image/Video)</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60"
          />
          {uploadedFile && (
            <div className="text-xs text-zinc-500 mt-1">
              Uploaded: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(1)}MB)
            </div>
          )}
        </label>

        {linkUrl && (
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-300">Media URL</span>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Link to uploaded file or external media"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-zinc-300">Minimum age</span>
            <input
              type="number"
              min={1}
              max={120}
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
          <label className="space-y-1">
            <span className="text-zinc-300">Maximum age</span>
            <input
              type="number"
              min={1}
              max={120}
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 focus:border-cyan-400/60"
            />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="text-zinc-300">Tags (comma or newline separated)</span>
          <textarea
            required
            rows={5}
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60"
          />
          <span className="text-xs text-zinc-500">
            Parsed count: {tags.length} (need 3–10 distinct tags)
          </span>
        </label>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 disabled:opacity-50"
        >
          {busy ? "Publishing…" : "Publish Rack"}
        </button>
      </form>
    </motion.div>
  );
}
