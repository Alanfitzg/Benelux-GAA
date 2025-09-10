import React from "react";
import type { Metadata } from "next";
import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How It Works | PlayAway",
  description:
    "Learn how PlayAway supports GAA clubs through team tickets, day passes, and community-first principles. Discover how our platform works and puts money back into clubs.",
  keywords: [
    "how playaway works",
    "GAA club support",
    "team tickets",
    "day passes",
    "GAA tournament platform",
    "club revenue",
    "gaelic games travel",
  ],
  openGraph: {
    title: "How It Works | PlayAway",
    description:
      "Learn how PlayAway supports GAA clubs and puts money back into the community through our transparent platform.",
    url: "https://play-away.vercel.app/how-it-works",
    type: "website",
  },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
