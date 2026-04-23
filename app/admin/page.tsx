"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalMessages: number;
  totalChats: number;
  totalFollows: number;
}

interface SystemInfo {
  version: string;
  uptime: string;
  nodeVersion: string;
  platform: string;
  memory: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalMessages: 0,
    totalChats: 0,
    totalFollows: 0
  });
  
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: "0.1.0",
    uptime: "0s",
    nodeVersion: "Unknown",
    platform: "Unknown",
    memory: "0 MB"
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
    fetchSystemInfo();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      // Mock system info for now
      setSystemInfo({
        version: "0.1.0",
        uptime: "2h 34m",
        nodeVersion: process.version || "Unknown",
        platform: process.platform || "Unknown",
        memory: "128 MB"
      });
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  };

  const handleAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(action);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Success: ${result.message}`);
        fetchAdminStats(); // Refresh stats
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert(`Network error: ${error}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-zinc-400">Manage Tower platform settings and data</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Users</h3>
            <p className="text-3xl font-bold text-violet-400">{stats.totalUsers}</p>
            <p className="text-sm text-zinc-400">Total registered users</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Posts</h3>
            <p className="text-3xl font-bold text-cyan-400">{stats.totalPosts}</p>
            <p className="text-sm text-zinc-400">Total posts created</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
            <p className="text-3xl font-bold text-green-400">{stats.totalMessages}</p>
            <p className="text-sm text-zinc-400">Total messages sent</p>
          </div>
        </div>
      </motion.div>

      {/* System Information */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Version</p>
              <p className="text-white font-medium">{systemInfo.version}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Uptime</p>
              <p className="text-white font-medium">{systemInfo.uptime}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Node.js</p>
              <p className="text-white font-medium">{systemInfo.nodeVersion}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Memory</p>
              <p className="text-white font-medium">{systemInfo.memory}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admin Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleAction('wipePosts')}
              disabled={actionLoading === 'wipePosts'}
              className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-4 py-3 rounded-lg font-medium hover:bg-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'wipePosts' ? 'Wiping...' : '🗑️ Wipe All Posts'}
            </button>
            
            <button
              onClick={() => handleAction('backup')}
              disabled={actionLoading === 'backup'}
              className="bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 py-3 rounded-lg font-medium hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'backup' ? 'Backing up...' : '💾 Create Backup'}
            </button>
            
            <button
              onClick={() => handleAction('restore')}
              disabled={actionLoading === 'restore'}
              className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg font-medium hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'restore' ? 'Restoring...' : '🔄 Restore Backup'}
            </button>
            
            <button
              onClick={() => handleAction('exportUsers')}
              disabled={actionLoading === 'exportUsers'}
              className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-4 py-3 rounded-lg font-medium hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'exportUsers' ? 'Exporting...' : '📊 Export User Data'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/feed" className="block text-center p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800/70 transition-colors">
              <p className="text-white font-medium">📱 View Feed</p>
              <p className="text-sm text-zinc-400">Browse user posts</p>
            </a>
            
            <a href="/create" className="block text-center p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800/70 transition-colors">
              <p className="text-white font-medium">📤 Create Post</p>
              <p className="text-sm text-zinc-400">Add new content</p>
            </a>
            
            <a href="/settings" className="block text-center p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800/70 transition-colors">
              <p className="text-white font-medium">⚙️ Settings</p>
              <p className="text-sm text-zinc-400">Platform settings</p>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
