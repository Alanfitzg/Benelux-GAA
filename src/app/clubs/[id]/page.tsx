import { prisma } from "@/lib/prisma";
import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  StructuredData,
  generateClubStructuredData,
} from "@/components/StructuredData";
import ClubContactForm from "@/components/ClubContactForm";
import ClubCalendarModal from "@/components/club/ClubCalendarModal";
import { getServerSession } from "@/lib/auth-helpers";
import VerifiedBadge, {
  VerifiedTooltip,
} from "@/components/club/VerifiedBadge";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import ClubProfileNav from "@/components/club/ClubProfileNav";
import ClubContactCard from "@/components/club/ClubContactCard";
import SportsBadges from "@/components/club/SportsBadges";
import ClubFriendsSection from "@/components/club/ClubFriendsSection";
import ClubPhotoGallery from "@/components/club/ClubPhotoGallery";
import ClubTournamentsSection from "@/components/club/ClubTournamentsSection";
import ClubCoverPhotoBanner from "@/components/club/ClubCoverPhotoBanner";
import SocialMediaIcons from "@/components/club/SocialMediaIcons";
import AuthGateButtons from "@/components/club/AuthGateButtons";
import ClubAdminRequestButton from "@/components/club/ClubAdminRequestButton";
import VisitClubCard from "@/components/club/VisitClubCard";

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
        title: `${title} | PlayAway`,
        description,
        url: `https://playaway.vercel.app/clubs/${id}`,
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
        title: `${title} | PlayAway`,
        description,
        images: club.imageUrl ? [club.imageUrl] : [],
      },
      alternates: {
        canonical: `https://playaway.vercel.app/clubs/${id}`,
      },
    };
  } catch (error) {
    console.error("Error generating club metadata:", error);
    return {
      title: "GAA Club | PlayAway",
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

  const session = await getServerSession();

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      events: {
        where: {
          approvalStatus: "APPROVED",
        },
        orderBy: {
          startDate: "asc",
        },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          location: true,
          eventType: true,
          cost: true,
          platformFee: true,
          maxTeams: true,
          imageUrl: true,
          acceptedTeamTypes: true,
          _count: {
            select: { teams: true },
          },
        },
      },
      admins: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      twinClub: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          location: true,
        },
      },
    },
  });

  const testimonials = await prisma.testimonial.findMany({
    where: {
      clubId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { displayOrder: "asc" },
      { submittedAt: "desc" },
    ],
  });

  const approvedTestimonials = testimonials.filter(
    (t) => t.status === "APPROVED"
  );
  const userTestimonial = session?.user
    ? testimonials.find((t) => t.userId === session.user.id)
    : null;

  let isCurrentAdmin = false;
  let existingAdminRequest = null;
  let userAlreadyHasClub = false;

  if (session?.user && club) {
    isCurrentAdmin = club.admins.some((admin) => admin.id === session.user.id);

    // Check if user is already associated with a different club
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clubId: true, isClubMember: true },
    });

    // User already has a club if they have a clubId AND it's different from this club
    userAlreadyHasClub = !!(
      currentUser?.clubId && currentUser.clubId !== club.id
    );

    // Fetch existing admin request if user is not already an admin
    if (!isCurrentAdmin) {
      existingAdminRequest = await prisma.clubAdminRequest.findUnique({
        where: {
          userId_clubId: {
            userId: session.user.id,
            clubId: club.id,
          },
        },
        select: {
          id: true,
          status: true,
          requestedAt: true,
          rejectionReason: true,
        },
      });
    }
  }

  if (!club) {
    return <div className="text-red-600">Club not found.</div>;
  }

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  const now = new Date();
  const upcomingEvents = club.events.filter(
    (event) => new Date(event.startDate) >= now
  );
  const pastEventsForDisplay = club.events
    .filter((event) => new Date(event.startDate) < now)
    .map((event) => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate.toISOString(),
      location: event.location,
      eventType: event.eventType,
      teamsCount: event._count.teams,
      imageUrl: event.imageUrl,
    }));

  // Show limited view for non-authenticated users
  if (!isAuthenticated) {
    return (
      <>
        <StructuredData
          data={generateClubStructuredData({
            id: club.id,
            name: club.name,
            location: club.location || null,
            imageUrl: club.imageUrl || null,
            website: club.website || null,
            teamTypes: club.teamTypes || [],
            sportsSupported: club.sportsSupported || [],
          })}
        />

        {/* Cover Photo Banner */}
        <ClubCoverPhotoBanner clubId={club.id} />

        {/* Blue Header Banner with Crest - Limited view */}
        <div className="bg-gradient-to-br from-[#264673] to-[#1a3352] py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-row items-center gap-4 sm:gap-6">
                {/* Text Content - Left Side */}
                <div className="flex-1 min-w-0">
                  {/* Club Name and Verification Badge */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white truncate">
                      {club.name}
                    </h1>
                    {club.verificationStatus === "VERIFIED" && (
                      <VerifiedTooltip>
                        <VerifiedBadge size="md" showText={false} />
                      </VerifiedTooltip>
                    )}
                  </div>

                  {/* Location and Founded Year */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/80 text-sm sm:text-base">
                    {club.location && (
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 flex-shrink-0"
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
                        <span className="truncate">{club.location}</span>
                      </span>
                    )}
                    {club.foundedYear && (
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Est. {club.foundedYear}
                      </span>
                    )}
                  </div>
                </div>

                {/* Crest - Right Side */}
                <div className="flex-shrink-0">
                  <Image
                    src={
                      club.imageUrl ||
                      "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                    }
                    alt={club.name}
                    width={140}
                    height={140}
                    className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl object-contain bg-white p-2 sm:p-3 shadow-lg"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Card - Limited view */}
        <div className="bg-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                {/* Sports Badges */}
                {club.teamTypes && club.teamTypes.length > 0 && (
                  <div className="mb-5">
                    <SportsBadges teamTypes={club.teamTypes} size="md" />
                  </div>
                )}

                {/* Social Media Icons - Show even to non-authenticated */}
                <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                  <SocialMediaIcons
                    website={club.website}
                    facebook={club.facebook}
                    instagram={club.instagram}
                    twitter={club.twitter}
                    tiktok={club.tiktok}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Gate - Prompt to login/signup */}
        <div className="bg-gray-200 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Blurred preview hint */}
                <div className="relative h-32 bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-4 opacity-30 blur-sm">
                      <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                      <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                      <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                </div>

                {/* CTA Content */}
                <div className="px-6 sm:px-10 py-8 text-center -mt-8 relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    See Full Club Profile
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create a free account or log in to view {club.name}&apos;s
                    full profile including tournaments, gallery, testimonials,
                    and contact information.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <AuthGateButtons clubId={club.id} />
                  </div>

                  {/* Benefits list */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-4">
                      With a free account you can:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        View full club profiles
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Contact clubs directly
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Register for tournaments
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Leave testimonials
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Link */}
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
      </>
    );
  }

  return (
    <>
      <StructuredData
        data={generateClubStructuredData({
          id: club.id,
          name: club.name,
          location: club.location || null,
          imageUrl: club.imageUrl || null,
          website: club.website || null,
          teamTypes: club.teamTypes || [],
          sportsSupported: club.sportsSupported || [],
        })}
      />

      {/* Cover Photo Banner */}
      <ClubCoverPhotoBanner clubId={club.id} />

      {/* Blue Header Banner with Crest */}
      <div className="bg-gradient-to-br from-[#264673] to-[#1a3352] py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-row items-start gap-4 sm:gap-6">
              {/* Text Content - Left Side */}
              <div className="flex-1 min-w-0 pr-2">
                {/* Club Name and Verification Badge */}
                <div className="flex items-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white line-clamp-2 sm:line-clamp-1">
                    {club.name}
                  </h1>
                  {club.verificationStatus === "VERIFIED" && (
                    <VerifiedTooltip>
                      <VerifiedBadge size="md" showText={false} />
                    </VerifiedTooltip>
                  )}
                </div>

                {/* Location and Founded Year */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/80 text-sm sm:text-base">
                  {club.clubType && club.clubType !== "CLUB" && (
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/20 text-white text-xs sm:text-sm font-medium rounded-full">
                      <svg
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {club.clubType === "UNIVERSITY" && (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          />
                        )}
                        {club.clubType === "SCHOOL" && (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        )}
                        {club.clubType === "COUNTY" && (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                          />
                        )}
                      </svg>
                      {club.clubType === "UNIVERSITY" && "University"}
                      {club.clubType === "SCHOOL" && "School"}
                      {club.clubType === "COUNTY" && "County"}
                    </span>
                  )}
                  {club.location && (
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 flex-shrink-0"
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
                      <span className="truncate">{club.location}</span>
                    </span>
                  )}
                  {club.foundedYear && (
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Est. {club.foundedYear}
                    </span>
                  )}
                </div>

                {/* Contact Button and Social Icons - In Header */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <ClubContactForm
                    clubId={club.id}
                    clubName={club.name}
                    type="contact"
                    compact
                  />
                  <SocialMediaIcons
                    website={club.website}
                    facebook={club.facebook}
                    instagram={club.instagram}
                    twitter={club.twitter}
                    tiktok={club.tiktok}
                    compact
                  />
                </div>
              </div>

              {/* Crest - Right Side */}
              <div className="flex-shrink-0">
                <Image
                  src={
                    club.imageUrl ||
                    "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                  }
                  alt={club.name}
                  width={140}
                  height={140}
                  className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl object-contain bg-white p-2 sm:p-3 shadow-lg"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Card - Only show if there's content (sports badges or admin buttons) */}
      {((club.teamTypes && club.teamTypes.length > 0) ||
        isCurrentAdmin ||
        session?.user?.role === "SUPER_ADMIN" ||
        !userAlreadyHasClub) && (
        <div className="bg-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                {/* Sports Badges */}
                {club.teamTypes && club.teamTypes.length > 0 && (
                  <div
                    className={
                      isCurrentAdmin ||
                      session?.user?.role === "SUPER_ADMIN" ||
                      !userAlreadyHasClub
                        ? "mb-5"
                        : ""
                    }
                  >
                    <SportsBadges teamTypes={club.teamTypes} size="md" />
                  </div>
                )}

                {/* Admin Action Buttons */}
                {(isCurrentAdmin ||
                  session?.user?.role === "SUPER_ADMIN" ||
                  !userAlreadyHasClub) && (
                  <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                    {(isCurrentAdmin ||
                      session?.user?.role === "SUPER_ADMIN") && (
                      <>
                        <Link
                          href={`/clubs/${club.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit Page
                        </Link>
                        <Link
                          href={`/club-admin/${club.id}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Dashboard
                        </Link>
                      </>
                    )}

                    {/* Admin Request Button - for non-admins who aren't already associated with another club */}
                    {!userAlreadyHasClub && (
                      <ClubAdminRequestButton
                        clubId={club.id}
                        clubName={club.name}
                        existingRequest={
                          existingAdminRequest
                            ? {
                                id: existingAdminRequest.id,
                                status: existingAdminRequest.status as
                                  | "PENDING"
                                  | "APPROVED"
                                  | "REJECTED",
                                requestedAt:
                                  existingAdminRequest.requestedAt.toISOString(),
                                rejectionReason:
                                  existingAdminRequest.rejectionReason ||
                                  undefined,
                              }
                            : undefined
                        }
                        isCurrentAdmin={isCurrentAdmin}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="bg-gray-200 pt-4">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ClubProfileNav />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section: Tournaments (main) + Visit Card (sidebar for European clubs) */}
            <section id="events" className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Visit Club Card - Mobile Only (shown first on mobile) */}
                {club.isMainlandEurope && (
                  <div className="lg:hidden">
                    <VisitClubCard
                      clubId={club.id}
                      clubName={club.name}
                      dayPassPrice={club.dayPassPrice}
                      dayPassCurrency={club.dayPassCurrency}
                      isOpenToVisitors={club.isOpenToVisitors}
                      preferredWeekends={
                        club.preferredWeekends as string[] | null
                      }
                    />
                  </div>
                )}

                {/* Tournaments - Main Section */}
                <div
                  className={
                    club.isMainlandEurope ? "lg:col-span-2" : "lg:col-span-3"
                  }
                >
                  <ClubTournamentsSection
                    upcomingEvents={upcomingEvents}
                    pastEvents={pastEventsForDisplay}
                    isMainlandEurope={club.isMainlandEurope}
                  />
                </div>

                {/* Sidebar for European clubs - Visit Card + Admin Info */}
                {club.isMainlandEurope && (
                  <div className="lg:col-span-1 space-y-6">
                    {/* Visit Club Card - Desktop Only (in sidebar) */}
                    <div className="hidden lg:block">
                      <VisitClubCard
                        clubId={club.id}
                        clubName={club.name}
                        dayPassPrice={club.dayPassPrice}
                        dayPassCurrency={club.dayPassCurrency}
                        isOpenToVisitors={club.isOpenToVisitors}
                        preferredWeekends={
                          club.preferredWeekends as string[] | null
                        }
                      />
                    </div>

                    {/* Club Admins - Only for Super Admin */}
                    {session?.user?.role === "SUPER_ADMIN" &&
                      club.admins &&
                      club.admins.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400"
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
                            Club Admins
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              Admin Only
                            </span>
                          </h3>
                          <div className="space-y-2">
                            {club.admins.map((admin) => (
                              <div
                                key={admin.id}
                                className="flex items-center gap-3"
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
                        </div>
                      )}
                  </div>
                )}
              </div>
            </section>

            {/* Photo Gallery Section */}
            <section id="gallery" className="scroll-mt-24">
              <ClubPhotoGallery
                clubId={club.id}
                isAdmin={
                  isCurrentAdmin || session?.user?.role === "SUPER_ADMIN"
                }
                isMainlandEurope={club.isMainlandEurope}
              />
            </section>

            {/* Contact card only for super admins */}
            {session?.user?.role === "SUPER_ADMIN" && (
              <ClubContactCard
                contactEmail={club.contactEmail}
                contactPhone={club.contactPhone}
                contactCountryCode={club.contactCountryCode}
                contactFirstName={club.contactFirstName}
                contactLastName={club.contactLastName}
                isSuperAdmin={true}
              />
            )}

            {/* Friends & Twin Club Section */}
            <ClubFriendsSection
              clubId={club.id}
              clubName={club.name}
              twinClub={club.twinClub}
            />

            {/* Testimonials Section */}
            <section id="testimonials" className="scroll-mt-24">
              <TestimonialSection
                clubId={club.id}
                clubName={club.name}
                approvedTestimonials={approvedTestimonials.map((t) => ({
                  id: t.id,
                  content: t.content,
                  user: t.user,
                  submittedAt: t.submittedAt.toISOString(),
                }))}
                userTestimonial={
                  userTestimonial
                    ? {
                        id: userTestimonial.id,
                        content: userTestimonial.content,
                      }
                    : undefined
                }
                isAuthenticated={!!session?.user}
              />
            </section>

            {/* Calendar Section */}
            <section id="calendar" className="scroll-mt-24">
              <div className="max-w-2xl mx-auto">
                <ClubCalendarModal clubId={club.id} clubName={club.name} />
              </div>
            </section>

            {/* Back Link */}
            <div className="text-center">
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
    </>
  );
}
