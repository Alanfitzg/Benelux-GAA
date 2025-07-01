import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How It Works | Gaelic Trips",
  description:
    "Learn how Gaelic Trips supports GAA clubs through team tickets, day passes, and community-first principles. Discover how our platform works and puts money back into clubs.",
  keywords: [
    "how gaelic trips works",
    "GAA club support",
    "team tickets",
    "day passes",
    "GAA tournament platform",
    "club revenue",
    "gaelic games travel",
  ],
  openGraph: {
    title: "How It Works | Gaelic Trips",
    description:
      "Learn how Gaelic Trips supports GAA clubs and puts money back into the community through our transparent platform.",
    url: "https://gaa-trips.vercel.app/how-it-works",
    type: "website",
  },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
