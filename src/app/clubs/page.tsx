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

async function getClubs({
  country,
  teamType,
  search,
}: {
  country?: string;
  teamType?: string;
  search?: string;
} = {}) {
  const where: {
    location?: { contains: string; mode: 'insensitive' };
    teamTypes?: { has: string };
    OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { location: { contains: string; mode: 'insensitive' } }>;
  } = {};
  
  if (country && country !== "") {
    where.location = { contains: country, mode: 'insensitive' };
  }
  
  if (teamType && teamType !== "") {
    where.teamTypes = { has: teamType };
  }
  
  if (search && search !== "") {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  return await prisma.club.findMany({
    where,
    orderBy: [{ location: "asc" }, { name: "asc" }],
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

export default async function ClubsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string }>;
}) {
  try {
    const params = searchParams ? await searchParams : {};
    const country = params.country || "";
    const teamType = params.teamType || "";
    const search = params.search || "";
    
    const clubs = await getClubs({ country, teamType, search });
    
    // Get unique countries and team types for filter options
    const allClubs = await prisma.club.findMany({
      select: { location: true, teamTypes: true },
    });
    
    const countries = Array.from(
      new Set(
        allClubs
          .map((club) => club.location?.split(",").pop()?.trim())
          .filter(Boolean)
      )
    ).sort() as string[];
    
    const teamTypes = Array.from(
      new Set(allClubs.flatMap((club) => club.teamTypes))
    ).sort();

    // Group clubs by country
    const clubsByCountry = clubs.reduce((acc: Record<string, ClubListItem[]>, club) => {
      const country = club.location?.split(",").pop()?.trim() || "Unknown";
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(club);
      return acc;
    }, {});

    // Sort countries alphabetically
    const sortedCountries = Object.keys(clubsByCountry).sort();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GAA CLUBS WORLDWIDE</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with Gaelic Athletic Association clubs around the world. Find your local GAA community and join the global Gaelic games family.
          </p>
          <Link
            href="/clubs/register"
            className="inline-block mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            REGISTER A CLUB
          </Link>
        </div>
        
        {/* Filters */}
        <form className="bg-white p-6 rounded-lg shadow-sm mb-8 flex flex-wrap gap-4" method="get">
          <input
            type="text"
            name="search"
            placeholder="Search clubs..."
            defaultValue={search}
            className="flex-1 min-w-64 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
          />
          <select
            name="country"
            defaultValue={country}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">All Countries</option>
            {countries.map((country: string) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            name="teamType"
            defaultValue={teamType}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">All Team Types</option>
            {teamTypes.map((type: string) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md font-semibold"
          >
            Apply Filters
          </button>
        </form>

        {/* Clubs grouped by country */}
        <div className="space-y-8">
          {sortedCountries.map((country) => (
            <div key={country}>
              <h2 className="text-lg font-semibold text-gray-600 mb-3 border-b border-gray-300 pb-1">
                {country} ({clubsByCountry[country].length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubsByCountry[country].map((club: ClubListItem) => (
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
                        <h3 className="text-lg font-semibold mb-1 text-primary">
                          {club.name}
                        </h3>
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
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Database connection error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">GAA Clubs</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Unable to load clubs. Please try again later.</p>
        </div>
      </div>
    );
  }
}
