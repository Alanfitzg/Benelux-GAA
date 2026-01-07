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
import SignUpGate from "@/components/auth/SignUpGate";
import { useSession } from "next-auth/react";

export default function EventDetailClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [showWatchlistSignup, setShowWatchlistSignup] = useState(false);

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
      <div className="relative h-96 w-full overflow-hidden">
        <Image
          src={event?.imageUrl || cityImage || URLS.PLACEHOLDER_CREST}
          alt={event?.title || "Event Image"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-2">
              {event?.title || "Event Title"}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-lg">
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
          <nav className="flex gap-8 overflow-x-auto">
            <a
              href="#overview"
              className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap"
            >
              Overview
            </a>
            {event?.eventType === "Tournament" && (
              <a
                href="#teams"
                className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap"
              >
                Teams
              </a>
            )}
            <a
              href="#included"
              className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap"
            >
              What&apos;s Included
            </a>
            {event?.visibility !== "PRIVATE" && (
              <a
                href="#interest"
                className="py-4 px-2 border-b-2 border-transparent hover:border-primary whitespace-nowrap"
              >
                Register Interest
              </a>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <section
              id="overview"
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Event Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {event?.description ||
                  (session
                    ? "No description available for this event."
                    : "Create an account to see event details.")}
              </p>
            </section>

            {/* Teams Section - Only for tournaments */}
            {event?.eventType === "Tournament" && (
              <section id="teams" className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Confirmed Teams</h2>
                  <span className="text-sm text-gray-500">
                    {teams.filter((t) => t.status === "CONFIRMED").length} teams
                    {event.maxTeams && ` / ${event.maxTeams} max`}
                  </span>
                </div>

                {session?.user ? (
                  <>
                    {teams.filter((t) => t.status === "CONFIRMED").length >
                    0 ? (
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
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No teams confirmed yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Check back soon for team announcements
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <SignUpGate
                    title="See Confirmed Teams"
                    description="View all teams registered for this tournament. Create a free account to see the full lineup."
                    previewHeight="h-24"
                  >
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {teams.filter((t) => t.status === "CONFIRMED").length}{" "}
                        teams confirmed
                      </p>
                    </div>
                  </SignUpGate>
                )}
              </section>
            )}

            {/* What's Included Section */}
            <section id="included">
              {session?.user ? (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4">
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
                </div>
              ) : (
                <SignUpGate
                  title="See Everything That's Included"
                  description="View the complete list of accommodations, meals, transport options, and activities included in your trip package."
                  previewHeight="h-32"
                  className="bg-white rounded-xl shadow-md"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
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
                    <p className="text-xs text-gray-500 mt-4 italic">
                      This host club is responsible for selecting and delivering
                      the components listed
                    </p>
                  </div>
                </SignUpGate>
              )}
            </section>

            {/* Interest Form Section - Only show for public events */}
            {event?.visibility !== "PRIVATE" && (
              <section
                id="interest"
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-2xl font-bold mb-6">
                  {MESSAGES.BUTTONS.REGISTER_INTEREST}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Facts Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">
                      {event?.eventType || MESSAGES.DEFAULTS.PLACEHOLDER}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">
                      {event?.location || MESSAGES.DEFAULTS.LOCATION}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {event
                        ? formatEventDate(event.startDate)
                        : MESSAGES.DEFAULTS.PLACEHOLDER}
                    </span>
                  </div>

                  {/* Teams count - For tournaments */}
                  {event?.eventType === "Tournament" && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Teams</span>
                      <span className="font-medium">
                        {teams.filter((t) => t.status === "CONFIRMED").length}
                        {event.maxTeams && ` / ${event.maxTeams}`}
                      </span>
                    </div>
                  )}

                  {/* Pricing - Hidden for non-authenticated users */}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Cost per person</span>
                    {session?.user ? (
                      <span className="font-medium text-primary text-xl">
                        {event?.cost
                          ? `€${event.cost}`
                          : MESSAGES.DEFAULTS.PLACEHOLDER}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
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

                {/* Sign up CTA or Interest Button */}
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

              {/* Watchlist Button */}
              <button
                type="button"
                onClick={() => {
                  if (session?.user) {
                    toggleWatch();
                  } else {
                    setShowWatchlistSignup(true);
                  }
                }}
                disabled={watchLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  isWatched
                    ? "bg-amber-100 text-amber-700 border-2 border-amber-300 hover:bg-amber-200"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                } disabled:opacity-50`}
              >
                {watchLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className={`w-5 h-5 ${isWatched ? "fill-amber-500" : ""}`}
                    fill={isWatched ? "currentColor" : "none"}
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
                )}
                {isWatched ? "On Watchlist" : "Add to Watchlist"}
              </button>

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

              {/* Custom Trip CTA */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold mb-2">Want a Custom Trip?</h3>
                <p className="text-gray-700 text-sm mb-4">
                  Create a personalized GAA trip experience for your club
                </p>
                <a
                  href={`/survey?eventId=${eventId}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Plan Your Trip
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
