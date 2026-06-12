import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://donna.fyi"),
  title: "Donna — Zach's AI Chief of Staff",
  description:
    "Donna is a self-hosted AI chief of staff. Hermes Agent runtime, Claude Fable 5 reasoning, Honcho semantic memory.",
  openGraph: {
    title: "Donna — Zach's AI Chief of Staff",
    description:
      "Self-hosted AI chief of staff. Hermes Agent + Claude Fable 5 + Honcho memory.",
    url: "https://donna.fyi",
    siteName: "donna.fyi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donna — Zach's AI Chief of Staff",
    description: "Self-hosted AI chief of staff. Hermes + Claude Fable 5 + Honcho.",
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased surface-paper`}
      >
        {children}
      </body>
    </html>
  );
}
