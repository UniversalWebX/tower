"use client";

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Navigation Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/feed')}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          ← Back to Feed
        </button>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-zinc-50 mb-4">About Tower</h1>
        <p className="text-zinc-400">A modern social platform built for safe and meaningful connections</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Our Mission</h2>
          <p className="text-zinc-300 leading-relaxed">
            Tower is designed to create a safe, inclusive, and engaging social environment where users can 
            express themselves, share content, and connect with others who share similar interests. 
            Our platform prioritizes user safety through smart content filtering and active moderation.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-300">
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-100">📝 Content Creation</h3>
              <p className="text-sm">Create posts with text, images, videos, and tags</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-100">🎯 Smart Feed</h3>
              <p className="text-sm">Personalized content based on interests and age</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-100">💬 Real-time Chat</h3>
              <p className="text-sm">Direct messaging and group conversations</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-100">🛡️ Safety First</h3>
              <p className="text-sm">Age-appropriate content and active moderation</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-100">📁 File Sharing</h3>
              <p className="text-sm">Upload and share images and videos securely</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-100">👥 User Profiles</h3>
              <p className="text-sm">Customizable profiles with interests and bio</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Technology</h2>
          <div className="text-zinc-300 space-y-3">
            <p>Tower is built with modern web technologies to ensure a fast, secure, and reliable experience:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Next.js 15.5.15</strong> - Modern React framework for optimal performance</li>
              <li><strong>React 19.0.0</strong> - Latest React version with enhanced features</li>
              <li><strong>Tailwind CSS</strong> - Utility-first CSS framework for responsive design</li>
              <li><strong>Framer Motion</strong> - Smooth animations and transitions</li>
              <li><strong>bcryptjs</strong> - Secure password hashing</li>
              <li><strong>JSON Storage</strong> - Simple, reliable file-based data storage</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Safety & Moderation</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Safety is our top priority. Tower implements multiple layers of protection:
          </p>
          <ul className="text-zinc-300 space-y-2 list-disc list-inside">
            <li>Age-based content filtering to ensure appropriate content for each user</li>
            <li>Smart content ranking that prioritizes quality and relevance</li>
            <li>Active moderation team with tools to manage content and users</li>
            <li>User reporting system for community-driven safety</li>
            <li>Shadow banning and suspension for rule violations</li>
            <li>Secure authentication and session management</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Community Guidelines</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            We believe in creating a positive and inclusive community. Our guidelines include:
          </p>
          <ul className="text-zinc-300 space-y-2 list-disc list-inside">
            <li>Be respectful and kind to others</li>
            <li>Share appropriate content for your age group</li>
            <li>Use tags responsibly to help others find relevant content</li>
            <li>Report inappropriate content or behavior</li>
            <li>Keep personal information private</li>
            <li>Contribute constructively to discussions</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Getting Started</h2>
          <div className="text-zinc-300 space-y-3">
            <p>Ready to join Tower? Here's how to get started:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Sign Up:</strong> Create an account with username, password, and basic information</li>
              <li><strong>Complete Profile:</strong> Add your interests and bio to help others find you</li>
              <li><strong>Create Content:</strong> Share posts with tags and age-appropriate content</li>
              <li><strong>Explore Feed:</strong> Discover content tailored to your interests</li>
              <li><strong>Connect:</strong> Message other users and join conversations</li>
            </ol>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Contact & Support</h2>
          <p className="text-zinc-300 leading-relaxed">
            Have questions, feedback, or need help? Our moderation team is here to assist you. 
            Reach out through the platform's messaging system or check our help resources. 
            We're committed to making Tower a safe and enjoyable place for everyone.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">Version History</h2>
          <div className="text-zinc-300 space-y-2 text-sm">
            <p><strong>Version 1.0 (2026)</strong> - Initial release with core features</p>
            <p>• User authentication and profiles</p>
            <p>• Post creation and smart feed</p>
            <p>• Real-time messaging system</p>
            <p>• Comprehensive moderation tools</p>
            <p>• File upload and media sharing</p>
            <p>• Modern responsive design</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
