"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ModeratorPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [clearingChats, setClearingChats] = useState(false);
  const [suspendHours, setSuspendHours] = useState({});
  const [pendingPosts, setPendingPosts] = useState([]);
  const [consoleCommand, setConsoleCommand] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [siteSettings, setSiteSettings] = useState({ lockdown: false });

  const MODERATORS = ['darianbayan', 'Admin'];

  useEffect(() => {
    checkAuth();
    loadData();
    loadPendingPosts();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/login');
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        
        if (!MODERATORS.includes(user.username)) {
          window.location.href = '/feed';
          return;
        }
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      window.location.href = '/login';
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, postsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/posts')
      ]);

      if (usersRes.ok && postsRes.ok) {
        const usersData = await usersRes.json();
        const postsData = await postsRes.json();
        setUsers(usersData);
        setPosts(postsData);
      } else {
        setError('Failed to load data');
      }
    } catch (error) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId, hours) => {
    setActionLoading(`suspend-${userId}`);
    try {
      const res = await fetch(`/api/admin/suspend-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hours })
      });

      if (res.ok) {
        await loadData();
      } else {
        setError('Failed to suspend user');
      }
    } catch (error) {
      setError('Error suspending user');
    } finally {
      setActionLoading('');
    }
  };

  const unsuspendUser = async (userId) => {
    setActionLoading(`unsuspend-${userId}`);
    try {
      const res = await fetch(`/api/admin/unsuspend-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        await loadData();
      } else {
        setError('Failed to unsuspend user');
      }
    } catch (error) {
      setError('Error unsuspending user');
    } finally {
      setActionLoading('');
    }
  };

  const deleteAccount = async (userId) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    setActionLoading(`delete-${userId}`);
    try {
      const res = await fetch(`/api/admin/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        await loadData();
      } else {
        setError('Failed to delete account');
      }
    } catch (error) {
      setError('Error deleting account');
    } finally {
      setActionLoading('');
    }
  };

  const shadowBanUser = async (userId, shadowBanned) => {
    setActionLoading(`shadow-${userId}`);
    try {
      const res = await fetch(`/api/admin/shadow-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, shadowBanned })
      });

      if (res.ok) {
        await loadData();
      } else {
        setError('Failed to update user');
      }
    } catch (error) {
      setError('Error updating user');
    } finally {
      setActionLoading('');
    }
  };

  const boostPost = async (postId, boosted) => {
    setActionLoading(`boost-${postId}`);
    try {
      const res = await fetch(`/api/admin/boost-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, boosted })
      });

      if (res.ok) {
        await loadData();
      } else {
        setError('Failed to update post');
      }
    } catch (error) {
      setError('Error updating post');
    } finally {
      setActionLoading('');
    }
  };

  const wipeAllData = async () => {
    if (!confirm('Are you sure you want to wipe ALL data? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch('/api/wipe-data', { method: 'POST' });
      if (res.ok) {
        alert('All data has been wiped successfully');
        loadData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error wiping data');
    }
  };

  const clearChatData = async () => {
    if (!confirm('Are you sure you want to clear ALL chat data? This will delete all messages, chats, and chat members. This action cannot be undone.')) {
      return;
    }

    setClearingChats(true);
    try {
      const res = await fetch('/api/clear-chats', { method: 'POST' });
      if (res.ok) {
        alert('All chat data has been cleared successfully');
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error clearing chat data');
    } finally {
      setClearingChats(false);
    }
  };

  const loadPendingPosts = async () => {
    try {
      const res = await fetch('/api/moderator/pending-posts');
      if (res.ok) {
        const data = await res.json();
        setPendingPosts(data.pendingPosts);
      }
    } catch (error) {
      console.error('Error loading pending posts:', error);
    }
  };

  
  const executeConsoleCommand = async () => {
    if (!consoleCommand.trim()) return;

    const command = consoleCommand.trim();
    setConsoleCommand('');
    
    // Add command to output
    const newOutput = [{ type: 'command', text: `> ${command}` }, ...consoleOutput];
    setConsoleOutput(newOutput);

    try {
      const res = await fetch('/api/moderator/console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const data = await res.json();
      
      if (res.ok) {
        setConsoleOutput([
          { type: 'success', text: data.message },
          ...newOutput
        ]);
      } else {
        setConsoleOutput([
          { type: 'error', text: data.error },
          ...newOutput
        ]);
      }
    } catch (error) {
      setConsoleOutput([
        { type: 'error', text: 'Command execution failed' },
        ...newOutput
      ]);
    }
  };

  const approvePost = async (postId) => {
    try {
      const res = await fetch('/api/moderator/pending-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'approve' })
      });

      if (res.ok) {
        await loadPendingPosts();
        await loadData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error approving post');
    }
  };

  const rejectPost = async (postId) => {
    if (!confirm('Are you sure you want to reject this post?')) return;

    try {
      const res = await fetch('/api/moderator/pending-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'reject' })
      });

      if (res.ok) {
        await loadPendingPosts();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error rejecting post');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-400">Loading moderator panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-rose-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-50">Moderator Panel</h1>
            <p className="text-zinc-400">Complete moderation system</p>
          </div>
          <div className="text-sm text-zinc-500">
            Logged in as: <span className="text-cyan-400">{currentUser?.username}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
            <h2 className="text-xl font-semibold text-zinc-50 mb-4">User Management</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-zinc-900/40">
                  <div className="flex-1">
                    <div className="font-medium text-zinc-100">{user.username}</div>
                    <div className="text-sm text-zinc-400">Age: {user.age}</div>
                    {user.suspended && (
                      <div className="text-xs text-rose-400">
                        Suspended until: {new Date(user.suspendedUntil || '').toLocaleString()}
                      </div>
                    )}
                    {user.shadowBanned && (
                      <div className="text-xs text-amber-400">Shadow Banned</div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {user.suspended ? (
                      <button
                        onClick={() => unsuspendUser(user.id)}
                        className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white"
                        disabled={actionLoading?.startsWith?.(`unsuspend-${user.id}`)}
                      >
                        {actionLoading?.startsWith?.(`unsuspend-${user.id}`) ? '...' : 'Unsuspend'}
                      </button>
                    ) : (
                      <>
                        <input
                          type="number"
                          placeholder="Hours"
                          className="rounded-lg border border-white/10 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 w-16"
                          value={suspendHours[user.id] || ''}
                          onChange={(e) => setSuspendHours(prev => ({ ...prev, [user.id]: e.target.value }))}
                          disabled={actionLoading?.startsWith?.(`suspend-${user.id}`)}
                        />
                        <button
                          onClick={() => {
                            const hours = parseInt(suspendHours[user.id]);
                            if (hours && hours > 0) {
                              suspendUser(user.id, hours);
                            }
                          }}
                          className="rounded-lg bg-orange-600 px-2 py-1 text-xs font-medium text-white"
                          disabled={actionLoading?.startsWith?.(`suspend-${user.id}`) || !suspendHours[user.id]}
                        >
                          Suspend
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => shadowBanUser(user.id, !user.shadowBanned)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        user.shadowBanned 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                      disabled={actionLoading?.startsWith?.(`shadow-${user.id}`)}
                    >
                      {user.shadowBanned ? 'Unshadow' : 'Shadow'}
                    </button>
                    
                    <button
                      onClick={() => deleteAccount(user.id)}
                      className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white"
                      disabled={actionLoading?.startsWith?.(`delete-${user.id}`)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Post Management */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
            <h2 className="text-xl font-semibold text-zinc-50 mb-4">Post Management</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts.map((post) => (
                <div key={post.id} className="p-3 rounded-lg border border-white/5 bg-zinc-900/40">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-zinc-100">{post.title}</div>
                      {post.content && (
                        <div className="text-sm text-zinc-400 mt-1 line-clamp-2">{post.content}</div>
                      )}
                      <div className="text-sm text-zinc-400">by {post.author?.username}</div>
                      <div className="text-xs text-zinc-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                      {post.boosted && (
                        <div className="text-xs text-green-400">Boosted</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => boostPost(post.id, !post.boosted)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium ${
                          post.boosted 
                            ? 'bg-green-600 text-white' 
                            : 'bg-zinc-700 text-zinc-300'
                        }`}
                        disabled={actionLoading?.startsWith?.(`boost-${post.id}`)}
                      >
                        {post.boosted ? 'Deboost' : 'Boost'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={wipeAllData}
              className="rounded-lg bg-rose-600 px-4 py-3 text-white font-medium hover:bg-rose-700"
            >
              Wipe All Data
            </button>
            <button
              onClick={clearChatData}
              disabled={clearingChats}
              className="rounded-lg bg-orange-600 px-4 py-3 text-white font-medium hover:bg-orange-700 disabled:opacity-50"
            >
              {clearingChats ? 'Clearing...' : 'Clear Chat Data'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Moderator Console */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Moderator Console</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={consoleCommand}
                onChange={(e) => setConsoleCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && executeConsoleCommand()}
                placeholder="Enter command (sptc, lockdown, moderator)..."
                className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-500"
              />
              <button
                onClick={executeConsoleCommand}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
              >
                Execute
              </button>
            </div>
            
            {consoleOutput.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-zinc-900/40 p-3 h-48 overflow-y-auto">
                <div className="font-mono text-xs space-y-1">
                  {consoleOutput.map((output, index) => (
                    <div
                      key={index}
                      className={
                        output.type === 'success' ? 'text-green-400' :
                        output.type === 'error' ? 'text-rose-400' :
                        'text-zinc-300'
                      }
                    >
                      {output.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-zinc-500">
              Available commands:
              <br />• sptc [color] [username] - Set username color
              <br />• lockdown - Toggle website lockdown
              <br />• moderator [add/revoke] [username] - Manage moderators
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pending Posts */}
      {pendingPosts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
            <h2 className="text-xl font-semibold text-zinc-50 mb-4">
              Pending Posts ({pendingPosts.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingPosts.map((post) => (
                <div key={post.id} className="border border-white/10 rounded-lg p-4 bg-zinc-900/40">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-zinc-100 mb-1">{post.title}</div>
                      <div className="text-sm text-zinc-400 mb-2">
                        By: {post.author?.username} (Age: {post.author?.age})
                      </div>
                      <div className="text-sm text-zinc-300 whitespace-pre-wrap">{post.content}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approvePost(post.id)}
                      className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectPost(post.id)}
                      className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Site Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Site Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-zinc-900/40">
              <span className="text-zinc-300">Lockdown Status</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                siteSettings.lockdown 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                {siteSettings.lockdown ? 'LOCKED' : 'OPEN'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-zinc-900/40">
              <span className="text-zinc-300">Pending Posts</span>
              <span className="px-2 py-1 rounded bg-amber-600 text-white text-xs font-medium">
                {pendingPosts.length}
              </span>
            </div>
          </div>
                  </div>
      </motion.div>
    </div>
  );
}
