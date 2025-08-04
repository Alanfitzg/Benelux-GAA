import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { EVENT_TYPES } from "@/lib/constants/events";
import { MESSAGES } from "@/lib/constants";
import CreateEventButton from "@/components/CreateEventButton";
import { StructuredData } from "@/components/StructuredData";
import { getCityDefaultImage } from "@/lib/city-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gaelic Tournaments & Events",
  description:
    "Discover Gaelic tournaments and events worldwide. Find Gaelic football, hurling, camogie, and handball competitions near you.",
  keywords: [
    "Gaelic tournaments",
    "Gaelic football events",
    "hurling competitions",
    "camogie tournaments",
    "handball events",
    "Irish sports events",
    "GAA competitions",
    "Gaelic games calendar",
    "Irish sports calendar",
  ],
  openGraph: {
    title: "Gaelic Tournaments & Events | PlayAway",
    description:
      "Discover Gaelic Athletic Association tournaments and events worldwide. Find competitions and join the global GAA community.",
    url: "https://play-away.vercel.app/events",
    type: "website",
  },
  alternates: {
    canonical: "https://play-away.vercel.app/events",
  },
  twitter: {
    title: "Gaelic Tournaments & Events | PlayAway",
    description:
      "Discover Gaelic Athletic Association tournaments and events worldwide.",
  },
};

function getMonthOptions() {
  return [
    { value: "", label: "All Months" },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1).padStart(2, "0"),
      label: new Date(0, i).toLocaleString("default", { month: "long" }),
    })),
  ];
}

export const dynamic = "force-dynamic";

