"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const ADMIN_USERS = ["Admin", "DarianBayan", "TowerAdmin"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "users" | "chats">("posts");
  const [username, setUsername] = useState("");
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSuspendUser(suspend: boolean) {
    if (!username.trim()) return;
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suspendUser",
          data: { username: username.trim(), suspended: suspend },
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`User ${username.trim()} ${suspend ? "suspended" : "unsuspended"} successfully`);
        setUsername("");
      } else {
        setError(data.error || "Failed to suspend user");
      }
    } catch (err) {
      setError("Error suspending user");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!username.trim()) return;
    
    if (!confirm(`Are you sure you want to delete user ${username.trim()}? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteUser",
          data: { username: username.trim() },
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`User ${username.trim()} deleted successfully`);
        setUsername("");
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Error deleting user");
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockChat() {
    if (!user1.trim() || !user2.trim()) return;
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "blockChat",
          data: { user1: user1.trim(), user2: user2.trim() },
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Chat between ${user1.trim()} and ${user2.trim()} blocked successfully`);
        setUser1("");
        setUser2("");
      } else {
        setError(data.error || "Failed to block chat");
      }
    } catch (err) {
      setError("Error blocking chat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Admin Panel</h1>
        <p className="text-sm text-zinc-400">
          Manage users, posts, and chats. Admin privileges required.
        </p>
      </motion.div>

      {/* Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-300"
        >
          {message}
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-300"
        >
          {error}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-zinc-900/50 p-1">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "chats"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Chat Management
        </button>
      </div>

      {/* User Management Tab */}
      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Suspend/Unsuspend User</h2>
            <div className="space-y-4">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleSuspendUser(true)}
                  disabled={loading}
                  className="flex-1 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  Suspend User
                </button>
                <button
                  onClick={() => handleSuspendUser(false)}
                  disabled={loading}
                  className="flex-1 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
                >
                  Unsuspend User
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Delete User Account</h2>
            <div className="space-y-4">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60"
              />
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="w-full rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                Delete User Account
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat Management Tab */}
      {activeTab === "chats" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Block Chat Between Users</h2>
            <div className="space-y-4">
              <input
                value={user1}
                onChange={(e) => setUser1(e.target.value)}
                placeholder="First username"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60"
              />
              <input
                value={user2}
                onChange={(e) => setUser2(e.target.value)}
                placeholder="Second username"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400/60"
              />
              <button
                onClick={handleBlockChat}
                disabled={loading}
                className="w-full rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                Block DM Chat
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
