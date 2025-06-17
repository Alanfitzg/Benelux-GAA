import { prisma } from '@/lib/prisma';
import React from 'react';
import Link from 'next/link';

export default async function ClubDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club = await prisma.club.findUnique({ where: { id } }) as (typeof prisma.club extends { findUnique: (args: any) => Promise<infer T> } ? T : any) & { imageUrl?: string };
  if (!club) {
    return <div className="text-red-600">Club not found.</div>;
  }
  return (
    <div>
      {club.imageUrl && (
        <img src={club.imageUrl} alt={club.name} className="max-h-64 mb-4 rounded shadow" />
      )}
      <h1 className="text-2xl font-bold mb-4 text-green-800">{club.name}</h1>
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="text-gray-700"><strong>Region:</strong> {club.region || '-'}</p>
        <p className="text-gray-700"><strong>Sub-region:</strong> {club.subRegion || '-'}</p>
        <p className="text-gray-700"><strong>City:</strong> {club.city || '-'}</p>
        <p className="text-gray-700"><strong>Country:</strong> {club.country || '-'}</p>
        {club.codes && <p className="text-gray-700"><strong>Codes:</strong> {club.codes}</p>}
        <div className="mt-4 space-x-4">
          {club.facebook && <Link href={club.facebook} className="text-blue-600 underline" target="_blank">Facebook</Link>}
          {club.instagram && <Link href={club.instagram} className="text-pink-600 underline" target="_blank">Instagram</Link>}
          {club.website && <Link href={club.website} className="text-blue-800 underline" target="_blank">Website</Link>}
        </div>
      </div>
      <Link href="/clubs" className="text-green-800 underline">Back to Clubs</Link>
    </div>
  );
} 