import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import { EVENT_TYPES } from "@/lib/constants/events";
import { MESSAGES, UI } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";

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
      <div>
        <h1 className="text-2xl font-bold mb-4">Events</h1>
        <form className="flex flex-wrap gap-4 mb-6" method="get">
          <select
            name="eventType"
            defaultValue={eventType}
            className="p-2 border rounded"
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
            className="p-2 border rounded"
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
            className="p-2 border rounded"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={UI.BUTTON_STYLES.PRIMARY}
          >
            Filter
          </button>
        </form>
        <div className={`grid ${UI.GRID_LAYOUTS.RESPONSIVE} gap-4`}>
          {events.map(
            (event: {
              id: string;
              title: string;
              eventType: string;
              location: string;
              startDate: Date;
              cost: number | null;
            }) => (
              <div key={event.id} className={UI.CARD_STYLES.DEFAULT}>
                <h2 className="text-xl font-semibold mb-2 text-primary">
                  {event.title}
                </h2>
                <p className="text-gray-700">
                  <strong>Type:</strong> {event.eventType}
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> {event.location}
                </p>
                <p className="text-gray-700">
                  <strong>Start Date:</strong>{" "}
                  {formatShortDate(event.startDate)}
                </p>
                <p className="text-gray-700">
                  <strong>Cost:</strong> €{event.cost ?? MESSAGES.DEFAULTS.PLACEHOLDER}
                </p>
                <Link
                  href={`/events/${event.id}`}
                  className={`mt-2 inline-block ${UI.BUTTON_STYLES.PRIMARY}`}
                >
                  {MESSAGES.BUTTONS.VIEW_DETAILS}
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
