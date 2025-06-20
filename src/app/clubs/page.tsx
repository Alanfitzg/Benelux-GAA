import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import Image from "next/image";

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
    },
  });
}

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const clubs = await getClubs();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">European GAA Clubs</h1>
        <Link
          href="/clubs/register"
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
        >
          Register a Club
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club: ClubListItem) => (
          <Link key={club.id} href={`/clubs/${club.id}`} className="block">
            <div className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer flex items-center gap-4">
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
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
