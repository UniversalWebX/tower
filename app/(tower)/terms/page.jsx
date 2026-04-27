"use client";

"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-zinc-50 mb-4">Terms of Service</h1>
        <p className="text-zinc-400">Last updated: 2026</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">1. Acceptance of Terms</h2>
          <p className="text-zinc-300 leading-relaxed">
            By accessing and using Tower, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">2. Description of Service</h2>
          <p className="text-zinc-300 leading-relaxed">
            Tower is a social platform that allows users to create posts, share content, interact with others, 
            and participate in community discussions. The service includes content creation, messaging, 
            and social features designed for safe online interaction.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">3. User Responsibilities</h2>
          <ul className="text-zinc-300 space-y-2 list-disc list-inside">
            <li>You must be at least 13 years old to use Tower</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You agree to provide accurate and current information</li>
            <li>You will not use the service for any illegal or unauthorized purpose</li>
            <li>You will not harass, abuse, or harm other users</li>
            <li>You will not post inappropriate or harmful content</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">4. Content and Conduct</h2>
          <p className="text-zinc-300 leading-relaxed">
            Users are solely responsible for the content they post. Tower reserves the right to remove 
            content that violates these terms or is deemed inappropriate. Content that is harmful, 
            threatening, or violates the rights of others will be removed and may result in account suspension.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">5. Privacy</h2>
          <p className="text-zinc-300 leading-relaxed">
            Your privacy is important to us. Please review our Privacy Policy to understand how we 
            collect, use, and protect your information. By using Tower, you consent to the collection 
            and use of information as described in our Privacy Policy.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">6. Account Suspension</h2>
          <p className="text-zinc-300 leading-relaxed">
            Tower reserves the right to suspend or terminate accounts that violate these terms. 
            Users may be suspended for periods ranging from 1 hour to 30 days, or permanently 
            banned for serious violations.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">7. Changes to Terms</h2>
          <p className="text-zinc-300 leading-relaxed">
            Tower reserves the right to modify these terms at any time. Changes will be effective 
            immediately upon posting. Your continued use of the service constitutes acceptance 
            of any modified terms.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4">8. Contact</h2>
          <p className="text-zinc-300 leading-relaxed">
            If you have questions about these Terms of Service, please contact our moderation team 
            through the platform or reach out to our administrators.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
