import { prisma } from "@/lib/prisma";
import React from "react";
import { EVENT_TYPES } from "@/lib/constants/events";
import { TEAM_TYPES } from "@/lib/constants/teams";
import { MESSAGES } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import { getCityDefaultImage } from "@/lib/city-utils";
import EventsPageClient from "@/components/events/EventsPageClient";
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

export const dynamic = "force-dynamic";

async function getAllEvents() {
  return await prisma.event.findMany({
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
      acceptedTeamTypes: true,
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

async function getFilterOptions() {
  const events = await prisma.event.findMany({
    select: {
      location: true,
      acceptedTeamTypes: true,
    }
  });
  
  const countries = Array.from(
    new Set(
      events.map((e: { location: string }) =>
        (e.location?.split(",").pop() || "").trim()
      )
    )
  )
    .filter(Boolean)
    .sort() as string[];
  
  // Get all unique sport types that are actually used in events
  const usedSportTypes = Array.from(
    new Set(
      events.flatMap((e: { acceptedTeamTypes: string[] }) => 
        e.acceptedTeamTypes || []
      )
    )
  ).sort() as string[];
    
  return {
    eventTypes: EVENT_TYPES,
    countries,
    sportTypes: TEAM_TYPES, // All available sport types
    usedSportTypes, // Sport types that are actually used
  };
}

export default async function EventsPage() {
  try {
    const [events, filterOptions] = await Promise.all([
      getAllEvents(),
      getFilterOptions(),
    ]);

    // Fetch city default images for events without images
    const eventsWithCityImages = await Promise.all(
      events.map(async (event) => {
        if (!event.imageUrl && event.location) {
          const cityImage = await getCityDefaultImage(event.location);
          return { 
            ...event, 
            cityDefaultImage: cityImage,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate?.toISOString() || null,
          };
        }
        return { 
          ...event, 
          cityDefaultImage: null,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate?.toISOString() || null,
        };
      })
    );

    // Generate structured data for SEO
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
        <EventsPageClient 
          initialEvents={eventsWithCityImages}
          eventTypes={filterOptions.eventTypes}
          countries={filterOptions.countries}
          sportTypes={filterOptions.sportTypes}
          usedSportTypes={filterOptions.usedSportTypes}
        />
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