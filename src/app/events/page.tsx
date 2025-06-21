import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import { EVENT_TYPES } from "@/lib/constants/events";
import { MESSAGES, UI } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GAA Tournaments & Events",
  description: "Discover Gaelic Athletic Association tournaments and events worldwide. Find Gaelic football, hurling, camogie, and handball competitions near you.",
  keywords: [
    "GAA tournaments", "Gaelic football events", "hurling competitions", 
    "camogie tournaments", "handball events", "Irish sports events", 
    "GAA competitions", "Gaelic games calendar", "Irish sports calendar"
  ],
  openGraph: {
    title: "GAA Tournaments & Events | GAA Trips",
    description: "Discover Gaelic Athletic Association tournaments and events worldwide. Find competitions and join the global GAA community.",
    url: "https://gaa-trips.vercel.app/events",
    type: "website",
  },
  twitter: {
    title: "GAA Tournaments & Events | GAA Trips",
    description: "Discover Gaelic Athletic Association tournaments and events worldwide.",
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

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <Link
            href="/events/create"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
          >
            Create Event
          </Link>
        </div>
        <form className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4" method="get">
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
        <div className={`grid ${UI.GRID_LAYOUTS.RESPONSIVE} gap-6`}>
          {events.map(
            (event: {
              id: string;
              title: string;
              eventType: string;
              location: string;
              startDate: Date;
              cost: number | null;
            }) => (
              <div key={event.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-3 text-primary">
                  {event.title}
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Type:</span> {event.eventType}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">📍 Location:</span> {event.location}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">📅 Date:</span> {formatShortDate(event.startDate)}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">💰 Cost:</span> €{event.cost ?? "TBD"}
                  </p>
                </div>
                <Link
                  href={`/events/${event.id}`}
                  className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  View Details →
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Database connection error:', error);
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
