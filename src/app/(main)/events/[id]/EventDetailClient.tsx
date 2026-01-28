"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { Event, TournamentTeam } from "@/types";
import { URLS, MESSAGES, EVENT_CONSTANTS } from "@/lib/constants";
import { formatEventDate } from "@/lib/utils";
import { DetailPageSkeleton } from "@/components/ui/Skeleton";
import {
  StructuredData,
  generateEventStructuredData,
} from "@/components/StructuredData";
import { useCityDefaultImage } from "@/hooks/useCityDefaultImage";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface KeyInfoCardProps {
  event: Event | null;
  teams: TournamentTeam[];
  session: Session | null;
  isWatched: boolean;
  watchLoading: boolean;
  toggleWatch: () => void;
  setShowWatchlistSignup: (show: boolean) => void;
  setShowPrivateEventModal: (show: boolean) => void;
}

function KeyInfoCard({
  event,
  teams,
  session,
  isWatched,
  watchLoading,
  toggleWatch,
  setShowWatchlistSignup,
  setShowPrivateEventModal,
}: KeyInfoCardProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Key Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-3 py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm flex-shrink-0">Type</span>
            <span className="font-medium text-right">
              {event?.eventType || MESSAGES.DEFAULTS.PLACEHOLDER}
            </span>
          </div>
          <div className="flex justify-between items-start gap-3 py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm flex-shrink-0">
              Location
            </span>
            <span className="font-medium text-right">
              {event?.location || MESSAGES.DEFAULTS.LOCATION}
            </span>
          </div>
          <div className="flex justify-between items-start gap-3 py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm flex-shrink-0">Date</span>
            <span className="font-medium text-right">
              {event
                ? formatEventDate(event.startDate)
                : MESSAGES.DEFAULTS.PLACEHOLDER}
            </span>
          </div>

          {event?.eventType === "Tournament" && (
            <div className="py-2 border-b border-gray-100">
              <div className="flex justify-between items-center gap-3 mb-2">
                <span className="text-gray-500 text-sm flex-shrink-0">
                  Teams
                </span>
                <span className="font-medium text-right">
                  {teams.filter((t) => t.status === "CONFIRMED").length}
                  {event.maxTeams ? `/${event.maxTeams}` : ""}
                </span>
              </div>
              {event.maxTeams && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((teams.filter((t) => t.status === "CONFIRMED").length / event.maxTeams) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="pt-3">
            <span className="text-gray-500 text-sm block mb-1">
              Cost per person
            </span>
            {session?.user ? (
              <span className="font-bold text-primary text-3xl">
                {event?.cost
                  ? `€${(event.cost + (event.platformFee || 5)).toFixed(0)}`
                  : MESSAGES.DEFAULTS.PLACEHOLDER}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded w-fit">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Sign in to view pricing
              </div>
            )}
          </div>
        </div>

        {session?.user ? (
          event?.visibility !== "PRIVATE" && (
            <a
              href="#interest"
              className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg text-center block transition"
            >
              {MESSAGES.BUTTONS.REGISTER_INTEREST}
            </a>
          )
        ) : (
          <div className="mt-6 space-y-2">
            <a
              href="/signup"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-center block transition flex items-center justify-center gap-2"
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create Free Account
            </a>
            <a
              href="/signin"
              className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-2 rounded-lg text-center block transition text-sm"
            >
              Already have an account? Sign In
            </a>
          </div>
        )}
      </div>

      <div className="relative group">
        <button
          type="button"
          onClick={() => {
            if (!session?.user) {
              setShowWatchlistSignup(true);
            } else if (event?.visibility === "PRIVATE" && !isWatched) {
              setShowPrivateEventModal(true);
            } else {
              toggleWatch();
            }
          }}
          disabled={watchLoading}
          className={`w-full flex items-center justify-center gap-2.5 py-4 px-4 rounded-xl font-semibold transition-all shadow-md ${
            isWatched
              ? "bg-amber-100 text-amber-800 border-2 border-amber-300"
              : "bg-white text-gray-700 border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
          }`}
        >
          <svg
            className={`w-6 h-6 ${isWatched ? "text-amber-500 fill-amber-500" : "text-gray-400"}`}
            fill={isWatched ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <span className="text-base">
            {isWatched ? "Watching This Event" : "Add to Watchlist"}
          </span>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
          Save this event to your watchlist to track it from your profile.
          You&apos;ll see it in your personal events list.
        </div>
      </div>
    </div>
  );
}

export default function EventDetailClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [showWatchlistSignup, setShowWatchlistSignup] = useState(false);
  const [showPrivateEventModal, setShowPrivateEventModal] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);

  const { data: session } = useSession();
  const { cityImage } = useCityDefaultImage(event?.location);

  const checkWatchStatus = useCallback(async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/user/watchlist");
      if (response.ok) {
        const data = await response.json();
        const watched = data.events.some(
          (e: { id: string }) => e.id === eventId
        );
        setIsWatched(watched);
      }
    } catch (error) {
      console.error("Error checking watch status:", error);
    }
  }, [session?.user, eventId]);

  const toggleWatch = async () => {
    if (!session?.user) return;
    setWatchLoading(true);
    try {
      if (isWatched) {
        await fetch(`/api/user/watchlist?eventId=${eventId}`, {
          method: "DELETE",
        });
        setIsWatched(false);
      } else {
        await fetch("/api/user/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });
        setIsWatched(true);
      }
    } catch (error) {
      console.error("Error toggling watch:", error);
    } finally {
      setWatchLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      checkWatchStatus();
    }
  }, [session?.user, checkWatchStatus]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        console.log("Fetching event data for ID:", eventId);
        const eventRes = await fetch(`${URLS.API.EVENTS}/${eventId}`);
        console.log("Event API response status:", eventRes.status);

        if (!eventRes.ok) {
          throw new Error(
            `Failed to fetch event: ${eventRes.status} ${eventRes.statusText}`
          );
        }

        const eventData = await eventRes.json();
        console.log("Event data received:", eventData);
        setEvent(eventData);

        // Fetch teams for tournaments
        if (eventData.eventType === "Tournament") {
          try {
            const teamsRes = await fetch(`/api/tournaments/${eventId}/teams`);
            if (teamsRes.ok) {
              const teamsData = await teamsRes.json();
              setTeams(teamsData);
            }
          } catch (teamsError) {
            console.warn("Error fetching teams:", teamsError);
          }
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, session]);

  const handleSubmit = async (eventForm: React.FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();
    const form = eventForm.currentTarget;
    const formData = new FormData(form);
    const data = {
      eventId,
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      website: formData.get("website"),
    };

    const response = await fetch(URLS.API.INTEREST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert(MESSAGES.SUCCESS.INTEREST_EXPRESSED);
      form.reset();
    } else {
      alert(MESSAGES.ERROR.INTEREST_FAILED);
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  return (
    <>
      {event && (
        <StructuredData
          data={generateEventStructuredData({
            ...event,
            startDate: event.startDate,
            endDate: event.endDate || event.startDate,
            imageUrl: event.imageUrl || undefined,
          })}
        />
      )}

      {/* Hero Section with Background Image */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <Image
          src={event?.imageUrl || cityImage || URLS.PLACEHOLDER_CREST}
          alt={event?.title || "Event Image"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2">
              {event?.title || "Event Title"}
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center text-sm sm:text-base md:text-lg">
              <span className="flex items-center gap-2">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {event?.location || MESSAGES.DEFAULTS.LOCATION}
              </span>
              <span className="flex items-center gap-2">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {event ? formatEventDate(event.startDate) : "Event Date"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav
            className="flex gap-6 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <a
              href="#overview"
              className="py-3 px-1 border-b-2 border-primary text-primary font-medium whitespace-nowrap text-sm"
            >
              Overview
            </a>
            {session?.user && (
              <a
                href="#included"
                className="py-3 px-1 border-b-2 border-transparent hover:border-primary/50 hover:text-primary whitespace-nowrap text-sm text-gray-600"
              >
                What&apos;s Included
              </a>
            )}
            {event?.visibility !== "PRIVATE" && session?.user && (
              <a
                href="#interest"
                className="py-3 px-1 border-b-2 border-transparent hover:border-primary/50 hover:text-primary whitespace-nowrap text-sm text-gray-600"
              >
                Register Interest
              </a>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Section */}
              <section
                id="overview"
                className="bg-white rounded-xl shadow-md p-4 sm:p-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  Event Overview
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {event?.description ||
                    (session
                      ? "No description available for this event."
                      : "Create an account to see event details.")}
                </p>

                {/* Organizer Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Organizer
                  </h3>
                  {event?.club ? (
                    <a
                      href={`/clubs/${event.club.id}`}
                      className="flex items-center gap-4 p-4 -mx-4 sm:mx-0 sm:rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      {event.club.imageUrl ? (
                        <Image
                          src={event.club.imageUrl}
                          alt={event.club.name}
                          width={56}
                          height={56}
                          className="rounded-xl object-contain bg-white border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-sm border border-primary/10">
                          <span className="text-primary font-bold text-xl">
                            {event.club.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {event.club.name}
                        </p>
                        {event.club.location && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <svg
                              className="w-3.5 h-3.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="truncate">
                              {event.club.location}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-primary transition-colors">
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 -mx-4 sm:mx-0 sm:rounded-xl bg-gray-50">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-7 h-7 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">
                          Independent Event
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Organized by the event host
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign up prompt for non-authenticated users */}
                {!session?.user && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Full event details are only available to registered
                        members
                      </p>
                      <p className="text-xs text-gray-500">
                        Create a free account to see pricing, what&apos;s
                        included, and register your interest
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Key Info - Mobile Only (shows after Overview on mobile) */}
              <div className="lg:hidden">
                <KeyInfoCard
                  event={event}
                  teams={teams}
                  session={session}
                  isWatched={isWatched}
                  watchLoading={watchLoading}
                  toggleWatch={toggleWatch}
                  setShowWatchlistSignup={setShowWatchlistSignup}
                  setShowPrivateEventModal={setShowPrivateEventModal}
                />
              </div>

              {/* What's Included Section - Only show for authenticated users */}
              {session?.user && (
                <section
                  id="included"
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                    What&apos;s Included
                  </h2>
                  <div className="space-y-3">
                    {EVENT_CONSTANTS.DEFAULT_INCLUDES.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <svg
                          className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Interest Form Section - Only show for public events and authenticated users */}
              {event?.visibility !== "PRIVATE" && session?.user && (
                <section
                  id="interest"
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6"
                >
                  {!showInterestForm ? (
                    <div className="text-center py-4 sm:py-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-7 h-7 sm:w-8 sm:h-8 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">
                        Interested in this event?
                      </h2>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                        Let the organisers know you&apos;re interested and
                        they&apos;ll get in touch with more details.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowInterestForm(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition"
                      >
                        {MESSAGES.BUTTONS.REGISTER_INTEREST}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold">
                          {MESSAGES.BUTTONS.REGISTER_INTEREST}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setShowInterestForm(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Honeypot field - hidden from real users, bots will fill it */}
                        <div
                          className="absolute -left-[9999px]"
                          aria-hidden="true"
                        >
                          <label htmlFor="interest-website">Website</label>
                          <input
                            type="text"
                            id="interest-website"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {MESSAGES.FORM.NAME}
                            </label>
                            <input
                              type="text"
                              name="name"
                              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {MESSAGES.FORM.EMAIL}
                            </label>
                            <input
                              type="email"
                              name="email"
                              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {MESSAGES.FORM.MESSAGE}
                          </label>
                          <textarea
                            name="message"
                            rows={4}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition"
                        >
                          {MESSAGES.BUTTONS.SUBMIT}
                        </button>
                      </form>
                    </>
                  )}
                </section>
              )}

              {/* Teams Section - Only for tournaments and authenticated users */}
              {event?.eventType === "Tournament" && session?.user && (
                <section
                  id="teams"
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      Confirmed Teams
                    </h2>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {teams.filter((t) => t.status === "CONFIRMED").length}{" "}
                      teams
                      {event.maxTeams && ` / ${event.maxTeams} max`}
                    </span>
                  </div>

                  {teams.filter((t) => t.status === "CONFIRMED").length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {teams
                        .filter((t) => t.status === "CONFIRMED")
                        .map((team) => (
                          <div
                            key={team.id}
                            className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-sm">
                                {team.teamName?.charAt(0) || "T"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {team.teamName}
                              </p>
                              {team.club?.name && (
                                <p className="text-sm text-gray-500 truncate">
                                  {team.club.name}
                                </p>
                              )}
                            </div>
                            <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                              {team.teamType}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-primary/60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium text-sm">
                        No teams confirmed yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Be the first to register your team!
                      </p>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Key Info Card - Desktop Only (hidden on mobile, shown in main content on mobile) */}
                <div className="hidden lg:block">
                  <KeyInfoCard
                    event={event}
                    teams={teams}
                    session={session}
                    isWatched={isWatched}
                    watchLoading={watchLoading}
                    toggleWatch={toggleWatch}
                    setShowWatchlistSignup={setShowWatchlistSignup}
                    setShowPrivateEventModal={setShowPrivateEventModal}
                  />
                </div>

                {/* Watchlist Signup Prompt Modal */}
                {showWatchlistSignup && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                      <div className="text-center">
                        <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Create an Account to Save
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Sign up to add events to your watchlist and track
                          tournaments you&apos;re interested in.
                        </p>
                        <div className="space-y-3">
                          <a
                            href="/signup"
                            className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
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
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                              />
                            </svg>
                            Create Free Account
                          </a>
                          <a
                            href="/signin"
                            className="w-full inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-colors"
                          >
                            Already have an account? Sign In
                          </a>
                          <button
                            type="button"
                            onClick={() => setShowWatchlistSignup(false)}
                            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors text-sm"
                          >
                            Maybe Later
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Private Event Modal */}
                {showPrivateEventModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                      <div className="text-center">
                        <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Private Event
                        </h3>
                        <p className="text-gray-600 mb-4">
                          This is a private event that requires an invitation to
                          attend. If you&apos;re interested, please contact the
                          organising club directly.
                        </p>
                        <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                          You can still add this event to your watchlist for
                          reference, but you won&apos;t receive updates or
                          notifications about it.
                        </p>
                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => {
                              toggleWatch();
                              setShowPrivateEventModal(false);
                            }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Add to Watchlist Anyway
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPrivateEventModal(false)}
                            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
