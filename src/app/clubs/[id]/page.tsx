import { prisma } from "@/lib/prisma";
import React from "react";
import type { Club } from "@/types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StructuredData, generateClubStructuredData } from "@/components/StructuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const club = await prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      return {
        title: "Club Not Found",
        description: "The requested GAA club could not be found.",
      };
    }

    const title = `${club.name} - GAA Club`;
    const description = `${club.name} is a Gaelic Athletic Association club located in ${club.location || 'Ireland'}. Join our GAA community and discover Irish sports including ${club.teamTypes?.join(', ') || 'Gaelic football, hurling, and camogie'}.`;

    return {
      title,
      description,
      keywords: [
        club.name,
        "GAA club",
        "Gaelic Athletic Association",
        club.location || "",
        club.region || "",
        ...club.teamTypes || [],
        "Irish sports club",
        "Gaelic football",
        "hurling",
        "camogie"
      ].filter(Boolean),
      openGraph: {
        title: `${title} | GAA Trips`,
        description,
        url: `https://gaa-trips.vercel.app/clubs/${id}`,
        type: "website",
        images: club.imageUrl ? [
          {
            url: club.imageUrl,
            width: 1200,
            height: 630,
            alt: `${club.name} - GAA Club`,
          }
        ] : [],
      },
      twitter: {
        title: `${title} | GAA Trips`,
        description,
        images: club.imageUrl ? [club.imageUrl] : [],
      },
      alternates: {
        canonical: `https://gaa-trips.vercel.app/clubs/${id}`,
      },
    };
  } catch (error) {
    console.error("Error generating club metadata:", error);
    return {
      title: "GAA Club | GAA Trips",
      description: "Discover GAA clubs worldwide.",
    };
  }
}

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
    <>
      <StructuredData data={generateClubStructuredData({
        ...club,
        region: club.region || undefined,
        website: club.website || undefined,
        facebook: club.facebook || undefined,
        instagram: club.instagram || undefined,
        imageUrl: club.imageUrl || undefined,
      })} />
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
        {club.teamTypes && club.teamTypes.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-500 text-xs font-semibold mb-2">Team Types</p>
            <div className="flex flex-wrap gap-2">
              {club.teamTypes.map((teamType) => (
                <span
                  key={teamType}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {teamType}
                </span>
              ))}
            </div>
          </div>
        )}
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
    </>
  );
}
