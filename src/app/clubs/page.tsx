import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GAA Clubs Worldwide",
  description: "Find Gaelic Athletic Association clubs around the world. Connect with local GAA communities, discover Irish sports clubs, and join the global Gaelic games family.",
  keywords: [
    "GAA clubs", "Gaelic Athletic clubs", "Irish clubs worldwide", 
    "Gaelic football clubs", "hurling clubs", "camogie clubs", 
    "Irish sports clubs", "GAA community", "Irish diaspora clubs",
    "local GAA clubs", "international GAA", "Gaelic sports clubs"
  ],
  openGraph: {
    title: "GAA Clubs Worldwide | GAA Trips",
    description: "Find Gaelic Athletic Association clubs around the world. Connect with local GAA communities and join the global Gaelic games family.",
    url: "https://gaa-trips.vercel.app/clubs",
    type: "website",
  },
  twitter: {
    title: "GAA Clubs Worldwide | GAA Trips",
    description: "Find GAA clubs around the world and connect with local Gaelic communities.",
  },
};

type ClubListItem = {
  id: string;
  name: string;
  map: string | null;
  imageUrl: string | null;
  region: string | null;
  subRegion: string | null;
  location: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  teamTypes: string[];
};

async function getClubs() {
  return await prisma.club.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      region: true,
      subRegion: true,
      map: true,
      location: true,
      facebook: true,
      instagram: true,
      website: true,
      codes: true,
      teamTypes: true,
    },
  });
}

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const clubs = await getClubs();
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">European Gaelic Clubs</h1>
        <Link
          href="/clubs/register"
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
        >
          Register a Club
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club: ClubListItem) => (
          <Link key={club.id} href={`/clubs/${club.id}`} className="block">
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow hover:bg-gray-50 cursor-pointer flex items-center gap-4">
              <Image
                src={club.imageUrl || "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"}
                alt={`${club.name} crest`}
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-contain bg-gray-100"
              />
              <div>
                <h2 className="text-lg font-semibold mb-1 text-primary">
                  {club.name}
                </h2>
                <p className="text-gray-700">
                  <strong>Location:</strong> {club.location || "-"}
                </p>
                {club.teamTypes.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    {club.teamTypes.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
