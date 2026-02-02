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
  metadataBase: new URL("https://donna.fyi"),
  title: "Donna — Zach's AI Chief of Staff",
  description:
    "Meet Donna, an AI chief of staff helping Zach Lagden manage work, habits, and everything in between. Powered by Claude Opus 4.5.",
  openGraph: {
    title: "Donna — Zach's AI Chief of Staff",
    description:
      "Meet Donna, an AI chief of staff helping Zach Lagden manage work, habits, and everything in between. Powered by Claude Opus 4.5.",
    url: "https://donna.fyi",
    siteName: "donna.fyi",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Donna — Zach's AI Chief of Staff",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donna — Zach's AI Chief of Staff",
    description:
      "Meet Donna, an AI chief of staff helping Zach Lagden manage work, habits, and everything in between. Powered by Claude Opus 4.5.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
