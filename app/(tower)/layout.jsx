"use client";

import { TranslationProvider } from "@/lib/TranslationContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import LayoutContent from "./LayoutContent";

export default function TowerLayout({ children }) {
  return (
    <TranslationProvider>
      <ThemeProvider>
        <LayoutContent>{children}</LayoutContent>
      </ThemeProvider>
    </TranslationProvider>
  );
}
