"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username;
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    try {
      // Load user data
      const userRes = await fetch(`/api/users/${username}`);
      const profileData = userRes.ok ? await userRes.json() : null;
      
      if (profileData) {
        setUser(profileData.user);
        setPosts(profileData.posts || []);
      }
    } catch (error) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id })
      });
      
      if (res.ok) {
        // Update UI to show following status
        setUser(prev => ({ ...prev, isFollowing: true }));
      }
    } catch (error) {
      setError('Error following user');
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await fetch('/api/users/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id })
      });
      
      if (res.ok) {
        // Update UI to show following status
        setUser(prev => ({ ...prev, isFollowing: false }));
      }
    } catch (error) {
      setError('Error unfollowing user');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, avatar: data.avatarUrl }));
      } else {
        setError('Error uploading avatar');
      }
    } catch (error) {
      setError('Error uploading avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBlock = async () => {
    try {
      const res = await fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id })
      });
      
      if (res.ok) {
        setError(`${user.username} has been blocked`);
        setTimeout(() => router.push('/feed'), 2000);
      } else {
        setError('Error blocking user');
      }
    } catch (error) {
      setError('Error blocking user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-rose-400">{error || 'User not found'}</div>
      </div>
    );
  }

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
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.username}'s avatar`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-zinc-700 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-zinc-300">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Avatar Upload Button - Only for own profile */}
              {user?.isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  📷
                </label>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 flex items-center gap-2">
                {user.username}
                {['darianbayan', 'admin'].includes(user.username) && (
                  <img 
                    src="/modicon.png" 
                    alt="Moderator" 
                    title="Moderator"
                    className="w-6 h-6 inline-block"
                  />
                )}
              </h1>
              <p className="text-zinc-400 mb-2">Age: {user.age}</p>
              {user.bio && (
                <p className="text-zinc-300 whitespace-pre-wrap">{user.bio}</p>
              )}
              
              {/* Action Buttons - Only show if not viewing own profile */}
              {!user.isOwnProfile && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={user.isFollowing ? handleUnfollow : handleFollow}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      user.isFollowing
                        ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        : 'bg-cyan-600 text-white hover:bg-cyan-700'
                    }`}
                  >
                    {user.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  <button
                    onClick={() => router.push(`/chats-new?user=${user.username}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to block ${user.username}?`)) {
                        handleBlock();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Block
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User's Posts */}
          <div>
            <h2 className="text-2xl font-semibold text-zinc-50 mb-4">Posts ({posts.length})</h2>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 cursor-pointer hover:bg-zinc-950/80 transition-colors"
                    onClick={() => router.push(`/posts/${post.id}`)}
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
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-zinc-400">No posts yet</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
