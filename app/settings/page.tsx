"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: 'public',
    theme: 'dark',
    language: 'en'
  });

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('user-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      settings,
      interests: JSON.parse(localStorage.getItem('user-interests') || '[]'),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tower-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In production, this would call the delete API
      localStorage.clear();
      alert('Account deletion requested. You will receive an email with confirmation.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to access settings</h1>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="mx-auto max-w-4xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Settings ⚙️</h1>
            
            {/* Profile Section */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user?.username || ''}
                    className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Your display name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue={user?.bio || ''}
                    className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Notifications 🔔</h2>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="w-4 h-4 text-violet-600 bg-zinc-900 border-zinc-600 rounded focus:ring-violet-500"
                  />
                  <span>Email Notifications</span>
                </label>
                
                <label className="flex items-center space-x-3 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="w-4 h-4 text-violet-600 bg-zinc-900 border-zinc-600 rounded focus:ring-violet-500"
                  />
                  <span>Push Notifications</span>
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Privacy & Security 🔒</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Profile Visibility</label>
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Data Management 💾</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleExportData}
                  className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                >
                  📥 Export My Data
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  🗑️ Delete My Account
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
