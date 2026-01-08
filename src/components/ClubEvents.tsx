"use client";

import React from "react";
import Link from "next/link";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";

interface Event {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: string | Date;
  cost?: number | null;
}

interface ClubEventsProps {
  events: Event[];
  compact?: boolean;
}

export default function ClubEvents({
  events,
  compact = false,
}: ClubEventsProps) {
  const { isEnabled } = useFeatureFlags();

  if (!isEnabled("CLUB_EVENTS") || events.length === 0) {
    return null;
  }

  const now = new Date();
  const upcomingEvents = events.filter(
    (event) => new Date(event.startDate) >= now
  );
  const pastEvents = events.filter((event) => new Date(event.startDate) < now);

  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return null;
  }

  if (compact) {
    const allEvents = [...upcomingEvents, ...pastEvents].slice(0, 3);
    return (
      <div className="space-y-3">
        {allEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {event.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(event.startDate).toLocaleDateString("en-IE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                • {event.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 text-xs font-semibold text-white bg-amber-500 rounded">
                Demo
              </span>
              <Link
                href={`/events/${event.id}`}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                View
              </Link>
            </div>
          </div>
        ))}
        {events.length > 3 && (
          <Link
            href="/events"
            className="block text-center text-sm text-primary hover:text-primary/80 font-medium pt-2"
          >
            View all events →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Upcoming Events
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.eventType}</p>
                <p className="text-gray-500 text-sm mb-2">
                  {new Date(event.startDate).toLocaleDateString("en-IE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-600 text-sm mb-2">{event.location}</p>
                {event.cost && (
                  <p className="text-green-600 font-semibold">€{event.cost}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-xs font-semibold text-white bg-amber-500 rounded">
                    Demo Date
                  </span>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-primary underline text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Past Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-50 rounded-lg shadow p-6 opacity-75"
              >
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.eventType}</p>
                <p className="text-gray-500 text-sm mb-2">
                  {new Date(event.startDate).toLocaleDateString("en-IE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-600 text-sm">{event.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-xs font-semibold text-white bg-amber-500 rounded">
                    Demo Date
                  </span>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-gray-600 underline text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
