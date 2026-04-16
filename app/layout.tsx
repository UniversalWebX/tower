import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TowerBackdrop } from "@/components/TowerBackdrop";
import { TowerProviders } from "@/components/TowerProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tower — topic & age aware video",
  description: "Tower ranks video posts using tags, your interests, and age fit, with optimized batched feeds and chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#05060a] text-zinc-100">
        <TowerProviders>
          <TowerBackdrop />
          {children}
        </TowerProviders>
      </body>
    </html>
  );
}
