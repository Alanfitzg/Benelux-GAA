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

export default function HostApplicationPage() {
  const [formData, setFormData] = useState({
    clubName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    eventType: "" as EventType | "",
    proposedDate: "",
    location: "",
    venueName: "",
    venueDetails: "",
    numberOfPitches: 1,
    maxTeams: 8,
    foodOptions: "",
    accommodationOptions: "",
    localAttractions: "",
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/gge/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit application");
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
      <div className="min-h-screen bg-gray-50">
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
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Thank you for your interest in hosting a Recreational Games event.
              Your application has been received and will be reviewed by the GGE
              Recreational Games Officer.
            </p>
            <p className="text-gray-500 mb-8">
              You will receive a confirmation email shortly at{" "}
              <strong>{formData.contactEmail}</strong>
            </p>
            <Link
              href="/gge"
              className="inline-block bg-[#1e3a5f] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              Return to Home
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
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">
              Host Application Form
            </h2>
            <p className="text-gray-600 text-lg">
              Apply to host a Recreational Games blitz in 2026
            </p>
            <p className="text-[#f5c842] font-medium mt-2">
              Applications close 13th February 2026
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
          >
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
                    placeholder="e.g. Munich Colmcilles"
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
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Contact Email *
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
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
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

            {/* Event Details Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-gray-200">
                Event Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Event Type *
                  </label>
                  <select
                    required
                    value={formData.eventType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eventType: e.target.value as EventType,
                      })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  >
                    <option value="">Select event type...</option>
                    {(Object.keys(eventTypeLabels) as EventType[]).map(
                      (type) => (
                        <option key={type} value={type}>
                          {eventTypeLabels[type]}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Proposed Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.proposedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, proposedDate: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Location (City/Town) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="e.g. Munich, Germany"
                  />
                </div>
              </div>
            </div>

            {/* Venue Details Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-gray-200">
                Venue Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venueName}
                    onChange={(e) =>
                      setFormData({ ...formData, venueName: e.target.value })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="e.g. Sportpark Unterhaching"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Number of Pitches *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.numberOfPitches}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfPitches: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Maximum Teams *
                  </label>
                  <input
                    type="number"
                    required
                    min={2}
                    value={formData.maxTeams}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxTeams: parseInt(e.target.value) || 8,
                      })
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Venue Facilities
                  </label>
                  <textarea
                    value={formData.venueDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, venueDetails: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="Describe facilities: changing rooms, parking, toilets, etc."
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-gray-200">
                Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Food & Refreshments
                  </label>
                  <textarea
                    value={formData.foodOptions}
                    onChange={(e) =>
                      setFormData({ ...formData, foodOptions: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="e.g. BBQ provided, on-site canteen, local vendors..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Accommodation Options
                  </label>
                  <textarea
                    value={formData.accommodationOptions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accommodationOptions: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="Nearby hotels, group rates arranged, etc."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-lg">
                    Local Attractions
                  </label>
                  <textarea
                    value={formData.localAttractions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        localAttractions: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="What else can visitors enjoy in your area?"
                  />
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
                    placeholder="Any other information you'd like to share..."
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
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
              <Link
                href="/gge"
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
            <p className="text-sm text-[#f5c842]">Recreational Games 2026</p>
          </div>
        </Link>
        <Link
          href="/gge/events"
          className="text-white/80 hover:text-white transition-colors font-medium"
        >
          View Events →
        </Link>
      </div>
    </header>
  );
}
