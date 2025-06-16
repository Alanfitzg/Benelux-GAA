import { prisma } from '@/lib/prisma';
import React from 'react';
import Link from 'next/link';

async function getClubs() {
  return await prisma.club.findMany({
    orderBy: { name: 'asc' },
  });
}

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const clubs = await getClubs();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-900">European GAA Clubs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club: { id: string; name: string; region: string | null; city: string | null; country: string | null }) => (
          <Link key={club.id} href={`/clubs/${club.id}`} className="block">
            <div className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer">
              <h2 className="text-lg font-semibold mb-1 text-green-800">{club.name}</h2>
              <p className="text-gray-700"><strong>Region:</strong> {club.region || '-'}</p>
              <p className="text-gray-700"><strong>City:</strong> {club.city || '-'}</p>
              <p className="text-gray-700"><strong>Country:</strong> {club.country || '-'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 