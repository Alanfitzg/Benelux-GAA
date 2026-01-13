"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface WatchedEvent {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  endDate: string | null;
  imageUrl: string | null;
  status: string;
  club: {
    id: string;
    name: string;
    imageUrl: string | null;
    location: string | null;
  } | null;
  watchedAt: string;
}

interface WatchlistSectionProps {
  compact?: boolean;
  defaultExpanded?: boolean;
}

export default function WatchlistSection({
  compact = false,
  defaultExpanded = false,
}: WatchlistSectionProps) {
  const [events, setEvents] = useState<WatchedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await fetch("/api/user/watchlist");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const removeFromWatchlist = async (eventId: string) => {
    setRemoving(eventId);
    try {
      const response = await fetch(`/api/user/watchlist?eventId=${eventId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string, startDate: string) => {
    const eventDate = new Date(startDate);
    const now = new Date();
    const isUpcoming = eventDate > now;

    if (status === "CLOSED" || !isUpcoming) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Completed
        </span>
      );
    }

    const daysUntil = Math.ceil(
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= 7) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          {daysUntil === 0 ? "Today" : `${daysUntil}d away`}
        </span>
      );
    } else if (daysUntil <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          {daysUntil}d away
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        Upcoming
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`bg-white rounded-xl shadow-lg ${compact ? "p-5" : "mt-8 p-8"}`}
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
              className={`text-amber-500 ${compact ? "w-5 h-5" : "w-6 h-6"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Watchlist
            {!loading && events.length > 0 && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                ({events.length})
              </span>
            )}
          </h3>
          <p
            className={`text-gray-500 text-left mt-0.5 ${compact ? "text-xs" : "text-sm"}`}
          >
            Events you want to keep an eye on
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
              ) : events.length > 0 ? (
                <div
                  className={`space-y-3 ${compact ? "max-h-64 overflow-y-auto" : ""}`}
                >
                  {events.slice(0, compact ? 3 : undefined).map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50/50 transition-colors ${compact ? "text-sm" : ""}`}
                    >
                      {event.imageUrl ? (
                        <Image
                          src={event.imageUrl}
                          alt={event.title}
                          width={compact ? 40 : 56}
                          height={compact ? 40 : 56}
                          className={`rounded-lg object-cover flex-shrink-0 ${compact ? "w-10 h-10" : "w-14 h-14"}`}
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center flex-shrink-0 ${compact ? "w-10 h-10" : "w-14 h-14"}`}
                        >
                          <svg
                            className={`text-amber-500 ${compact ? "w-5 h-5" : "w-6 h-6"}`}
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
                      <Link
                        href={`/events/${event.id}`}
                        className="flex-1 min-w-0"
                      >
                        <p className="font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 truncate">
                            {event.location} • {formatDate(event.startDate)}
                          </span>
                          {getStatusBadge(event.status, event.startDate)}
                          <span className="px-1.5 py-0.5 text-xs font-semibold text-white bg-amber-500 rounded">
                            Demo
                          </span>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromWatchlist(event.id)}
                        disabled={removing === event.id}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
                        title="Remove from watchlist"
                      >
                        {removing === event.id ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                  {compact && events.length > 3 && (
                    <Link
                      href="/profile#watchlist"
                      className="block text-center text-sm text-primary hover:text-primary-dark py-2"
                    >
                      View all {events.length} events
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <p
                    className={`text-gray-600 mb-1 ${compact ? "text-sm" : ""}`}
                  >
                    Your watchlist is empty.
                  </p>
                  <p
                    className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}
                  >
                    Add tournaments to track updates.
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
