"use client";

import { useState, useEffect, use } from "react";
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
  venueDetails: string | null;
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

export default function TeamRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<SocialEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clubName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    numberOfPlayers: 15,
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<
    "CONFIRMED" | "WAITING_LIST"
  >("CONFIRMED");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [resolvedParams.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/gge/events/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
      }
    } catch (error) {
      console.error("Failed to fetch event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/gge/events/${resolvedParams.id}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit registration");
      }

      setRegistrationStatus(data.registration.status);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Event Not Found
          </h2>
          <Link
            href="/gge/events"
            className="text-[#1e3a5f] font-medium hover:underline"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                registrationStatus === "CONFIRMED"
                  ? "bg-green-100"
                  : "bg-yellow-100"
              }`}
            >
              {registrationStatus === "CONFIRMED" ? (
                <svg
                  className="w-10 h-10 text-green-600"
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
              ) : (
                <svg
                  className="w-10 h-10 text-yellow-600"
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
              )}
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
              {registrationStatus === "CONFIRMED"
                ? "Registration Confirmed!"
                : "Added to Waiting List"}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {registrationStatus === "CONFIRMED"
                ? `Your team has been registered for the ${eventTypeLabels[event.eventType]} blitz in ${event.location}.`
                : `The event is currently at capacity. You've been added to the waiting list and will be notified if a spot becomes available.`}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-bold text-gray-700 mb-2">Event Details:</h3>
              <p className="text-gray-600">
                <strong>Date:</strong> {formatDate(event.proposedDate)}
              </p>
              <p className="text-gray-600">
                <strong>Venue:</strong> {event.venueName}, {event.location}
              </p>
            </div>

            <p className="text-gray-500 mb-8">
              A confirmation email has been sent to{" "}
              <strong>{formData.contactEmail}</strong>
            </p>
            <Link
              href="/gge/events"
              className="inline-block bg-[#1e3a5f] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              View All Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/gge/events"
            className="inline-flex items-center text-[#1e3a5f] font-medium mb-6 hover:underline"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Event Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
                <div className="bg-[#1e3a5f] text-white p-4">
                  <h3 className="text-xl font-bold">
                    {eventTypeLabels[event.eventType]}
                  </h3>
                  <p className="text-[#f5c842]">{event.location}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="font-medium text-lg">
                      {formatDate(event.proposedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Venue</p>
                    <p className="font-medium">{event.venueName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Host Club</p>
                    <p className="font-medium">{event.clubName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Registrations</p>
                    <p className="font-medium">
                      {event._count.registrations} / {event.maxTeams} teams
                    </p>
                    {event._count.registrations >= event.maxTeams && (
                      <p className="text-yellow-600 text-sm mt-1">
                        Event at capacity - registrations go to waiting list
                      </p>
                    )}
                  </div>
                  {event.foodOptions && (
                    <div>
                      <p className="text-gray-500 text-sm">
                        Food & Refreshments
                      </p>
                      <p className="text-gray-700 text-sm">
                        {event.foodOptions}
                      </p>
                    </div>
                  )}
                  {event.accommodationOptions && (
                    <div>
                      <p className="text-gray-500 text-sm">Accommodation</p>
                      <p className="text-gray-700 text-sm">
                        {event.accommodationOptions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">
                  Register Your Team
                </h2>

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-lg">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clubName}
                      onChange={(e) =>
                        setFormData({ ...formData, clubName: e.target.value })
                      }
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      placeholder="e.g. Paris Gaels"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-lg">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2 text-lg">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2 text-lg">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-lg">
                      Number of Players *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.numberOfPlayers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfPlayers: parseInt(e.target.value) || 15,
                        })
                      }
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Approximate number of players in your group
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-lg">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          additionalNotes: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      placeholder="Any dietary requirements, accessibility needs, or other information..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#f5c842] text-[#1e3a5f] font-bold py-4 px-8 rounded-lg text-xl hover:bg-[#e5b832] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Register Team"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
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
        <Link
          href="/gge/events"
          className="text-white/80 hover:text-white transition-colors font-medium"
        >
          All Events →
        </Link>
      </div>
    </header>
  );
}
