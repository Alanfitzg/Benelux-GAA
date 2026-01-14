"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  eventType: string;
  cost?: number | null;
  platformFee?: number | null;
  maxTeams?: number | null;
  imageUrl?: string | null;
  acceptedTeamTypes?: string[];
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
  imageUrl?: string | null;
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

  const getEventTypeStyles = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "tournament":
        return { bg: "bg-blue-500", text: "text-white" };
      case "friendly":
        return { bg: "bg-green-500", text: "text-white" };
      case "training":
        return { bg: "bg-purple-500", text: "text-white" };
      case "festival":
        return { bg: "bg-orange-500", text: "text-white" };
      case "social":
        return { bg: "bg-pink-500", text: "text-white" };
      default:
        return { bg: "bg-gray-500", text: "text-white" };
    }
  };

  const getSportBadgeColor = (sport: string) => {
    const sportLower = sport.toLowerCase();
    if (sportLower.includes("hurling") || sportLower.includes("camogie")) {
      return "bg-amber-100 text-amber-800";
    }
    if (sportLower.includes("football") || sportLower.includes("lgfa")) {
      return "bg-green-100 text-green-800";
    }
    if (sportLower.includes("handball")) {
      return "bg-blue-100 text-blue-800";
    }
    if (sportLower.includes("rounders")) {
      return "bg-purple-100 text-purple-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const hasUpcoming = upcomingEvents.length > 0;
  const hasPast = pastEvents.length > 0;

  return (
    <div className="bg-white rounded-xl border border-primary/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 px-4 py-3 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Tournaments
          </h2>

          {/* Toggle Switch */}
          <div className="flex items-center bg-primary/20 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                activeTab === "upcoming"
                  ? "bg-white text-primary shadow-sm"
                  : "text-primary/70 hover:text-primary"
              }`}
            >
              {upcomingLabel}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("past")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                activeTab === "past"
                  ? "bg-white text-primary shadow-sm"
                  : "text-primary/70 hover:text-primary"
              }`}
            >
              {pastLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "upcoming" ? (
          hasUpcoming ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const totalCost = event.cost
                  ? event.cost + (event.platformFee || 5)
                  : null;
                const eventTypeStyles = getEventTypeStyles(event.eventType);

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group block bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Event Image */}
                      <div className="relative w-full sm:w-56 h-40 sm:h-auto flex-shrink-0">
                        {event.imageUrl ? (
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-primary/50"
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
                        )}
                        {/* Event Type Badge */}
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full ${eventTypeStyles.bg} ${eventTypeStyles.text} shadow-md`}
                          >
                            {event.eventType}
                          </span>
                        </div>
                        {/* Demo Badge */}
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-1 text-xs font-semibold text-white bg-amber-500 rounded-full shadow">
                            Demo Date
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 p-5 sm:p-6">
                        <div className="flex flex-col h-full">
                          {/* Title and Meta */}
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                              {event.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1.5">
                                <svg
                                  className="w-4 h-4 text-gray-400"
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
                                {formatDate(event.startDate)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <svg
                                  className="w-4 h-4 text-gray-400"
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
                                {event.location}
                              </span>
                            </div>

                            {/* Sport Type Badges */}
                            {event.acceptedTeamTypes &&
                              event.acceptedTeamTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {event.acceptedTeamTypes
                                    .slice(0, 4)
                                    .map((sport) => (
                                      <span
                                        key={sport}
                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSportBadgeColor(sport)}`}
                                      >
                                        {sport}
                                      </span>
                                    ))}
                                  {event.acceptedTeamTypes.length > 4 && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                      +{event.acceptedTeamTypes.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>

                          {/* Bottom Row: Cost, Teams, CTA */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              {/* Cost */}
                              {totalCost !== null && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-2xl font-bold text-primary">
                                    €{totalCost.toFixed(0)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    /person
                                  </span>
                                </div>
                              )}

                              {/* Team Count */}
                              {event._count.teams > 0 && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4"
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
                                  <span>
                                    {event._count.teams}
                                    {event.maxTeams
                                      ? `/${event.maxTeams}`
                                      : ""}{" "}
                                    teams
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* CTA */}
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg group-hover:bg-primary/90 transition-colors">
                              View Details
                              <svg
                                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-primary/50"
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
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {isMainlandEurope
                  ? "No Upcoming Tournaments"
                  : "No Future Tournaments"}
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                {isMainlandEurope
                  ? "Register interest to help organise one!"
                  : "Browse tournaments to find your next trip."}
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Tournaments
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )
        ) : hasPast ? (
          <div className="space-y-3">
            {pastEvents.slice(0, 6).map((event) => {
              const eventTypeStyles = getEventTypeStyles(event.eventType);

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
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
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{formatDate(event.startDate)}</span>
                      <span>•</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Right side badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${eventTypeStyles.bg} ${eventTypeStyles.text}`}
                    >
                      {event.eventType}
                    </span>
                    {event.teamsCount !== undefined && event.teamsCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {event.teamsCount} team
                        {event.teamsCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
            {pastEvents.length > 6 && (
              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">
                  +{pastEvents.length - 6} more past tournaments
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {isMainlandEurope
                  ? "No Past Tournaments"
                  : "No Tournaments Attended"}
              </h4>
              <p className="text-xs text-gray-500">
                {isMainlandEurope
                  ? "History will appear here once events complete."
                  : "Your trip history will appear here."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
