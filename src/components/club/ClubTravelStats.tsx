"use client";

import { useState } from "react";

interface TravelStats {
  citiesVisited: number;
  countriesVisited: number;
  tripsCompleted: number;
  tournamentsAttended: number;
}

interface ClubTravelStatsProps {
  stats: TravelStats;
  clubName: string;
  flat?: boolean;
}

export default function ClubTravelStats({
  stats,
  flat = false,
}: ClubTravelStatsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const statItems = [
    {
      label: "Tournaments Attended",
      value: stats.tournamentsAttended,
    },
    {
      label: "Countries Visited",
      value: stats.countriesVisited,
    },
    {
      label: "Trips Completed",
      value: stats.tripsCompleted,
    },
  ];

  return (
    <div
      className={
        flat
          ? ""
          : "bg-white rounded-xl border border-primary/30 shadow-sm overflow-hidden"
      }
    >
      {/* Header */}
      <div
        className={
          flat ? "mb-4" : "bg-primary/10 px-4 py-3 border-b border-primary/20"
        }
      >
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
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Travel Stats
          {/* Info button */}
          <div className="relative ml-1">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="What are Travel Stats?"
            >
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                <p>
                  Track your club&apos;s international adventures! These stats
                  update automatically when you register for tournaments through
                  PlayAway.
                </p>
                <div className="absolute -top-1.5 left-2 w-3 h-3 bg-gray-900 rotate-45" />
              </div>
            )}
          </div>
        </h2>
      </div>

      <div className={flat ? "" : "p-4"}>
        {/* Stats Grid - Clean and minimal */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="text-center py-3">
              <div
                className={`text-2xl sm:text-3xl font-bold ${item.value > 0 ? "text-primary" : "text-gray-400"}`}
              >
                {item.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
