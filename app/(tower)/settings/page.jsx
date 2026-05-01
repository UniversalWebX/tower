"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

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

const themes = [
  { code: 'dark', name: 'Dark Theme', icon: '🌙' },
  { code: 'light', name: 'Light Theme', icon: '☀️' },
  { code: 'auto', name: 'Auto Theme', icon: '🌓' }
];

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailValue, setEmailValue] = useState("");
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
        
        // Apply saved theme on load
        if (data.preferences.theme) {
          document.documentElement.className = data.preferences.theme === 'light' 
            ? 'light' 
            : data.preferences.theme === 'auto' 
              ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
              : 'dark';
          document.documentElement.setAttribute('data-theme', data.preferences.theme);
        }
        
        // Apply saved language on load
        if (data.preferences.language) {
          localStorage.setItem('tower-language', data.preferences.language);
          console.log('Language loaded:', data.preferences.language);
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
        
        // Apply theme changes immediately
        if (updates.theme) {
          document.documentElement.className = updates.theme === 'light' 
            ? 'light' 
            : updates.theme === 'auto' 
              ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
              : 'dark';
          document.documentElement.setAttribute('data-theme', updates.theme);
        }
        
        // Apply language changes
        if (updates.language) {
          // Store language preference for future use
          localStorage.setItem('tower-language', updates.language);
          // You could implement actual language switching here
          console.log('Language changed to:', updates.language);
        }
        
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage("Something went wrong");
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
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user || !preferences) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Error loading settings</div>
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
            Settings
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
              { id: 'general', name: 'General', icon: '⚙️' },
              { id: 'profile', name: 'Profile', icon: '👤' },
              { id: 'notifications', name: 'Notifications', icon: '🔔' },
              { id: 'privacy', name: 'Privacy', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
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
                      onClick={() => savePreferences({ language: lang.code })}
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
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.code}
                      onClick={() => savePreferences({ theme: theme.code })}
                      disabled={saving}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        preferences.theme === theme.code
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{theme.icon}</div>
                      <div className="text-sm">{theme.name}</div>
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
