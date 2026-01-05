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
import ClubCalendar from "@/components/club/ClubCalendar";
import ClubAdminRequestButton from "@/components/club/ClubAdminRequestButton";
import { getServerSession } from "@/lib/auth-helpers";
import VerifiedBadge, {
  VerifiedTooltip,
} from "@/components/club/VerifiedBadge";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import ClubProfileNav from "@/components/club/ClubProfileNav";
import ClubAboutSection from "@/components/club/ClubAboutSection";
import ClubStatsCard from "@/components/club/ClubStatsCard";
import ClubContactCard from "@/components/club/ClubContactCard";
import ClubFriendsSection from "@/components/club/ClubFriendsSection";
import ClubPhotoGallery from "@/components/club/ClubPhotoGallery";
import ClubTournamentsSection from "@/components/club/ClubTournamentsSection";

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

  let adminRequest = null;
  let isCurrentAdmin = false;

  if (session?.user && club) {
    isCurrentAdmin = club.admins.some((admin) => admin.id === session.user.id);

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

      {/* Hero Section - Clean white design */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Crest */}
              <div className="flex-shrink-0">
                <Image
                  src={
                    club.imageUrl ||
                    "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                  }
                  alt={club.name}
                  width={120}
                  height={120}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-contain bg-gray-50 p-2"
                  unoptimized
                />
              </div>

              {/* Club Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {club.name}
                  </h1>
                  {club.verificationStatus === "VERIFIED" && (
                    <VerifiedTooltip>
                      <VerifiedBadge size="md" showText={false} />
                    </VerifiedTooltip>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {club.location && (
                    <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1.5">
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
                    </p>
                  )}
                  <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1.5">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {club.foundedYear ? `Est. ${club.foundedYear}` : "Est. —"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
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

      {/* Section Navigation */}
      <ClubProfileNav />

      {/* Main Content */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* About Section */}
            <ClubAboutSection
              clubId={club.id}
              clubName={club.name}
              bio={club.bio}
              foundedYear={club.foundedYear}
              teamTypes={club.teamTypes}
              isOpenToVisitors={club.isOpenToVisitors}
              preferredWeekends={club.preferredWeekends as string[] | null}
            />

            {/* Stats and Contact Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClubStatsCard clubId={club.id} />
              <ClubContactCard
                contactEmail={club.contactEmail}
                contactPhone={club.contactPhone}
                contactCountryCode={club.contactCountryCode}
                contactFirstName={club.contactFirstName}
                contactLastName={club.contactLastName}
                website={club.website}
                facebook={club.facebook}
                instagram={club.instagram}
                twitter={club.twitter}
                tiktok={club.tiktok}
              />
            </div>

            {/* Tournaments Section */}
            <section id="events" className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ClubTournamentsSection
                    upcomingEvents={upcomingEvents}
                    pastEvents={pastEventsForDisplay}
                  />
                </div>

                {/* Club Admin Section */}
                <div className="lg:col-span-1">
                  {((club.admins && club.admins.length > 0) ||
                    (isCurrentAdmin &&
                      club.verificationStatus !== "VERIFIED")) && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      {club.admins && club.admins.length > 0 && (
                        <div className="mb-4">
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

                      {isCurrentAdmin &&
                        club.verificationStatus !== "VERIFIED" && (
                          <div className="bg-amber-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-amber-800">
                              Club Verification
                            </h4>
                            <p className="text-sm text-amber-700 mt-1">
                              Complete verification to unlock premium features
                            </p>
                            <Link
                              href={`/club-admin/${club.id}`}
                              className="inline-flex items-center mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                            >
                              Complete Verification
                            </Link>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Friends & Twin Club Section */}
            <ClubFriendsSection
              clubId={club.id}
              clubName={club.name}
              isAdmin={isCurrentAdmin || session?.user?.role === "SUPER_ADMIN"}
              twinClub={club.twinClub}
            />

            {/* Photo Gallery */}
            <ClubPhotoGallery
              clubId={club.id}
              isAdmin={isCurrentAdmin || session?.user?.role === "SUPER_ADMIN"}
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

      {/* Full Calendar Section */}
      <section id="calendar" className="scroll-mt-24 py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                className="w-7 h-7 text-primary"
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
              Club Calendar
            </h2>
            <ClubCalendar clubId={club.id} clubName={club.name} />
          </div>
        </div>
      </section>
    </>
  );
}
