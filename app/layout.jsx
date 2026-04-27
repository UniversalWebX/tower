"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Tower - Social Platform</title>
        <meta name="description" content="Tower - Modern Social Platform with Posts, Chats, and More" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-tower-dark text-tower-light">
        {children}
      </body>
    </html>
  );
}
