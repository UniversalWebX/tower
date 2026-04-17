"use client";

import { MotionConfig } from "framer-motion";

export function TowerProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 28 }}>
      {children}
    </MotionConfig>
  );
}
