import { prisma } from '@/lib/prisma';
import React from 'react';
import Link from 'next/link';

async function getClubs() {
  return await prisma.club.findMany({
    orderBy: { name: 'asc' },
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
        <Link href="/clubs/register" className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition">Register a Club</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <Link key={club.id} href={`/clubs/${club.id}`} className="block">
            <div className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer">
              <h2 className="text-lg font-semibold mb-1 text-green-800">{club.name}</h2>
              <p className="text-gray-700"><strong>Location:</strong> {club.location || '-'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}