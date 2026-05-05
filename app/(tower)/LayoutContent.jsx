/**
 * =============================================================================
 * LAYOUT CONTENT - Translatable Layout Component
 * =============================================================================
 * 
 * This component contains the actual layout content that can use
 * the translation context provided by the main layout wrapper.
 * 
 * Key Features:
 * - Translation-aware navigation
 * - Theme-aware styling
 * - Responsive design
 * - Global state integration
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-05
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/TranslationContext";

const MODERATORS = ["darianbayan", "admin"];

export default function LayoutContent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suspensionInfo, setSuspensionInfo] = useState(null);
  const [siteSettings, setSiteSettings] = useState({ lockdown: false });
  const router = useRouter();
  
  // Use global translation context
  const { t } = useTranslation();

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

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch('/api/moderator/console');
        if (res.ok) {
          const data = await res.json();
          setSiteSettings({
            lockdown: data.lockdown || false
          });
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  // Check if user is blocked by lockdown
  const isBlockedByLockdown = siteSettings.lockdown && user && !MODERATORS.includes(user.username);

  if (loading) {
    return (
      <div className="min-h-screen bg-tower-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tower-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-tower-gray">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tower-dark">
      
      {/* Lockdown Banner */}
      {siteSettings.lockdown && (
        <div className="bg-rose-600/10 border-b border-rose-600/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-rose-400 text-sm">🔒</span>
              <span className="text-rose-300 text-sm">
                {isBlockedByLockdown ? t('lockdownBlocked') : t('lockdownActive')}
              </span>
            </div>
          </div>
        </div>
      )}

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
                  {t('feed')}
                </Link>
                <Link href="/create" className="nav-link">
                  {t('create')}
                </Link>
                <Link href="/chats-new" className="nav-link">
                  {t('chats')}
                </Link>
                <Link href="/search" className="nav-link">
                  {t('search')}
                </Link>
                <Link href="/profile" className="nav-link">
                  {t('profile')}
                </Link>
                <Link href="/storey" className="nav-link bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                  Storey
                </Link>
                <Link href="/settings" className="nav-link">
                  {t('settings')}
                </Link>
                {MODERATORS.includes(user?.username) && (
                  <Link href="/moderator" className="nav-link text-tower-accent">
                    {t('moderator')}
                  </Link>
                )}
              </div>
            </div>
            
            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div 
                        className="text-sm font-medium"
                        style={{ color: user?.usernameColor || '#ffffff' }}
                      >
                        {user?.username}
                      </div>
                      {user?.hasStoreySubscription && (
                        <img 
                          src="/storeyicon.png" 
                          alt="Storey" 
                          className="w-4 h-4"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-tower-gray/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/feed" className="block px-3 py-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10">
                {t('feed')}
              </Link>
              <Link href="/create" className="block px-3 py-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10">
                {t('create')}
              </Link>
              <Link href="/chats-new" className="block px-3 py-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10">
                {t('chats')}
              </Link>
              <Link href="/search" className="block px-3 py-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10">
                {t('search')}
              </Link>
              <Link href="/profile" className="block px-3 py-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10">
                {t('profile')}
              </Link>
              <Link href="/storey" className="block px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                Storey
              </Link>
              <Link href="/settings" className="block px-3 py-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10">
                {t('settings')}
              </Link>
              {MODERATORS.includes(user?.username) && (
                <Link href="/moderator" className="block px-3 py-2 rounded-lg text-tower-accent">
                  {t('moderator')}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg text-tower-gray hover:text-tower-light hover:bg-tower-gray/10"
              >
                {t('logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-tower-gray/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-tower-gray text-sm">
              © 2026 Tower. {t('builtWith')}.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/about" className="text-tower-gray hover:text-tower-light text-sm transition-colors">
                {t('about')}
              </Link>
              <Link href="/privacy" className="text-tower-gray hover:text-tower-light text-sm transition-colors">
                {t('privacy')}
              </Link>
              <Link href="/terms" className="text-tower-gray hover:text-tower-light text-sm transition-colors">
                {t('terms')}
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
              <h2 className="text-2xl font-bold text-zinc-50 mb-2">{t('accountSuspended')}</h2>
              <p className="text-zinc-300 mb-4">
                {t('suspensionMessage', { date: new Date(suspensionInfo.suspendedUntil).toLocaleString() })}
              </p>
              <p className="text-zinc-400 text-sm mb-6">
                {t('suspensionContact')}
              </p>
              <button
                onClick={() => setSuspensionInfo(null)}
                className="px-6 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600"
              >
                {t('iUnderstand')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
