"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type EventType =
  | "DADS_AND_LADS"
  | "GAELIC4MOTHERS_AND_OTHERS"
  | "SOCIAL_CAMOGIE";

const eventTypeLabels: Record<EventType, string> = {
  DADS_AND_LADS: "Dads & Lads (GAA)",
  GAELIC4MOTHERS_AND_OTHERS: "Gaelic4Mothers&Others (LGFA)",
  SOCIAL_CAMOGIE: "Social Camogie (Camogie Association)",
};

export default function RegisterInterestPage() {
  const [formData, setFormData] = useState({
    clubName: "",
    country: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    eventTypes: [] as EventType[],
    estimatedPlayers: "",
    previousParticipation: "",
    additionalNotes: "",
    website: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEventTypeChange = (type: EventType) => {
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter((t) => t !== type)
        : [...prev.eventTypes, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.eventTypes.length === 0) {
      setError("Please select at least one event type you're interested in.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/gge/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit registration");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-200">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
              Interest Registered!
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Thank you for registering your interest in Social GAA events.
              You&apos;ve been added to our waiting list and will be notified
              when events become available in your area.
            </p>
            <p className="text-gray-500 mb-8">
              A confirmation email has been sent to{" "}
              <strong>{formData.contactEmail}</strong>
            </p>
            <Link
              href="/gge/events"
              className="inline-block bg-[#1e3a5f] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">
              Register Your Interest
            </h2>
            <p className="text-gray-600 text-lg">
              Join the waiting list for upcoming Social GAA events
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
          >
            {/* Honeypot field - hidden from real users, bots will fill it */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="gge-website">Website</label>
              <input
                type="text"
                id="gge-website"
                name="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Club Details Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-gray-200">
                Club Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
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
                    placeholder="e.g. Munich Colmcilles"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    County *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="e.g. Dublin"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-gray-200">
                Contact Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="+49 123 456 7890"
                  />
                </div>
              </div>
            </div>

            {/* Event Interest Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-gray-200">
                Event Interest
              </h3>
              <p className="text-gray-600 mb-4">
                Which events are you interested in? (Select all that apply) *
              </p>
              <div className="space-y-3">
                {(Object.keys(eventTypeLabels) as EventType[]).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.eventTypes.includes(type)
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.eventTypes.includes(type)}
                      onChange={() => handleEventTypeChange(type)}
                      className="w-5 h-5 text-[#1e3a5f] border-gray-300 rounded focus:ring-[#1e3a5f]"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-700">
                      {eventTypeLabels[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-gray-200">
                Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Estimated number of players
                  </label>
                  <select
                    value={formData.estimatedPlayers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedPlayers: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="1-10">1-10 players</option>
                    <option value="11-20">11-20 players</option>
                    <option value="21-30">21-30 players</option>
                    <option value="30+">30+ players</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Have you participated in Social GAA events before?
                  </label>
                  <select
                    value={formData.previousParticipation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousParticipation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="no">No, this would be our first time</option>
                    <option value="yes-1">Yes, 1 event</option>
                    <option value="yes-2-3">Yes, 2-3 events</option>
                    <option value="yes-4+">Yes, 4+ events</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Anything else you&apos;d like us to know?
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
                    placeholder="e.g. preferred locations, travel limitations, etc."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#f5c842] text-[#1e3a5f] font-bold py-4 px-8 rounded-lg text-xl hover:bg-[#e5b832] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Register Interest"}
              </button>
              <Link
                href="/gge/events"
                className="flex-1 text-center bg-gray-100 text-gray-700 font-bold py-4 px-8 rounded-lg text-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
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
            <p className="text-sm text-[#f5c842]">Social GAA 2026</p>
          </div>
        </Link>
        <Link
          href="/gge/events"
          className="text-white/80 hover:text-white transition-colors font-medium text-sm md:text-base"
        >
          <span className="sm:hidden">← Back</span>
          <span className="hidden sm:inline">← Back to Events</span>
        </Link>
      </div>
    </header>
  );
}
