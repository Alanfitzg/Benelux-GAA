"use client";

import { useState } from "react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  eventType: string;
  _count: {
    teams: number;
  };
}

interface PastEvent {
  id: string;
  title: string;
  startDate: string;
  location: string;
  eventType: string;
  teamsCount?: number;
}

interface ClubTournamentsSectionProps {
  upcomingEvents: Event[];
  pastEvents: PastEvent[];
  isMainlandEurope?: boolean;
}

export default function ClubTournamentsSection({
  upcomingEvents,
  pastEvents,
  isMainlandEurope = false,
}: ClubTournamentsSectionProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Labels change based on whether club is a host (European) or traveller (non-European)
  const sectionTitle = isMainlandEurope ? "Tournaments" : "Tournaments";
  const upcomingLabel = isMainlandEurope ? "Upcoming" : "Future";
  const pastLabel = isMainlandEurope ? "Past" : "Attended";

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "tournament":
        return "bg-blue-100 text-blue-800";
      case "friendly":
        return "bg-green-100 text-green-800";
      case "training":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {sectionTitle}
        </h2>

        {/* Toggle Switch */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "upcoming"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {upcomingLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "past"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {pastLabel}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "upcoming" ? (
        upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
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
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
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
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.eventType)}`}
                    >
                      {event.eventType}
                    </span>
                    {event._count.teams > 0 && (
                      <span className="text-xs text-gray-500">
                        {event._count.teams} team
                        {event._count.teams !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
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
            <p className="text-gray-500">
              {isMainlandEurope
                ? "No upcoming tournaments scheduled"
                : "No future tournaments planned"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {isMainlandEurope
                ? "Express interest to help organise one!"
                : "Browse tournaments to find your next trip!"}
            </p>
          </div>
        )
      ) : pastEvents.length > 0 ? (
        <div className="space-y-3">
          {pastEvents.slice(0, 6).map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
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
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
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
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.eventType)}`}
                  >
                    {event.eventType}
                  </span>
                  {event.teamsCount !== undefined && event.teamsCount > 0 && (
                    <span className="text-xs text-gray-500">
                      {event.teamsCount} team{event.teamsCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {pastEvents.length > 6 && (
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">
                +{pastEvents.length - 6} more past tournaments
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500">
            {isMainlandEurope
              ? "No past tournaments yet"
              : "No tournaments attended yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {isMainlandEurope
              ? "Tournament history will appear here"
              : "Trip history will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}
