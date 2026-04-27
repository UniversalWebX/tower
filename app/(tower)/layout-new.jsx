"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TowerLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/login');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <nav className="border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/feed" className="text-xl font-bold text-white">
                Tower
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/feed" className="text-zinc-300 hover:text-white transition-colors">
                  Feed
                </Link>
                <Link href="/create" className="text-zinc-300 hover:text-white transition-colors">
                  Create
                </Link>
                <Link href="/chats" className="text-zinc-300 hover:text-white transition-colors">
                  Chats
                </Link>
                <Link href="/profile" className="text-zinc-300 hover:text-white transition-colors">
                  Profile
                </Link>
                {(user?.username === 'DarianBayan' || user?.username === 'Admin' || user?.username === 'TowerAdmin' || user?.username === 'SuperAdmin') && (
                  <Link href="/moderator" className="text-zinc-300 hover:text-white transition-colors">
                    Moderator
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-zinc-300">
                {user?.username}
              </div>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
