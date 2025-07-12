import { prisma } from "@/lib/prisma";
import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StructuredData, generateClubStructuredData } from "@/components/StructuredData";
import ClubEvents from "@/components/ClubEvents";
import ClubContactForm from "@/components/ClubContactForm";
import ClubCalendar from "@/components/club/ClubCalendar";

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
  
  const club = await prisma.club.findUnique({ 
    where: { id },
    include: {
      events: {
        orderBy: {
          startDate: 'asc'
        }
      }
    }
  });
  
  if (!club) {
    return <div className="text-red-600">Club not found.</div>;
  }
  return (
    <>
      <StructuredData data={generateClubStructuredData({
        ...club,
        region: club.region || null,
        website: club.website || null,
        facebook: club.facebook || null,
        instagram: club.instagram || null,
        imageUrl: club.imageUrl || null,
      })} />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Club Image */}
              <div className="flex-shrink-0">
                <Image
                  src={club.imageUrl || "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"}
                  alt={club.name}
                  width={200}
                  height={200}
                  className="w-48 h-48 rounded-full shadow-xl bg-white p-4 object-contain"
                />
              </div>
              
              {/* Club Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{club.name}</h1>
                
                {/* Location Badge */}
                {club.location && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xl font-medium">{club.location}</span>
                  </div>
                )}

                {/* Team Types */}
                {club.teamTypes && club.teamTypes.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {club.teamTypes.map((teamType) => (
                      <span
                        key={teamType}
                        className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {teamType}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <ClubContactForm clubId={club.id} clubName={club.name} type="contact" />
                  <ClubContactForm clubId={club.id} clubName={club.name} type="interest" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Club Details Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Club Information
                </h3>
                <div className="space-y-3">
                  {club.location && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-900">{club.location}</p>
                    </div>
                  )}
                  {club.region && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Region</p>
                      <p className="text-gray-900">{club.region}</p>
                    </div>
                  )}
                  {club.codes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Club Codes</p>
                      <p className="text-gray-900">{club.codes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(club.website || club.facebook || club.instagram) && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Follow Us
                  </h3>
                  <div className="space-y-3">
                    {club.website && (
                      <a
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        Official Website
                      </a>
                    )}
                    {club.facebook && (
                      <a
                        href={club.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    )}
                    {club.instagram && (
                      <a
                        href={club.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-pink-600 hover:text-pink-800 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(club.contactFirstName || club.contactEmail || club.contactPhone) && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Details
                  </h3>
                  <div className="space-y-3">
                    {(club.contactFirstName || club.contactLastName) && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Person</p>
                        <p className="text-gray-900">
                          {[club.contactFirstName, club.contactLastName].filter(Boolean).join(' ')}
                        </p>
                      </div>
                    )}
                    {club.contactEmail && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <a href={`mailto:${club.contactEmail}`} className="text-primary hover:text-primary/80">
                          {club.contactEmail}
                        </a>
                      </div>
                    )}
                    {club.contactPhone && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <a href={`tel:${club.contactPhone}`} className="text-primary hover:text-primary/80">
                          {club.contactCountryCode && `+${club.contactCountryCode} `}{club.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Back to Clubs Link */}
            <div className="text-center mt-8">
              <Link 
                href="/clubs" 
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to All Clubs
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ClubCalendar clubId={club.id} clubName={club.name} />
          </div>
        </div>
      </div>
      
      {/* Events Section */}
      {club.events && <ClubEvents events={club.events} />}
    </>
  );
}
