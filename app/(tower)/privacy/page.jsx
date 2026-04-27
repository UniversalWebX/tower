"use client";

"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-zinc-50 mb-4">Privacy Policy</h1>
        <p className="text-zinc-400">Last updated: 2026</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">1. Information We Collect</h2>
          <div className="text-zinc-300 space-y-3">
            <p><strong>Account Information:</strong> Username, password (hashed), age, email (optional), bio, and interests.</p>
            <p><strong>Content:</strong> Posts, comments, messages, and files you upload.</p>
            <p><strong>Usage Data:</strong> Login times, session information, and interaction patterns.</p>
            <p><strong>Technical Data:</strong> IP address, browser type, and device information.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">2. How We Use Your Information</h2>
          <ul className="text-zinc-300 space-y-2 list-disc list-inside">
            <li>To provide and maintain the Tower service</li>
            <li>To personalize your feed and content recommendations</li>
            <li>To facilitate social interactions and messaging</li>
            <li>To ensure platform safety and enforce community guidelines</li>
            <li>To respond to your questions and provide support</li>
            <li>To detect and prevent fraud or abuse</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">3. Data Storage and Security</h2>
          <p className="text-zinc-300 leading-relaxed">
            All data is stored securely using JSON file storage. Passwords are hashed using bcrypt 
            and are never stored in plain text. We implement reasonable security measures to protect 
            your information, but no method of transmission over the internet is 100% secure.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">4. Content Visibility</h2>
          <div className="text-zinc-300 space-y-3">
            <p><strong>Public Content:</strong> Posts and comments are visible to other users based on age restrictions and tags.</p>
            <p><strong>Private Content:</strong> Direct messages are only visible to participants in the conversation.</p>
            <p><strong>Profile Information:</strong> Your profile is visible to other users, but you control what information you share.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">5. Cookies and Sessions</h2>
          <p className="text-zinc-300 leading-relaxed">
            Tower uses cookies and session tokens to maintain your login state and improve your experience. 
            Sessions expire after 7 days of inactivity. You can clear your cookies at any time through 
            your browser settings.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">6. Third-Party Services</h2>
          <p className="text-zinc-300 leading-relaxed">
            Tower does not share your personal information with third parties for marketing purposes. 
            We may share information with service providers only as necessary to operate the service 
            or when required by law.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">7. Your Rights</h2>
          <ul className="text-zinc-300 space-y-2 list-disc list-inside">
            <li>Access and update your profile information</li>
            <li>Delete your account and associated data</li>
            <li>Request a copy of your personal data</li>
            <li>Opt out of certain data collection</li>
            <li>Report privacy concerns to moderators</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">8. Data Retention</h2>
          <p className="text-zinc-300 leading-relaxed">
            We retain your data as long as necessary to provide the service and comply with legal obligations. 
            When you delete your account, we will remove your personal data within a reasonable timeframe, 
            except where required to maintain the service or for legal compliance.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">9. Children's Privacy</h2>
          <p className="text-zinc-300 leading-relaxed">
            Tower is not intended for children under 13. We do not knowingly collect personal information 
            from children under 13. If we become aware that we have collected such information, 
            we will take steps to delete it promptly.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">10. Changes to Privacy Policy</h2>
          <p className="text-zinc-300 leading-relaxed">
            We may update this privacy policy from time to time. Changes will be posted on this page 
            and will take effect immediately. Your continued use of the service constitutes acceptance 
            of any changes.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">11. Contact Us</h2>
          <p className="text-zinc-300 leading-relaxed">
            If you have questions about this Privacy Policy or want to exercise your rights, 
            please contact our moderation team through the platform.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
