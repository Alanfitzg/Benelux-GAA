import React from "react";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "../styles/modal-fix.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Benelux GAA - Gaelic Games in Belgium, Netherlands & Luxembourg",
    template: "%s | Benelux GAA",
  },
  description:
    "The home of Gaelic Games in Belgium, the Netherlands, and Luxembourg. Fixtures, clubs, news, standings, and over 50 years of history.",
  keywords: [
    "Benelux GAA",
    "GAA",
    "Gaelic football",
    "Hurling",
    "Belgium GAA",
    "Netherlands GAA",
    "Luxembourg GAA",
    "European GAA",
    "Gaelic games Europe",
    "Irish sports",
  ],
  authors: [{ name: "Benelux GAA" }],
  creator: "Benelux GAA",
  publisher: "Benelux GAA",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.beneluxgaa.com",
    siteName: "Benelux GAA",
    title: "Benelux GAA - Gaelic Games in Belgium, Netherlands & Luxembourg",
    description:
      "The home of Gaelic Games in Belgium, the Netherlands, and Luxembourg. Fixtures, clubs, news, standings, and over 50 years of history.",
    images: [
      {
        url: "https://www.beneluxgaa.com/benelux-gaa-crest.png",
        width: 500,
        height: 500,
        alt: "Benelux GAA Crest",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "Benelux GAA - Gaelic Games in Belgium, Netherlands & Luxembourg",
    description:
      "The home of Gaelic Games in Belgium, the Netherlands, and Luxembourg.",
    images: ["https://www.beneluxgaa.com/benelux-gaa-crest.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  applicationName: "Benelux GAA",
  referrer: "origin-when-cross-origin",
  category: "Sports",
  classification: "Sports and Recreation",

  icons: {
    icon: [{ url: "/benelux-gaa-crest.png", type: "image/png" }],
    apple: [{ url: "/benelux-gaa-crest.png", type: "image/png" }],
    shortcut: "/benelux-gaa-crest.png",
  },

  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Benelux GAA",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#1a3a4a",
    "theme-color": "#1a3a4a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-inter antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
