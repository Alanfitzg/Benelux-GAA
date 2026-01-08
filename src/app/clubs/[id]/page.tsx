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
import ClubAboutSection from "@/components/club/ClubAboutSection";
import ClubContactCard from "@/components/club/ClubContactCard";
import SportsBadges from "@/components/club/SportsBadges";
import ClubFriendsSection from "@/components/club/ClubFriendsSection";
import ClubPhotoGallery from "@/components/club/ClubPhotoGallery";
import ClubTournamentsSection from "@/components/club/ClubTournamentsSection";
import ClubCoverPhotoBanner from "@/components/club/ClubCoverPhotoBanner";
import SocialMediaIcons from "@/components/club/SocialMediaIcons";

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
        orderBy: {
          startDate: "asc",
        },
        include: {
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

  if (session?.user && club) {
    isCurrentAdmin = club.admins.some((admin) => admin.id === session.user.id);
  }

  if (!club) {
    return <div className="text-red-600">Club not found.</div>;
  }

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
    }));

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

      {/* Hero Section - Merged with About content */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Larger Crest */}
              <div className="flex-shrink-0">
                <Image
                  src={
                    club.imageUrl ||
                    "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                  }
                  alt={club.name}
                  width={180}
                  height={180}
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-xl object-contain bg-gray-50 p-3 shadow-sm"
                  unoptimized
                />
              </div>

              {/* Club Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {club.name}
                  </h1>
                  {club.verificationStatus === "VERIFIED" && (
                    <VerifiedTooltip>
                      <VerifiedBadge size="md" showText={false} />
                    </VerifiedTooltip>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-600 mb-4">
                  {club.location && (
                    <span className="flex items-center gap-1.5">
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
                      {club.location}
                    </span>
                  )}
                  {club.foundedYear && (
                    <span className="flex items-center gap-1.5">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Est. {club.foundedYear}
                    </span>
                  )}
                </div>

                {/* Sports Badges */}
                {club.teamTypes && club.teamTypes.length > 0 && (
                  <div className="mb-5">
                    <SportsBadges teamTypes={club.teamTypes} size="md" />
                  </div>
                )}

                {/* Action Buttons and Social Icons */}
                <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                  <ClubContactForm
                    clubId={club.id}
                    clubName={club.name}
                    type="contact"
                  />
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

                  {/* Social Media Icons */}
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
      </div>

      {/* Section Navigation */}
      <ClubProfileNav />

      {/* Main Content */}
      <div className="bg-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Tournaments Section - First for European clubs */}
            <section id="events" className="scroll-mt-24">
              {session?.user?.role === "SUPER_ADMIN" &&
              club.admins &&
              club.admins.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2">
                    <ClubTournamentsSection
                      upcomingEvents={upcomingEvents}
                      pastEvents={pastEventsForDisplay}
                      isMainlandEurope={club.isMainlandEurope}
                    />
                  </div>
                  <div className="lg:col-span-1">
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
                  </div>
                </div>
              ) : (
                <ClubTournamentsSection
                  upcomingEvents={upcomingEvents}
                  pastEvents={pastEventsForDisplay}
                  isMainlandEurope={club.isMainlandEurope}
                />
              )}
            </section>

            {/* Available Dates + Photo Gallery */}
            <section id="gallery" className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {club.isMainlandEurope && (
                  <div className="lg:col-span-1">
                    <ClubAboutSection
                      clubId={club.id}
                      clubName={club.name}
                      isOpenToVisitors={club.isOpenToVisitors}
                      preferredWeekends={
                        club.preferredWeekends as string[] | null
                      }
                      isMainlandEurope={club.isMainlandEurope}
                    />
                  </div>
                )}
                <div
                  className={
                    club.isMainlandEurope ? "lg:col-span-2" : "lg:col-span-3"
                  }
                >
                  <ClubPhotoGallery
                    clubId={club.id}
                    isAdmin={
                      isCurrentAdmin || session?.user?.role === "SUPER_ADMIN"
                    }
                    isMainlandEurope={club.isMainlandEurope}
                  />
                </div>
              </div>
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
              isAdmin={isCurrentAdmin || session?.user?.role === "SUPER_ADMIN"}
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

      {/* Calendar Modal Trigger - Fixed at bottom or in a section */}
      <section
        id="calendar"
        className="scroll-mt-24 py-8 bg-white border-t border-gray-200"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <ClubCalendarModal clubId={club.id} clubName={club.name} />
          </div>
        </div>
      </section>
    </>
  );
}
