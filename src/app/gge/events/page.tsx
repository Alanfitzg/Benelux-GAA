"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type EventType =
  | "DADS_AND_LADS"
  | "GAELIC4MOTHERS_AND_OTHERS"
  | "SOCIAL_CAMOGIE";

interface SocialEvent {
  id: string;
  clubName: string;
  eventType: EventType;
  proposedDate: string;
  location: string;
  venueName: string;
  maxTeams: number;
  foodOptions: string | null;
  accommodationOptions: string | null;
  localAttractions: string | null;
  _count: {
    registrations: number;
  };
}

const eventTypeLabels: Record<EventType, string> = {
  DADS_AND_LADS: "Dads & Lads",
  GAELIC4MOTHERS_AND_OTHERS: "Gaelic4Mothers&Others",
  SOCIAL_CAMOGIE: "Social Camogie",
};

const eventTypeColors: Record<EventType, string> = {
  DADS_AND_LADS: "bg-blue-100 text-blue-800",
  GAELIC4MOTHERS_AND_OTHERS: "bg-pink-100 text-pink-800",
  SOCIAL_CAMOGIE: "bg-purple-100 text-purple-800",
};

export default function EventsListingPage() {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventType | "ALL">("ALL");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/gge/events?status=APPROVED");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents =
    filter === "ALL" ? events : events.filter((e) => e.eventType === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">
            2026 Events
          </h2>
          <p className="text-gray-600 text-lg">
            Register your team for an upcoming recreational blitz
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-6 py-3 rounded-lg font-medium text-lg transition-colors ${
              filter === "ALL"
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            All Events
          </button>
          {(Object.keys(eventTypeLabels) as EventType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-6 py-3 rounded-lg font-medium text-lg transition-colors ${
                filter === type
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {eventTypeLabels[type]}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <>
            <div className="text-center py-16 bg-white rounded-xl shadow">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
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
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No Events Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Events will be listed here once they are approved.
                <br />
                Check back soon!
              </p>
              <Link
                href="/gge/register-interest"
                className="inline-block bg-[#f5c842] text-[#1e3a5f] font-bold py-3 px-6 rounded-lg hover:bg-[#e5b832] transition-colors"
              >
                Register Interest
              </Link>
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/gge/host"
                className="inline-block bg-[#1e3a5f] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#2d4a6f] transition-colors"
              >
                Apply to Host an Event
              </Link>
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Event Header */}
                <div className="bg-[#1e3a5f] text-white p-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${eventTypeColors[event.eventType]}`}
                  >
                    {eventTypeLabels[event.eventType]}
                  </span>
                  <h3 className="text-xl font-bold">{event.location}</h3>
                  <p className="text-[#f5c842]">Hosted by {event.clubName}</p>
                </div>

                {/* Event Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5"
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
                    <span className="text-gray-700 text-lg">
                      {formatDate(event.proposedDate)}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5"
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
                    <span className="text-gray-700">{event.venueName}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {event._count.registrations} / {event.maxTeams} teams
                      registered
                    </span>
                  </div>

                  {event.foodOptions && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="text-gray-500 text-sm">
                        Food: {event.foodOptions.substring(0, 50)}
                        {event.foodOptions.length > 50 ? "..." : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <div className="p-4 pt-0">
                  <Link
                    href={`/gge/events/${event.id}/register`}
                    className="block w-full text-center bg-[#f5c842] text-[#1e3a5f] font-bold py-3 rounded-lg text-lg hover:bg-[#e5b832] transition-colors"
                  >
                    Register Your Team
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-[#1e3a5f] text-white py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/gge" className="flex items-center gap-4">
          <Image
            src="/images/gge-crest.png"
            alt="Gaelic Games Europe"
            width={50}
            height={50}
            className="rounded-full"
          />
          <div>
            <h1 className="text-lg font-bold">Gaelic Games Europe</h1>
            <p className="text-sm text-[#f5c842]">Recreational Games 2026</p>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/gge"
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            ← Back
          </Link>
          <Link
            href="/gge/host"
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Host an Event →
          </Link>
        </div>
      </div>
    </header>
  );
}
