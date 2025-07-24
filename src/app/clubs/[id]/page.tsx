import { prisma } from "@/lib/prisma";
import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  StructuredData,
  generateClubStructuredData,
} from "@/components/StructuredData";
import ClubEvents from "@/components/ClubEvents";
import ClubContactForm from "@/components/ClubContactForm";
import CompactCalendarWidget from "@/components/club/CompactCalendarWidget";
import ClubCalendar from "@/components/club/ClubCalendar";
import ClubAdminRequestButton from "@/components/club/ClubAdminRequestButton";
import { getServerSession } from "@/lib/auth-helpers";

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
    const description = `${club.name} is a Gaelic Athletic Association club located in ${club.location || "Ireland"}. Join our GAA community and discover Irish sports including ${club.teamTypes?.join(", ") || "Gaelic football, hurling, and camogie"}.`;

    return {
      title,
      description,
      keywords: [
        club.name,
        "GAA club",
        "Gaelic Athletic Association",
        club.location || "",
        club.region || "",
        ...(club.teamTypes || []),
        "Irish sports club",
        "Gaelic football",
        "hurling",
        "camogie",
      ].filter(Boolean),
      openGraph: {
        title: `${title} | GAA Trips`,
        description,
        url: `https://gaa-trips.vercel.app/clubs/${id}`,
        type: "website",
        images: club.imageUrl
          ? [
              {
                url: club.imageUrl,
                width: 1200,
                height: 630,
                alt: `${club.name} - GAA Club`,
              },
            ]
          : [],
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

  // Get session and club data
  const session = await getServerSession();

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: {
          startDate: "asc",
        },
      },
      admins: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Get user's admin request if they're logged in
  let adminRequest = null;
  let isCurrentAdmin = false;

  if (session?.user && club) {
    // Check if user is already an admin
    isCurrentAdmin = club.admins.some((admin) => admin.id === session.user.id);

    // Get user's admin request if they're not already an admin
    if (!isCurrentAdmin) {
      adminRequest = await prisma.clubAdminRequest.findUnique({
        where: {
          userId_clubId: {
            userId: session.user.id,
            clubId: id,
          },
        },
      });
    }
  }

  if (!club) {
    return <div className="text-red-600">Club not found.</div>;
  }
  return (
    <>
      <StructuredData
        data={generateClubStructuredData({
          ...club,
          region: club.region || null,
          website: club.website || null,
          facebook: club.facebook || null,
          instagram: club.instagram || null,
          imageUrl: club.imageUrl || null,
        })}
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Club Image */}
              <div className="flex-shrink-0">
                <Image
                  src={
                    club.imageUrl ||
                    "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                  }
                  alt={club.name}
                  width={200}
                  height={200}
                  className="w-48 h-48 rounded-full shadow-xl bg-white p-4 object-contain"
                />
              </div>

              {/* Club Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {club.name}
                </h1>

                {/* Location Badge */}
                {club.location && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
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
                  <ClubContactForm
                    clubId={club.id}
                    clubName={club.name}
                    type="contact"
                  />
                  <ClubAdminRequestButton
                    clubId={club.id}
                    clubName={club.name}
                    existingRequest={
                      adminRequest
                        ? {
                            id: adminRequest.id,
                            status: adminRequest.status,
                            requestedAt: adminRequest.requestedAt.toISOString(),
                            rejectionReason:
                              adminRequest.rejectionReason || undefined,
                          }
                        : undefined
                    }
                    isCurrentAdmin={isCurrentAdmin}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Quick Info Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                {club.location && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">{club.location}</span>
                  </div>
                )}
                {club.teamTypes && club.teamTypes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {club.teamTypes.join(", ")}
                    </span>
                  </div>
                )}
                {club.admins && club.admins.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="font-medium">
                      {club.admins.length} Admin
                      {club.admins.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {(club.website || club.facebook || club.instagram) && (
                  <div className="flex items-center gap-3">
                    {club.website && (
                      <a
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                          />
                        </svg>
                      </a>
                    )}
                    {club.facebook && (
                      <a
                        href={club.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {club.instagram && (
                      <a
                        href={club.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Club Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Club Information
                    </h3>
                    <div className="space-y-3">
                      {club.location && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Location
                          </p>
                          <p className="text-gray-900">{club.location}</p>
                        </div>
                      )}
                      {club.region && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Region
                          </p>
                          <p className="text-gray-900">{club.region}</p>
                        </div>
                      )}
                      {club.codes && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Club Codes
                          </p>
                          <p className="text-gray-900">{club.codes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Club Admins and Contact Combined */}
                  {(club.admins && club.admins.length > 0) ||
                  club.contactFirstName ||
                  club.contactEmail ||
                  club.contactPhone ? (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Contact & Admin
                      </h3>

                      {/* Contact Details */}
                      {(club.contactFirstName ||
                        club.contactEmail ||
                        club.contactPhone) && (
                        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                          {(club.contactFirstName || club.contactLastName) && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">
                                Contact:
                              </span>
                              <span className="text-sm text-gray-900">
                                {[club.contactFirstName, club.contactLastName]
                                  .filter(Boolean)
                                  .join(" ")}
                              </span>
                            </div>
                          )}
                          {club.contactEmail && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">
                                Email:
                              </span>
                              <a
                                href={`mailto:${club.contactEmail}`}
                                className="text-sm text-primary hover:text-primary/80"
                              >
                                {club.contactEmail}
                              </a>
                            </div>
                          )}
                          {club.contactPhone && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">
                                Phone:
                              </span>
                              <a
                                href={`tel:${club.contactPhone}`}
                                className="text-sm text-primary hover:text-primary/80"
                              >
                                {club.contactCountryCode &&
                                  `+${club.contactCountryCode} `}
                                {club.contactPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admins */}
                      {club.admins && club.admins.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500 mb-2">
                            Administrators:
                          </p>
                          {club.admins.map((admin) => (
                            <div
                              key={admin.id}
                              className="flex items-center space-x-3"
                            >
                              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {admin.name
                                    ? admin.name.charAt(0).toUpperCase()
                                    : admin.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {admin.name || "Club Admin"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {admin.email}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Events Section */}
                {club.events && club.events.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Recent Events
                    </h3>
                    <ClubEvents events={club.events} compact={true} />
                  </div>
                )}
              </div>

              {/* Right Column - Calendar Widget */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-4">
                  <CompactCalendarWidget
                    clubId={club.id}
                    clubName={club.name}
                    userId={session?.user?.id}
                  />
                </div>
              </div>
            </div>

            {/* Back to Clubs Link */}
            <div className="text-center mt-8">
              <Link
                href="/clubs"
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to All Clubs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full Calendar Section */}
      <div id="full-calendar" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Club Calendar
            </h2>
            <ClubCalendar clubId={club.id} clubName={club.name} />
          </div>
        </div>
      </div>
    </>
  );
}
