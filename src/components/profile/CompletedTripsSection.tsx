"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface CompletedTrip {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  endDate: string | null;
  imageUrl: string | null;
  hostClub: {
    id: string;
    name: string;
    imageUrl: string | null;
    location: string | null;
  } | null;
  hasReport: boolean;
  participatingTeams: {
    teamName: string;
    clubName: string;
    clubImageUrl: string | null;
  }[];
}

interface CompletedTripsSectionProps {
  compact?: boolean;
  defaultExpanded?: boolean;
}

export default function CompletedTripsSection({
  compact = false,
  defaultExpanded = false,
}: CompletedTripsSectionProps) {
  const [trips, setTrips] = useState<CompletedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const response = await fetch("/api/user/completed-trips");
        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips);
        }
      } catch (error) {
        console.error("Error fetching completed trips:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`bg-white rounded-xl shadow-lg ${compact ? "p-5" : "mt-8 p-6"}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
      >
        <div>
          <h3
            className={`font-bold text-gray-900 flex items-center gap-2 ${compact ? "text-base" : "text-xl"}`}
          >
            <svg
              className={`text-green-600 ${compact ? "w-5 h-5" : "w-6 h-6"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Completed Trips
            {!loading && trips.length > 0 && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                ({trips.length})
              </span>
            )}
          </h3>
          <p
            className={`text-gray-500 text-left mt-0.5 ${compact ? "text-xs" : "text-sm"}`}
          >
            Tournaments and events you&apos;ve participated in
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {loading ? (
                <div
                  className={`flex items-center justify-center ${compact ? "py-6" : "py-8"}`}
                >
                  <div
                    className={`border-2 border-primary border-t-transparent rounded-full animate-spin ${compact ? "w-6 h-6" : "w-8 h-8"}`}
                  ></div>
                </div>
              ) : trips.length > 0 ? (
                <div
                  className={`space-y-3 ${compact ? "max-h-64 overflow-y-auto" : ""}`}
                >
                  {trips.slice(0, compact ? 3 : undefined).map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/events/${trip.id}`}
                      className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/50 transition-colors ${compact ? "text-sm" : ""}`}
                    >
                      {trip.imageUrl ? (
                        <Image
                          src={trip.imageUrl}
                          alt={trip.title}
                          width={compact ? 40 : 56}
                          height={compact ? 40 : 56}
                          className={`rounded-lg object-cover ${compact ? "w-10 h-10" : "w-14 h-14"}`}
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 ${compact ? "w-10 h-10" : "w-14 h-14"}`}
                        >
                          <svg
                            className={`text-green-500 ${compact ? "w-5 h-5" : "w-6 h-6"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {trip.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {trip.location} • {formatDate(trip.startDate)}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                  {compact && trips.length > 3 && (
                    <Link
                      href="/profile#completed-trips"
                      className="block text-center text-sm text-primary hover:text-primary-dark py-2"
                    >
                      View all {trips.length} trips
                    </Link>
                  )}
                </div>
              ) : (
                <div className={`text-center ${compact ? "py-6" : "py-8"}`}>
                  <svg
                    className={`text-gray-300 mx-auto mb-3 ${compact ? "w-10 h-10" : "w-12 h-12"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p
                    className={`text-gray-600 mb-1 ${compact ? "text-sm" : ""}`}
                  >
                    No completed trips yet.
                  </p>
                  <p
                    className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}
                  >
                    Register for tournaments to build your travel history.
                  </p>
                  <Link
                    href="/events"
                    className={`inline-flex items-center mt-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
                  >
                    Browse Events
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