async function getEvents({
  eventType,
  country,
  month,
  visibility,
}: {
  eventType?: string;
  country?: string;
  month?: string;
  visibility?: string;
}) {
  const where: {
    eventType?: string;
    location?: { contains: string };
    startDate?: { gte: Date; lt: Date };
    visibility?: 'PUBLIC' | 'PRIVATE';
  } = {};
  if (eventType) where.eventType = eventType;
  if (country && country !== "") {
    where.location = { contains: country };
  }
  if (month) {
    const currentYear = new Date().getFullYear();
    const monthNum = Number(month);
    
    // Handle year rollover for December
    const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
    const nextYear = monthNum === 12 ? currentYear + 1 : currentYear;
    
    where.startDate = {
      gte: new Date(`${currentYear}-${month.padStart(2, "0")}-01`),
      lt: new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01`),
    };
  }
  if (visibility && visibility !== "") {
    where.visibility = visibility as 'PUBLIC' | 'PRIVATE';
  }
  return await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      eventType: true,
      location: true,
      startDate: true,
      endDate: true,
      cost: true,
      description: true,
      imageUrl: true,
      latitude: true,
      longitude: true,
      visibility: true,
      club: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string }>;
}) {
  try {
    const params = searchParams ? await searchParams : {};
    const eventType = params.eventType || "";
    const country = params.country || "";
    const month = params.month || "";
    const visibility = params.visibility || "";
    const events = await getEvents({ eventType, country, month, visibility });
    // Fetch city default images for events without images
    const eventsWithCityImages = await Promise.all(
      events.map(async (event) => {
        if (!event.imageUrl && event.location) {
          const cityImage = await getCityDefaultImage(event.location);
          return { ...event, cityDefaultImage: cityImage };
        }
        return { ...event, cityDefaultImage: null };
      })
    );
    
    const eventTypes = ["", ...EVENT_TYPES];
    const countries = Array.from(
      new Set(
        (await prisma.event.findMany()).map((e: { location: string }) =>
          (e.location?.split(",").pop() || "").trim()
        )
      )
    )
      .filter(Boolean)
      .sort() as string[];
    const months = getMonthOptions();
    const visibilityOptions = [
      { value: "", label: "All Tournaments" },
      { value: "PUBLIC", label: "Public Only" },
      { value: "PRIVATE", label: "Private Only" },
    ];

    // Generate structured data for events
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Gaelic Tournaments & Events",
      description:
        "Discover upcoming Gaelic Athletic Association tournaments and events worldwide",
      numberOfItems: events.length,
      itemListElement: events.map((event, index) => ({
        "@type": "Event",
        position: index + 1,
        name: event.title,
        description:
          event.description || `${event.eventType} event in ${event.location}`,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        location: {
          "@type": "Place",
          name: event.location,
          ...(event.latitude &&
            event.longitude && {
              geo: {
                "@type": "GeoCoordinates",
                latitude: event.latitude,
                longitude: event.longitude,
              },
            }),
        },
        organizer: event.club
          ? {
              "@type": "Organization",
              name: event.club.name,
              ...(event.club.imageUrl && { logo: event.club.imageUrl }),
            }
          : {
              "@type": "Organization",
              name: "PlayAway",
            },
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        ...(event.imageUrl && { image: event.imageUrl }),
        ...(event.cost && {
          offers: {
            "@type": "Offer",
            price: event.cost,
            priceCurrency: "EUR",
          },
        }),
        url: `https://play-away.vercel.app/events/${event.id}`,
      })),
    };

    return (
      <>
        <StructuredData data={structuredData} />
        <div className="bg-white">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-2xl md:text-5xl font-bold mb-4">
                Tournaments
              </h1>
              <p className="text-lg md:text-2xl mb-2">
                See all available tournaments below
              </p>

              {/* Custom Trip CTA */}
              <div className="hidden md:block mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                    Plan Your Custom Trip
                  </h3>
                  <p className="text-white/90 text-xs md:text-sm mb-3">
                    Complete this form to build a trip from scratch
                  </p>
                  <a
                    href="/survey"
                    className="inline-flex items-center bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Plan Custom Trip
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <form className="flex flex-col gap-3" method="get">
                {/* Mobile view - filters in one row */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4">
                  <select
                    name="eventType"
                    defaultValue={eventType}
                    className="text-sm md:text-base px-2 md:px-4 py-2 md:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">All Types</option>
                    {eventTypes.filter(Boolean).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <select
                    name="country"
                    defaultValue={country}
                    className="text-sm md:text-base px-2 md:px-4 py-2 md:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country: string) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <select
                    name="month"
                    defaultValue={month}
                    className="text-sm md:text-base px-2 md:px-4 py-2 md:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name="visibility"
                    defaultValue={visibility}
                    className="text-sm md:text-base px-2 md:px-4 py-2 md:py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  >
                    {visibilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Buttons row */}
                <div className="flex gap-2 md:gap-4">
                  <button
                    type="submit"
                    className="flex-1 md:flex-none text-sm md:text-base bg-primary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
                  >
                    Apply
                  </button>
                  <Link
                    href="/events"
                    className="flex-1 md:flex-none text-sm md:text-base bg-gray-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:bg-gray-600 transition shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="hidden md:inline">Clear Search</span>
                    <span className="md:hidden">Clear</span>
                  </Link>
                  <div className="hidden md:block">
                    <CreateEventButton />
                  </div>
                </div>
              </form>
              
              {/* Mobile Create Event Button */}
              <div className="mt-3 md:hidden flex justify-center">
                <CreateEventButton />
              </div>
            </div>
            {eventsWithCityImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {eventsWithCityImages.map(
                  (
                    event: {
                      id: string;
                      title: string;
                      eventType: string;
                      location: string;
                      startDate: Date;
                      endDate: Date | null;
                      cost: number | null;
                      description: string | null;
                      imageUrl: string | null;
                      cityDefaultImage?: string | null;
                      latitude: number | null;
                      longitude: number | null;
                      visibility: 'PUBLIC' | 'PRIVATE';
                      club: {
                        id: string;
                        name: string;
                        imageUrl: string | null;
                      } | null;
                    },
                    index
                  ) => {
                    return (
                      <div
                        key={event.id}
                        className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {/* Event Image */}
                        <div className="relative h-40 md:h-64 overflow-hidden">
                          {event.imageUrl || event.cityDefaultImage ? (
                            <Image
                              src={event.imageUrl || event.cityDefaultImage || ''}
                              alt={event.title}
                              fill
                              priority={index < 6}
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <div className="text-center text-white">
                                <div className="text-6xl mb-4">🏆</div>
                                <div className="text-xl font-bold">
                                  {event.eventType}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Club Logo Badge */}
                          {event.club?.imageUrl && (
                            <div className="absolute top-2 left-2 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-lg overflow-hidden border-2 border-white">
                              <Image
                                src={event.club.imageUrl}
                                alt={event.club.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Visibility Badge */}
                          {event.eventType === 'Tournament' && (
                            <div className="absolute top-2 right-2">
                              <span className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold ${
                                event.visibility === 'PUBLIC' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                                <span className="hidden md:inline">{event.visibility === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}</span>
                                <span className="md:hidden">{event.visibility === 'PUBLIC' ? '🌍' : '🔒'}</span>
                              </span>
                            </div>
                          )}

                          {/* Event Title */}
                          <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                            <h2 className="text-white text-xs md:text-2xl font-bold mb-1 md:mb-2 leading-tight line-clamp-2">
                              {event.title}
                            </h2>
                            <p className="text-white/90 text-xs md:text-sm line-clamp-1">
                              {event.location}
                            </p>
                          </div>
                        </div>

                        {/* View Details Button */}
                        <Link
                          href={`/events/${event.id}`}
                          className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-primary text-white px-2 py-1 md:px-4 md:py-2 rounded font-semibold text-xs md:text-sm hover:bg-primary/90 transition-colors"
                        >
                          <span className="hidden md:inline">View Details</span>
                          <span className="md:hidden">View</span>
                        </Link>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 mb-6">
                  {eventType || country || month || visibility ? 
                    "There are no events available matching your search criteria yet." :
                    "There are no events available at this time."
                  }
                </p>
                <Link
                  href="/events"
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  Clear Filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Events</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{MESSAGES.ERROR.GENERIC}</p>
        </div>
      </div>
    );
  }
}
