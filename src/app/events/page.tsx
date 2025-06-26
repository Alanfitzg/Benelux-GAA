import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { EVENT_TYPES } from "@/lib/constants/events";
import { MESSAGES } from "@/lib/constants";
import CreateEventButton from "@/components/CreateEventButton";
import { StructuredData } from "@/components/StructuredData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GAA Tournaments & Events",
  description:
    "Discover Gaelic Athletic Association tournaments and events worldwide. Find Gaelic football, hurling, camogie, and handball competitions near you.",
  keywords: [
    "GAA tournaments",
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
    title: "GAA Tournaments & Events | GAA Trips",
    description:
      "Discover Gaelic Athletic Association tournaments and events worldwide. Find competitions and join the global GAA community.",
    url: "https://gaa-trips.vercel.app/events",
    type: "website",
  },
  alternates: {
    canonical: "https://gaa-trips.vercel.app/events",
  },
  twitter: {
    title: "GAA Tournaments & Events | GAA Trips",
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
}: {
  eventType?: string;
  country?: string;
  month?: string;
}) {
  const where: {
    eventType?: string;
    location?: { contains: string };
    startDate?: { gte: Date; lt: Date };
  } = {};
  if (eventType) where.eventType = eventType;
  if (country && country !== "") {
    where.location = { contains: country };
  }
  if (month) {
    where.startDate = {
      gte: new Date(`${new Date().getFullYear()}-${month}-01`),
      lt: new Date(
        `${new Date().getFullYear()}-${String(Number(month) + 1).padStart(
          2,
          "0"
        )}-01`
      ),
    };
  }
  return await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: {
      club: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        }
      }
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
    const events = await getEvents({ eventType, country, month });
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

    // Generate structured data for events
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "GAA Tournaments & Events",
      "description": "Discover upcoming Gaelic Athletic Association tournaments and events worldwide",
      "numberOfItems": events.length,
      "itemListElement": events.map((event, index) => ({
        "@type": "Event",
        "position": index + 1,
        "name": event.title,
        "description": event.description || `${event.eventType} event in ${event.location}`,
        "startDate": event.startDate,
        "endDate": event.endDate || event.startDate,
        "location": {
          "@type": "Place",
          "name": event.location,
          ...(event.latitude && event.longitude && {
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": event.latitude,
              "longitude": event.longitude
            }
          })
        },
        "organizer": event.club ? {
          "@type": "Organization",
          "name": event.club.name,
          ...(event.club.imageUrl && { "logo": event.club.imageUrl })
        } : {
          "@type": "Organization",
          "name": "GAA Trips"
        },
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        ...(event.imageUrl && { "image": event.imageUrl }),
        ...(event.cost && {
          "offers": {
            "@type": "Offer",
            "price": event.cost,
            "priceCurrency": "EUR"
          }
        }),
        "url": `https://gaa-trips.vercel.app/events/${event.id}`
      }))
    };

    return (
      <>
        <StructuredData data={structuredData} />
        <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GAA TOURNAMENTS & EVENTS
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover upcoming Gaelic Athletic Association tournaments and events
            worldwide. Join competitions and connect with the global GAA
            community.
          </p>
          <CreateEventButton />
        </div>
        <form
          className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4"
          method="get"
        >
          <select
            name="eventType"
            defaultValue={eventType}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
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
            className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
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
            className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
          >
            Apply Filters
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(
            (event: {
              id: string;
              title: string;
              eventType: string;
              location: string;
              startDate: Date;
              endDate: Date | null;
              cost: number | null;
              imageUrl: string | null;
              club: {
                id: string;
                name: string;
                imageUrl: string | null;
              } | null;
            }, index) => {
              return (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Event Image */}
                  <div className="relative h-64 overflow-hidden">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
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
                      <div className="absolute top-2 left-2 w-14 h-14 bg-white rounded-full shadow-lg overflow-hidden border-2 border-white">
                        <Image
                          src={event.club.imageUrl}
                          alt={event.club.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Event Title */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-white text-2xl font-bold mb-2 leading-tight">
                        {event.title.toUpperCase()}
                      </h2>
                      <p className="text-white/90 text-sm">{event.location}</p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={`/events/${event.id}`}
                    className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-red-700 transition-colors"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              );
            }
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
