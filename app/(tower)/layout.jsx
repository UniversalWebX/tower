"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TowerLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suspensionInfo, setSuspensionInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/login');
      if (res.ok) {
        const userData = await res.json();
        if (userData.suspended) {
          setUser(null);
          setSuspensionInfo(userData);
        } else {
          setUser(userData);
          setSuspensionInfo(null);
        }
      } else {
        setUser(null);
        setSuspensionInfo(null);
      }
    } catch (error) {
      setUser(null);
      setSuspensionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const MODERATORS = ['darianbayan', 'admin'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tower-dark">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-tower-primary to-tower-secondary rounded-xl mx-auto mb-4 animate-pulse"></div>
          <div className="text-tower-gray">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tower-dark">
      {/* Navigation */}
      <nav className="glass-effect border-b border-tower-gray/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and main nav */}
            <div className="flex items-center space-x-8">
              <Link href="/feed" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-tower-primary to-tower-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold gradient-text">Tower</span>
              </Link>
              
              {/* Desktop navigation */}
              <div className="hidden md:flex space-x-1">
                <Link href="/feed" className="nav-link">
                  Feed
                </Link>
                <Link href="/create" className="nav-link">
                  Create
                </Link>
                <Link href="/chats-new" className="nav-link">
                  Chats
                </Link>
                <Link href="/search" className="nav-link">
                  Search
                </Link>
                <Link href="/profile" className="nav-link">
                  Profile
                </Link>
                {MODERATORS.includes(user?.username) && (
                  <Link href="/moderator" className="nav-link text-tower-accent">
                    Moderator
                  </Link>
                )}
              </div>
            </div>
            
            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-tower-light">{user?.username}</div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-tower-primary to-tower-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn-ghost hidden md:block"
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden btn-ghost p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-tower-gray/20"
          >
            <div className="px-4 py-2 space-y-1">
              <Link href="/feed" className="block nav-link w-full text-left">
                Feed
              </Link>
              <Link href="/create" className="block nav-link w-full text-left">
                Create
              </Link>
              <Link href="/chats-new" className="block nav-link w-full text-left">
                Chats
              </Link>
              <Link href="/profile" className="block nav-link w-full text-left">
                Profile
              </Link>
              {MODERATORS.includes(user?.username) && (
                <Link href="/moderator" className="block nav-link w-full text-left text-tower-accent">
                  Moderator
                </Link>
              )}
              <div className="pt-2 border-t border-tower-gray/20">
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-tower-light">{user?.username}</div>
                  </div>
                  <button onClick={handleLogout} className="btn-ghost text-sm">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-tower-gray/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-tower-gray text-sm">
              © 2026 Tower. Built with Next.js and Tailwind CSS.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/about" className="text-tower-gray hover:text-tower-light text-sm transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-tower-gray hover:text-tower-light text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-tower-gray hover:text-tower-light text-sm transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Suspension Popup */}
      {suspensionInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-zinc-50 mb-2">Account Suspended</h2>
              <p className="text-zinc-300 mb-4">
                Your account has been suspended until {new Date(suspensionInfo.suspendedUntil).toLocaleString()}
              </p>
              <p className="text-zinc-400 text-sm mb-6">
                Please contact the moderators if you believe this is an error.
              </p>
              <button
                onClick={() => setSuspensionInfo(null)}
                className="px-6 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600"
              >
                I Understand
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
