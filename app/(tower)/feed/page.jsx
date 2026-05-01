"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);
  const debounceTimerRef = useRef(null);

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

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      load(nextOffset, true);
    }
  }, [hasMore, loading, nextOffset, load]);

  // Debounced load more function
  const debouncedLoadMore = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (hasMore && !loading) {
        load(nextOffset, true);
      }
    }, 300);
  }, [hasMore, loading, nextOffset, load]);

  useEffect(() => {
    load(0, false);
  }, [load]);

  return (
    <div className="space-y-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: 0
            }}
            animate={{
              x: [Math.random() * 100, Math.random() * 100],
              y: [Math.random() * 100, Math.random() * 100],
              scale: [0, 1, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-1 relative z-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
          Your feed
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400 animate-pulse">
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center py-4"
        >
          <div className="inline-flex items-center space-x-2 text-zinc-400">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping animation-delay-200"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping animation-delay-400"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-center py-4"
        >
          <div className="text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-2 inline-block">
            {error}
          </div>
        </motion.div>
      )}

      {hasMore && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center py-4"
        >
          <motion.button
            onClick={loadMore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 text-white rounded-lg hover:from-cyan-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Load more
          </motion.button>
        </motion.div>
      )}

      {!hasMore && posts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-4"
        >
          <div className="text-zinc-500 bg-zinc-800/30 rounded-lg px-4 py-2 inline-block border border-zinc-700/50">
            🎉 You've reached the end
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Optimized PostCard component with React.memo
const PostCard = memo(({ post, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const router = useRouter();

  // Memoize expensive computations
  const contentData = useMemo(() => {
    const content = post.content || '';
    const tagMatch = content.match(/Tags:\s*(.+)/i);
    const postContent = content.replace(/Tags:\s*.+/i, '').trim();
    const tags = tagMatch ? tagMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [];
    return { postContent, tags };
  }, [post.content]);

  const handlePostClick = useCallback(() => {
    router.push(`/posts/${post.id}`);
  }, [router, post.id]);

  const handleReport = useCallback(async () => {
    if (!reportReason.trim() || !reportDescription.trim()) {
      setReportError("Please fill in all fields");
      return;
    }

    setReportLoading(true);
    setReportError("");
    setReportSuccess("");

    try {
      const res = await fetch('/api/storey/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUserId: post.authorId,
          reason: reportReason,
          description: reportDescription
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReportError(data.error || "Failed to submit report");
        return;
      }

      setReportSuccess("Report submitted successfully");
      setTimeout(() => {
        setShowReportModal(false);
        setReportReason("");
        setReportDescription("");
        setReportSuccess("");
      }, 2000);

    } catch (error) {
      console.error('Report failed:', error);
      setReportError("Something went wrong. Please try again.");
    } finally {
      setReportLoading(false);
    }
  }, [post.authorId, reportReason, reportDescription]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: Math.min(index * 0.03, 0.3), 
        duration: 0.4, 
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(6, 182, 212, 0.1)",
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950/80 via-zinc-900/60 to-zinc-950/80 p-6 cursor-pointer backdrop-blur-sm relative overflow-hidden group"
      onClick={handlePostClick}
      style={{ willChange: 'transform' }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: -100 }}
        whileHover={{ x: 100 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "200%" }}
      />
      
      <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
            {post.title}
          </h3>
          <p className="text-sm text-zinc-400 flex items-center gap-1">
              by 
              <span className="text-cyan-400 font-medium">{post.author?.username}</span>
              {['darianbayan', 'admin'].includes(post.author?.username) && (
                <motion.img 
                  src="/modicon.png" 
                  alt="Moderator" 
                  title="Moderator"
                  className="w-4 h-4 inline-block"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              )}
              {post.author?.hasStoreySubscription && (
                <motion.img 
                  src="/storeyicon.png" 
                  alt="Storey" 
                  title="Storey Subscriber"
                  className="w-4 h-4 inline-block"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 4 }}
                />
              )}
            </p>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-full border border-zinc-700/50"
        >
          {new Date(post.createdAt).toLocaleDateString()}
        </motion.div>
      </div>

      {contentData.postContent && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="mb-4"
        >
          <p className="text-zinc-300 leading-relaxed">
            {expanded || contentData.postContent.length <= 200 
              ? contentData.postContent 
              : contentData.postContent.substring(0, 200) + '...'
            }
            {contentData.postContent.length > 200 && (
              <motion.button
                onClick={() => setExpanded(!expanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-cyan-400 hover:text-cyan-300 ml-2 font-medium underline decoration-2 underline-offset-2"
              >
                {expanded ? 'Show less' : 'Show more'}
              </motion.button>
            )}
          </p>
        </motion.div>
      )}

      {post.linkUrl && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="mb-4"
        >
          {post.linkUrl.includes('/uploads/') ? (
            post.linkUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <div className="relative">
                {!imageLoaded && (
                  <div className="w-full rounded-lg max-h-64 bg-zinc-800 animate-pulse flex items-center justify-center">
                    <div className="text-zinc-500">Loading image...</div>
                  </div>
                )}
                <motion.img 
                  src={post.linkUrl} 
                  alt="Post image" 
                  className={`w-full rounded-lg max-h-64 object-cover shadow-lg hover:shadow-xl transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  whileHover={{ scale: 1.02 }}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </div>
            ) : (
              <motion.video 
                src={post.linkUrl} 
                controls 
                className="w-full rounded-lg max-h-64 shadow-lg"
                whileHover={{ scale: 1.02 }}
                preload="metadata"
              />
            )
          ) : (
            <motion.a 
              href={post.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline decoration-2 underline-offset-2 inline-flex items-center gap-1 bg-cyan-900/20 px-3 py-1 rounded-lg border border-cyan-800/30"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(6, 182, 212, 0.3)" }}
            >
              🔗 {post.linkUrl}
            </motion.a>
          )}
        </motion.div>
      )}

      {contentData.tags.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          className="flex flex-wrap gap-2"
        >
          {contentData.tags.map((tag, tagIndex) => (
            <motion.span
              key={tagIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5 + tagIndex * 0.05 }}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(6, 182, 212, 0.2)" }}
              className="px-3 py-1 bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-300 text-xs rounded-full border border-zinc-600/50 cursor-pointer hover:border-cyan-600/50 transition-all duration-200"
            >
              #{tag}
            </motion.span>
          ))}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.6 }}
        className="mt-4 flex items-center justify-between text-xs text-zinc-500 bg-zinc-800/30 rounded-lg px-3 py-2 border border-zinc-700/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400">👥</span>
          <span>Age: {post.ageMin}-{post.ageMax}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">⭐</span>
          <span>Score: {post.score ? post.score.toFixed(2) : 'N/A'}</span>
        </div>
      </motion.div>

      {/* Report button for Storey subscribers */}
      <div className="mt-4 flex justify-end">
        <motion.button
          onClick={() => setShowReportModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1 bg-red-900/50 text-red-400 text-xs rounded-lg border border-red-800/50 hover:bg-red-900/70 transition-all duration-200"
        >
          🚨 Report
        </motion.button>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 rounded-2xl border border-white/10 p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-zinc-50 mb-4">
                Report User
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="tos_violation">TOS Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please describe the issue..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              {reportError && (
                <div className="mt-4 bg-red-900/50 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                  {reportError}
                </div>
              )}

              {reportSuccess && (
                <div className="mt-4 bg-green-900/50 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
                  {reportSuccess}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <motion.button
                  onClick={() => setShowReportModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleReport}
                  disabled={reportLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
});
