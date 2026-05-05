"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/TranslationContext";
import { useTheme } from "@/lib/ThemeContext";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

const availableThemes = [
  { code: 'dark', name: 'Dark Mode', icon: '🌙', description: 'Classic dark theme with purple accents' },
  { code: 'light', name: 'Light Mode', icon: '☀️', description: 'Clean light theme with blue accents' },
  { code: 'ocean', name: 'Ocean', icon: '🌊', description: 'Deep blue aquatic theme' },
  { code: 'sunset', name: 'Sunset', icon: '🌅', description: 'Warm orange and pink theme' },
  { code: 'forest', name: 'Forest', icon: '🌲', description: 'Natural green theme' },
  { code: 'galaxy', name: 'Galaxy', icon: '🌌', description: 'Purple cosmic theme' },
  { code: 'monochrome', name: 'Monochrome', icon: '⚫', description: 'Classic black and white' },
  { code: 'auto', name: 'Auto', icon: '🌓', description: 'Follow system preference' }
];

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const router = useRouter();
  
  // Use global contexts
  const { currentLanguage, setLanguage, t, languages } = useTranslation();
  const { currentTheme, setTheme, themes, applyTheme } = useTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/login');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        loadPreferences();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadPreferences = async () => {
    try {
      const res = await fetch('/api/settings/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
        
        // Set current language from preferences
        if (data.preferences.language) {
          setLanguage(data.preferences.language);
        }
        
        // Apply saved theme on load
        if (data.preferences.theme) {
          setTheme(data.preferences.theme);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updates) => {
    setSaving(true);
    setMessage("");

    try {
      console.log('Saving preferences:', updates);
      
      const res = await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
        console.log('Preferences saved successfully:', data.preferences);
        
        // Apply theme changes immediately
        if (updates.theme) {
          console.log('Applying theme:', updates.theme);
          setTheme(updates.theme);
        }
        
        // Apply language changes
        if (updates.language) {
          console.log('Changing language to:', updates.language);
          setLanguage(updates.language);
        }
        
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        console.error('Failed to save preferences:', res.status);
        setMessage("Failed to save settings");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Save preferences error:', error);
      setMessage("Error saving settings");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage("Please upload an image file (JPG, PNG, or GIF)");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage("File size must be less than 5MB");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, avatar: data.avatar }));
        setMessage("Profile picture updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to upload profile picture");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setMessage("Something went wrong");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleEmailChange = (value) => {
    setEmailValue(value);
  };

  const handleEmailSave = async () => {
    if (!emailValue.trim()) {
      setMessage("Email cannot be empty");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setEmailSaving(true);
    try {
      const res = await fetch('/api/users/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailValue.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, email: data.email }));
        setMessage("Email updated successfully!");
        setEmailValue(data.email);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update email");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Email update failed:', error);
      setMessage("Something went wrong");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setEmailSaving(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const newNotifications = {
      ...preferences.notifications,
      [key]: !preferences.notifications[key]
    };

    await savePreferences({ notifications: newNotifications });
    setPreferences(prev => ({ ...prev, notifications: newNotifications }));
  };

  const handlePrivacyToggle = async (key) => {
    const newPrivacy = {
      ...preferences.privacy,
      [key]: !preferences.privacy[key]
    };

    await savePreferences({ privacy: newPrivacy });
    setPreferences(prev => ({ ...prev, privacy: newPrivacy }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">{t('loading')}</div>
      </div>
    );
  }

  if (!user || !preferences) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-zinc-50 mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('settingsTitle')}
          </h1>
          <p className="text-zinc-400">
            Customize your Tower experience
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-2 mb-6"
        >
          <div className="flex space-x-2">
            {[
              { id: 'general', name: 'general', icon: '⚙️' },
              { id: 'profile', name: 'profile', icon: '👤' },
              { id: 'notifications', name: 'notifications', icon: '🔔' },
              { id: 'privacy', name: 'privacy', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-zinc-50 border-b-2 border-cyan-500'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {t(tab)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
        >
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-zinc-50 mb-6">
                General Settings
              </h2>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        console.log('Language button clicked:', lang.code);
                        // Change language immediately for instant feedback
                        setLanguage(lang.code);
                        // Then save preferences
                        savePreferences({ language: lang.code });
                      }}
                      disabled={saving}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        preferences.language === lang.code
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{lang.flag}</div>
                      <div className="text-sm">{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableThemes.map((theme) => (
                    <button
                      key={theme.code}
                      onClick={() => {
                        console.log('Theme button clicked:', theme.code);
                        // Apply theme immediately for instant feedback
                        setTheme(theme.code);
                        // Then save preferences
                        savePreferences({ theme: theme.code });
                      }}
                      disabled={saving}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${
                        preferences.theme === theme.code
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{theme.icon}</div>
                      <div className="text-sm font-medium">{theme.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">{theme.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-zinc-50 mb-6">
                Profile Settings
              </h2>

              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-tower-primary to-tower-secondary rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-3xl font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {user.hasStoreySubscription && (
                      <img 
                        src="/storeyicon.png" 
                        alt="Storey" 
                        className="absolute -bottom-1 -right-1 w-6 h-6"
                        title="Storey Subscriber"
                      />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-200 inline-block"
                    >
                      Upload New Picture
                    </label>
                    <p className="text-xs text-zinc-500 mt-2">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Username Display */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Username
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 cursor-not-allowed"
                  />
                  <span className="text-zinc-500 text-sm">Cannot be changed</span>
                </div>
              </div>

              {/* Email Display */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="email"
                    value={user.email || ''}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50"
                    placeholder="Enter your email"
                  />
                  <button
                    onClick={handleEmailSave}
                    disabled={emailSaving}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                  >
                    {emailSaving ? 'Saving...' : 'Save Email'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-zinc-50 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'posts', label: 'New posts from people you follow', icon: '📝' },
                  { key: 'messages', label: 'Direct messages', icon: '💬' },
                  { key: 'follows', label: 'New followers', icon: '👥' },
                  { key: 'mentions', label: 'Mentions in posts', icon: '@' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{setting.icon}</span>
                      <div>
                        <div className="text-zinc-50">{setting.label}</div>
                        <div className="text-sm text-zinc-500">
                          {preferences.notifications[setting.key] ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(setting.key)}
                      disabled={saving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.notifications[setting.key] 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      <span className="sr-only">
                        {preferences.notifications[setting.key] ? 'Disable' : 'Enable'} {setting.label}
                      </span>
                      <span
                        className={`inline-block h-4 w-4 rounded-full ${
                          preferences.notifications[setting.key] 
                            ? 'bg-white' 
                            : 'bg-cyan-500'
                        } transition-transform duration-200 ${
                          preferences.notifications[setting.key] 
                            ? 'translate-x-6' 
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-zinc-50 mb-6">
                Privacy & Security
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'showAge', label: 'Show age on profile', icon: '🎂' },
                  { key: 'showEmail', label: 'Show email on profile', icon: '📧' },
                  { key: 'allowDirectMessages', label: 'Allow direct messages', icon: '💬' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{setting.icon}</span>
                      <div>
                        <div className="text-zinc-50">{setting.label}</div>
                        <div className="text-sm text-zinc-500">
                          {preferences.privacy[setting.key] ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => savePreferences({
                        privacy: {
                          ...preferences.privacy,
                          [setting.key]: !preferences.privacy[setting.key]
                        }
                      })}
                      disabled={saving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.privacy[setting.key]
                          ? 'bg-cyan-500'
                          : 'bg-zinc-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.privacy[setting.key]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Account Actions */}
              <div className="pt-6 border-t border-zinc-700">
                <h3 className="text-lg font-medium text-zinc-50 mb-4">
                  Account Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/storey')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                  >
                    🌟 Manage Storey Subscription
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to log out?')) {
                        router.push('/api/auth/logout');
                      }
                    }}
                    className="w-full px-4 py-3 bg-red-900/50 text-red-400 rounded-lg border border-red-800/50 hover:bg-red-900/70 transition-all duration-200"
                  >
                    🚪 Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-green-900/50 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm"
            >
              {message}
            </motion.div>
          )}
        </motion.div>

        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link
            href="/feed"
            className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Back to Feed
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
