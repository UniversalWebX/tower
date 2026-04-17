"use client";

import { motion } from "framer-motion";
import { VirtualFeed } from "@/components/VirtualFeed";

export default function FeedPage() {
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Your feed</h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Ranked for your five topics and age band, using tag overlap, age fit, and freshness. Posts load in batches and
          virtualize for smooth scrolling.
        </p>
      </motion.div>
      <VirtualFeed />
    </div>
  );
}
