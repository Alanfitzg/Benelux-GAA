import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GAA Clubs Worldwide",
  description:
    "Find Gaelic Athletic Association clubs around the world. Connect with local GAA communities, discover Irish sports clubs, and join the global Gaelic games family.",
  keywords: [
    "GAA clubs",
    "Gaelic Athletic clubs",
    "Irish clubs worldwide",
    "Gaelic football clubs",
    "hurling clubs",
    "camogie clubs",
    "Irish sports clubs",
    "GAA community",
    "Irish diaspora clubs",
    "local GAA clubs",
    "international GAA",
    "Gaelic sports clubs",
  ],
  openGraph: {
    title: "GAA Clubs Worldwide | GAA Trips",
    description:
      "Find Gaelic Athletic Association clubs around the world. Connect with local GAA communities and join the global Gaelic games family.",
    url: "https://gaa-trips.vercel.app/clubs",
    type: "website",
  },
  twitter: {
    title: "GAA Clubs Worldwide | GAA Trips",
    description:
      "Find GAA clubs around the world and connect with local Gaelic communities.",
  },
};

export default function ClubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
