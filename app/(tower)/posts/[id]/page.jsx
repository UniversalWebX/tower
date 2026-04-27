"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const [user, setUser] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    loadPost();
    loadUser();
  }, [postId]);

  const loadUser = async () => {
    try {
      const res = await fetch('/api/auth/login');
      if (res.ok) {
        const userData = await res.json();
        if (!userData.suspended) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const postData = await res.json();
        setPost(postData);
        
        // Load user's vote state
        if (user) {
          const voteRes = await fetch(`/api/posts/${postId}/vote`);
          if (voteRes.ok) {
            const voteData = await voteRes.json();
            setUserVote(voteData.vote);
          }
        }
      } else {
        setError('Post not found');
      }
    } catch (error) {
      setError('Error loading post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        const data = await res.json();
        loadPost(); // Reload post to get updated likes
        setUserVote(data.action === 'removed' ? null : { type: 'like' });
      } else {
        setError('Error liking post');
      }
    } catch (error) {
      setError('Error liking post');
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(`/api/posts/${postId}/dislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        const data = await res.json();
        loadPost(); // Reload post to get updated dislikes
        setUserVote(data.action === 'removed' ? null : { type: 'dislike' });
      } else {
        setError('Error disliking post');
      }
    } catch (error) {
      setError('Error disliking post');
    }
  };

  const handleRepost = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        router.push('/feed');
      }
    } catch (error) {
      setError('Error reposting');
    }
  };

  const handleReply = async () => {
    if (!user || !replyContent.trim()) return;
    
    setReplying(true);
    try {
      const res = await fetch(`/api/posts/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim() })
      });
      
      if (res.ok) {
        setReplyContent('');
        loadPost(); // Reload post to show new reply
      } else {
        setError('Error posting reply');
      }
    } catch (error) {
      setError('Error posting reply');
    } finally {
      setReplying(false);
    }
  };

  const deletePost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        router.push('/feed');
      } else {
        setError('Error deleting post');
      }
    } catch (error) {
      setError('Error deleting post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-400">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-rose-400">{error || 'Post not found'}</div>
      </div>
    );
  }

  const content = post.content || '';
  const tagMatch = content.match(/Tags:\s*(.+)/i);
  const postContent = content.replace(/Tags:\s*.+/i, '').trim();
  const tags = tagMatch ? tagMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-zinc-300 mb-4 flex items-center gap-2"
        >
          ← Back
        </button>
        
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-50 mb-2">{post.title}</h1>
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
            <div className="flex items-center gap-2">
              <div className="text-xs text-zinc-500">
                {new Date(post.createdAt).toLocaleString()}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-zinc-400 hover:text-zinc-300 p-1"
                >
                  ⋮
                </button>
                {showOptions && (
                  <div className="absolute right-0 top-8 bg-zinc-900 border border-white/10 rounded-lg shadow-lg p-2 z-10 min-w-48">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-700 rounded"
                    >
                      📋 Share Post
                    </button>
                    <button
                      onClick={() => {
                        router.push(`/users/${post.author?.username}`);
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-700 rounded"
                    >
                      👤 View Profile
                    </button>
                    {(user?.id === post.authorId || ['darianbayan', 'admin'].includes(user?.username)) && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this post?')) {
                            deletePost();
                          setShowOptions(false);
                          router.push('/feed');
                          }
                        }}
                        className="block w-full text-left px-3 py-2 text-red-400 hover:bg-red-900 rounded"
                      >
                        🗑️ Delete Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {postContent && (
            <div className="mb-6">
              <p className="text-zinc-300 leading-relaxed">{postContent}</p>
            </div>
          )}

          {post.linkUrl && (
            <div className="mb-6">
              {post.linkUrl.includes('/uploads/') ? (
                post.linkUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img 
                    src={post.linkUrl} 
                    alt="Post image" 
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                ) : (
                  <video 
                    src={post.linkUrl} 
                    controls 
                    className="w-full rounded-lg max-h-96"
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
            <div className="flex flex-wrap gap-2 mb-6">
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

          {/* Interaction Buttons */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
                userVote?.type === 'like' ? 'bg-green-700 text-white' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              👍 {post.likes || 0}
            </button>
            <button
              onClick={handleDislike}
              disabled={!user}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
                userVote?.type === 'dislike' ? 'bg-red-700 text-white' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              👎 {post.dislikes || 0}
            </button>
            <button
              onClick={handleRepost}
              disabled={!user}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Repost
            </button>
          </div>

          {/* Reply Section */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">Replies</h3>
            
            {user && (
              <div className="mb-6">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyContent.trim()}
                  className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                  {replying ? 'Posting...' : 'Reply'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {post.replies && post.replies.length > 0 ? (
                post.replies.map((reply) => (
                  <div key={reply.id} className="p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-zinc-100 flex items-center gap-1">
                        {reply.author?.username}
                        {['darianbayan', 'admin'].includes(reply.author?.username) && (
                          <img 
                            src="/modicon.png" 
                            alt="Moderator" 
                            title="Moderator"
                            className="w-4 h-4 inline-block"
                          />
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-zinc-300">{reply.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400">No replies yet</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
