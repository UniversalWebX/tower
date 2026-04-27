"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', interests: [] });
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setStats(data.stats);
        setEditForm({ bio: data.bio || '', interests: data.interests || [] });
        
        // Load user's posts
        const postsRes = await fetch(`/api/posts?authorId=${data.id}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts);
        }
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsEditing(false);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Error updating profile');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-zinc-400">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="text-zinc-400">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-zinc-50">Profile</h1>
        <p className="text-zinc-400">Your profile and activity</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-zinc-50">{user.username}</h2>
              <p className="text-zinc-400">Age: {user.age}</p>
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-zinc-50">{stats.postsCount}</div>
                  <div className="text-xs text-zinc-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-zinc-50">{stats.followersCount}</div>
                  <div className="text-xs text-zinc-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-zinc-50">{stats.followingCount}</div>
                  <div className="text-xs text-zinc-400">Following</div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bio and Interests */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Bio */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">Bio</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-zinc-300">
                {user.bio || 'No bio yet. Click Edit Profile to add one!'}
              </p>
            )}
          </div>

          {/* Interests */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">Interests</h3>
            {isEditing ? (
              <div>
                <textarea
                  value={editForm.interests.join(', ')}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    interests: e.target.value.split(',').map(i => i.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none"
                  rows={3}
                  placeholder="Enter interests separated by commas..."
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Separate interests with commas. Maximum 10 interests.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-zinc-400">No interests yet. Click Edit Profile to add some!</p>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ bio: user.bio || '', interests: user.interests || [] });
                }}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Posts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h3 className="text-lg font-semibold text-zinc-50 mb-4">Your Posts</h3>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-white/5 pb-4 last:border-b-0">
                  <h4 className="font-medium text-zinc-50">{post.title}</h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    {post.content ? post.content.substring(0, 100) + '...' : 'No content'}
                  </p>
                  <div className="text-xs text-zinc-500 mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No posts yet. Create your first post!</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
