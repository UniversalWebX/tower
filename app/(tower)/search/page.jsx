"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (query.trim()) {
      searchContent();
    } else {
      setResults([]);
    }
  }, [query]);

  const searchContent = async () => {
    setLoading(true);
    try {
      // Search posts
      const postsRes = await fetch(`/api/search/posts?q=${encodeURIComponent(query.trim())}`);
      const postsData = postsRes.ok ? await postsRes.json() : [];

      // Search users
      const usersRes = await fetch(`/api/search/users?q=${encodeURIComponent(query.trim())}`);
      const usersData = usersRes.ok ? await usersRes.json() : [];

      setResults({
        posts: postsData.posts || [],
        users: usersData.users || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username) => {
    router.push(`/users/${username}`);
  };

  const handlePostClick = (postId) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-zinc-50 mb-6">Search</h1>
        
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users and posts..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500 text-lg"
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="text-zinc-400">Searching...</div>
          </div>
        )}

        {query.trim() && !loading && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "posts"
                    ? "bg-cyan-600 text-white"
                    : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
              >
                Posts ({results.posts?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "users"
                    ? "bg-cyan-600 text-white"
                    : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
              >
                Users ({results.users?.length || 0})
              </button>
            </div>

            {/* Posts Results */}
            {activeTab === "posts" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-zinc-50 mb-4">Posts</h2>
                {results.posts?.length > 0 ? (
                  results.posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 cursor-pointer hover:bg-zinc-950/80 transition-colors"
                      onClick={() => handlePostClick(post.id)}
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
                      <p className="text-zinc-300 line-clamp-3">
                        {post.content?.substring(0, 200)}
                        {post.content?.length > 200 && "..."}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-zinc-400">No posts found</div>
                  </div>
                )}
              </div>
            )}

            {/* Users Results */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-zinc-50 mb-4">Users</h2>
                {results.users?.length > 0 ? (
                  results.users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 cursor-pointer hover:bg-zinc-950/80 transition-colors"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-zinc-300">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-50 flex items-center gap-1">
                            {user.username}
                            {['darianbayan', 'admin'].includes(user.username) && (
                              <img 
                                src="/modicon.png" 
                                alt="Moderator" 
                                title="Moderator"
                                className="w-4 h-4 inline-block"
                              />
                            )}
                          </h3>
                          <p className="text-sm text-zinc-400">Age: {user.age}</p>
                          {user.bio && (
                            <p className="text-zinc-300 mt-2 line-clamp-2">{user.bio}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-zinc-400">No users found</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
