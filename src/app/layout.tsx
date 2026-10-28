import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CulturAI (AuraTaste) — Autonomous Cultural & Taste AI Concierge",
    template: "%s | CulturAI (AuraTaste)",
  },
  description:
    "Autonomous multi-agent lifestyle concierge, nocturnal curator, and subcultural travel engine powered by Qloo Taste AI™ Graph (575M+ Entities) and Google Gemini 1.5 Flash.",
  keywords: [
    "CulturAI",
    "AuraTaste",
    "Qloo Taste AI",
    "Qloo Hackathon",
    "Cultural Intelligence",
    "Autonomous Agents",
    "Lifestyle Concierge",
    "Subcultural Travel",
    "Gemini 1.5 Flash",
  ],
  authors: [{ name: "Janitha Dilshan", url: "https://github.com/janiya2" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "CulturAI (AuraTaste) — Autonomous Cultural & Taste AI Concierge",
    description:
      "Grounding Gemini 1.5 in Qloo's 575M+ entity Taste AI™ Graph to curate uncompromised night-outs, subcultural travel, and aesthetic alignments.",
    url: "http://localhost:3000",
    siteName: "CulturAI (AuraTaste)",
    images: [
      {
        url: "/culturai_cyber_bg.jpg",
        width: 1200,
        height: 630,
        alt: "CulturAI Autonomous Cultural & Taste Intelligence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CulturAI (AuraTaste) — Autonomous Cultural & Taste AI Concierge",
    description:
      "Grounding Gemini 1.5 in Qloo's 575M+ entity Taste AI™ Graph for autonomous lifestyle & travel curation.",
    images: ["/culturai_cyber_bg.jpg"],
  },
};

import { AuthProvider } from "@/lib/authContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#040409] text-[#f0f2ff] selection:bg-cyan-500/30 selection:text-cyan-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
