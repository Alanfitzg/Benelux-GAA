import { prisma } from "@/lib/prisma";
import React from "react";
import type { Club } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default async function ClubDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const club = (await prisma.club.findUnique({ where: { id } })) as Club & { location?: string };
  if (!club) {
    return <div className="text-red-600">Club not found.</div>;
  }
  return (
    <div className="flex justify-center items-center min-h-[80vh] px-2">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full">
        <div className="flex justify-center mb-6">
          <Image
            src={club.imageUrl || "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"}
            alt={club.name}
            width={300}
            height={192}
            className="max-h-48 rounded-lg shadow object-contain"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-center text-primary mb-2">
          {club.name}
        </h1>
        <div className="flex justify-center mb-4">
          <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
            {club.location || '-'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-500 text-xs font-semibold">Location</p>
            <p className="text-gray-800">{club.location || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold">Codes</p>
            <p className="text-gray-800">{club.codes || "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {club.facebook && (
            <a
              href={club.facebook}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          )}
          {club.instagram && (
            <a
              href={club.instagram}
              className="text-pink-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          )}
          {club.website && (
            <a
              href={club.website}
              className="text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          )}
        </div>
        <div className="flex justify-center">
          <Link href="/clubs" className="text-primary underline">
            Back to Clubs
          </Link>
        </div>
      </div>
    </div>
  );
}
