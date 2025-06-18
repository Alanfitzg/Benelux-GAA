import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import { Prisma } from "@prisma/client";

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
  const where: Prisma.EventWhereInput = {};
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
    const eventTypes = [
      "",
      "Mens Gaelic Football",
      "LGFA",
      "Hurling",
      "Camogie",
      "Rounders",
      "G4MO",
      "Dads & Lads",
      "Higher Education",
      "Youth",
      "Elite training camp",
      "Beach GAA"
    ];
    const countries = Array.from(
      new Set(
        (await prisma.event.findMany()).map((e) =>
          (e.location?.split(",").pop() || "").trim()
        )
      )
    )
      .filter(Boolean)
      .sort();
    const months = getMonthOptions();

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Event Grid View</h1>
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
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
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
            className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700"
          >
            Filter
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(
            (event: {
              id: string;
              title: string;
              eventType: string;
              location: string;
              startDate: Date;
              cost: number | null;
            }) => (
              <div key={event.id} className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2 text-green-800">
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
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>Cost:</strong> ${event.cost ?? "-"}
                </p>
                <Link
                  href={`/events/${event.id}`}
                  className="mt-2 inline-block px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700"
                >
                  View Details
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
          <p>Unable to load events at this time. Please try again later.</p>
        </div>
      </div>
    );
  }
}
