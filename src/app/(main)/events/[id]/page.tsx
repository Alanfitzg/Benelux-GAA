import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatEventDate } from "@/lib/utils";
import EventDetailClient from "./EventDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return {
        title: "Event Not Found",
        description: "The requested event could not be found.",
      };
    }

    const eventDate = formatEventDate(event.startDate);
    const title = `${event.title} - ${eventDate}`;
    const description = event.description
      ? `${event.description.slice(0, 150)}...`
      : `Join us for ${event.title}, a ${event.eventType} event in ${event.location} on ${eventDate}.`;

    return {
      title,
      description,
      keywords: [
        event.title,
        event.eventType,
        event.location,
        "GAA tournament",
        "Gaelic sports event",
        "Irish sports",
        "GAA event",
      ],
      openGraph: {
        title: `${title} | GAA Trips`,
        description,
        url: `https://gaa-trips.vercel.app/events/${id}`,
        type: "article",
        images: event.imageUrl
          ? [
              {
                url: event.imageUrl,
                width: 1200,
                height: 630,
                alt: `${event.title} - GAA Event`,
              },
            ]
          : [],
      },
      other: {
        "article:published_time": event.startDate.toISOString(),
        "article:section": "Sports",
        "article:tag": [event.eventType, "GAA", "Irish Sports"].join(", "),
      },
      twitter: {
        title: `${title} | GAA Trips`,
        description,
        images: event.imageUrl ? [event.imageUrl] : [],
      },
      alternates: {
        canonical: `https://gaa-trips.vercel.app/events/${id}`,
      },
    };
  } catch (error) {
    console.error("Error generating event metadata:", error);
    return {
      title: "GAA Event | GAA Trips",
      description: "Discover GAA events and tournaments worldwide.",
    };
  }
}

export default async function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailClient eventId={id} />;
}
