"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface YouthEvent {
  id: string;
  title: string;
  sport: string;
  location: string;
  description: string;
  date: string;
  month: string;
  year: number;
  duration: string;
  imageUrl: string;
  region?: string;
}

const youthEvents: YouthEvent[] = [];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthColor = (month: string) => {
  const colors: Record<string, string> = {
    March: "bg-green-500",
    April: "bg-blue-500",
    May: "bg-purple-500",
    June: "bg-amber-500",
    July: "bg-rose-500",
  };
  return colors[month] || "bg-gray-500";
};

export default function YouthCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedYear] = useState(2026);
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");

  useEffect(() => {
    if (status === "loading") return;
    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" &&
        session.user.role !== "YOUTH_OFFICER")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "YOUTH_OFFICER")
  ) {
    return null;
  }

  const eventsByMonth = months
    .map((month) => ({
      month,
      events: youthEvents.filter(
        (e) => e.month === month && e.year === selectedYear
      ),
    }))
    .filter((m) => m.events.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/youth"
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📅</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Youth Calendar
              </h1>
              <p className="text-white/70 text-sm">
                View all youth events for {selectedYear}
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "timeline"
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Grid View
            </button>
          </div>
        </div>

        {/* Empty State */}
        {youthEvents.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Events Scheduled
            </h3>
            <p className="text-white/60 mb-6">
              Youth events will appear on the calendar once created.
            </p>
            <Link
              href="/admin/youth/events?action=new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Event
            </Link>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === "timeline" && youthEvents.length > 0 && (
          <div className="space-y-8">
            {eventsByMonth.map(({ month, events }) => (
              <div key={month} className="relative">
                {/* Month Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-4 h-4 rounded-full ${getMonthColor(month)}`}
                  />
                  <h2 className="text-xl font-bold text-white">
                    {month} {selectedYear}
                  </h2>
                  <span className="text-white/40 text-sm">
                    {events.length} event{events.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Events */}
                <div className="ml-2 border-l-2 border-white/20 pl-8 space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">
                            {event.title}
                          </h3>
                          <p className="text-sm text-white/60 mt-1">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1 text-white/50">
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
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                              </svg>
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1 text-white/50">
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
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {event.duration}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMonthColor(month)} text-white`}
                          >
                            {event.date}
                          </span>
                          {event.region && (
                            <div className="mt-2 text-xs text-white/40">
                              {event.region}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && youthEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {youthEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`w-3 h-3 rounded-full ${getMonthColor(event.month)}`}
                  />
                  <span className="text-sm text-white/60">{event.date}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                <p className="text-sm text-white/50 mb-3">{event.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/60">
                    {event.sport}
                  </span>
                  <span className="text-xs text-white/40">
                    {event.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        {youthEvents.length > 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white/60 mb-3">
              Month Legend
            </h3>
            <div className="flex flex-wrap gap-4">
              {["March", "April", "May", "June", "July"].map((month) => (
                <div key={month} className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${getMonthColor(month)}`}
                  />
                  <span className="text-sm text-white/60">{month}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
