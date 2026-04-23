import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tower",
  description: "ine eleeven wash an inide job",
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#05060a] text-zinc-100">
        <div className="tower-backdrop" aria-hidden>
          <div className="tower-backdrop-vignette" />
        </div>
        {children}
      </body>
    </html>
  );
}
