"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StoreyPage() {
  const [user, setUser] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError("Please enter a subscription code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // First validate the code
      const validateRes = await fetch('/api/storey/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const validateData = await validateRes.json();

      if (!validateRes.ok) {
        setError(validateData.error || "Invalid code");
        return;
      }

      // If code is valid, activate subscription
      const activateRes = await fetch('/api/storey/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const activateData = await activateRes.json();

      if (!activateRes.ok) {
        setError(activateData.error || "Failed to activate subscription");
        return;
      }

      setSuccess("🎉 Storey subscription activated successfully!");
      setCode("");
      
      // Refresh user data
      setTimeout(() => {
        checkAuth();
      }, 1000);

    } catch (error) {
      console.error('Redemption failed:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-zinc-50 mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Storey
          </h1>
          <p className="text-zinc-400">
            Premium subscription for Tower users
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-6"
        >
          {user.hasStoreySubscription ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-3xl">✨</span>
              </motion.div>
              <h2 className="text-2xl font-semibold text-zinc-50 mb-2">
                Storey Active
              </h2>
              <p className="text-zinc-400 mb-4">
                You have an active Storey subscription!
              </p>
              <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Automatic post boosting</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>User reporting capabilities</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Premium badge display</span>
                </div>
              </div>
              {user.subscriptionActivatedAt && (
                <p className="text-xs text-zinc-500 mt-4">
                  Activated: {new Date(user.subscriptionActivatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-zinc-50 mb-4">
                Activate Storey
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-zinc-50 mb-2">Storey Benefits:</h3>
                  <ul className="space-y-1 text-sm text-zinc-300">
                    <li>• Automatic post boosting</li>
                    <li>• Report users for TOS violations</li>
                    <li>• Premium Storey badge</li>
                    <li>• Support Tower development</li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleRedeemCode} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-zinc-300 mb-2">
                    Subscription Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter your code"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    maxLength={16}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900/50 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm"
                  >
                    {success}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? "Activating..." : "Activate Storey"}
                </motion.button>
              </form>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
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
