"use client";

import { useState } from "react";

interface ClubAvailabilityBadgeProps {
  clubId: string;
  clubName: string;
  isOpenToVisitors: boolean;
  preferredWeekends?: string[] | null;
}

// Placeholder weekends for demo - St. Patrick's Day weekend 2026, July 2026, August 2026
const placeholderWeekends = [
  "2026-03-14", // Weekend before St. Patrick's Day (14-15 March 2026)
  "2026-07-11", // July weekend (11-12 July 2026)
  "2026-08-15", // August weekend (15-16 August 2026)
];

export default function ClubAvailabilityBadge({
  clubId,
  clubName,
  isOpenToVisitors,
  preferredWeekends,
}: ClubAvailabilityBadgeProps) {
  const [showAllDates, setShowAllDates] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clubName: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Use provided weekends or fallback to placeholders
  const displayWeekends =
    preferredWeekends && preferredWeekends.length > 0
      ? preferredWeekends
      : placeholderWeekends;

  const isUsingPlaceholders =
    !preferredWeekends || preferredWeekends.length === 0;

  const formatWeekendCompact = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/clubs/${clubId}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "interest",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", clubName: "", email: "", message: "" });
        setTimeout(() => {
          setShowInterestForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpenToVisitors) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-500"
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
          Open to Hosting
        </h3>
        <p className="text-base text-gray-500">
          Not currently open to hosting.
        </p>
      </div>
    );
  }

  const visibleDates = showAllDates
    ? displayWeekends
    : displayWeekends.slice(0, 3);
  const hasMoreDates = displayWeekends.length > 3;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-green-50 rounded-xl border-2 border-primary/30 shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
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
        <span>Open to Hosting</span>
      </h3>

      {!showInterestForm ? (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-700 font-medium">
            This club is open to hosting a tournament on these weekends:
          </p>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {visibleDates.map((date, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-semibold bg-white text-primary border-2 border-primary/30 shadow-sm"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-primary/70"
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
                {formatWeekendCompact(date)}
              </span>
            ))}
            {!showAllDates && hasMoreDates && (
              <button
                type="button"
                onClick={() => setShowAllDates(true)}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-white/80 border-2 border-dashed border-gray-300"
              >
                +{displayWeekends.length - 3} more
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-white/50 rounded-lg p-2.5 sm:p-3 border border-gray-200">
            If any of these dates suit your club, register your interest. When
            clubs see demand, they&apos;re more likely to organise an event!
          </p>

          <button
            type="button"
            onClick={() => setShowInterestForm(true)}
            className="w-full px-4 py-2.5 sm:py-3 bg-primary text-white rounded-xl text-base sm:text-lg font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            Register Interest
          </button>
        </div>
      ) : success ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          <p className="text-green-700 text-lg font-bold mb-1">
            Interest registered!
          </p>
          <p className="text-gray-600 text-base">
            {clubName} will be notified.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {isUsingPlaceholders && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 mb-1">
              <p className="text-xs sm:text-sm text-amber-800 font-medium flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  These dates are placeholders. Please do not register interest
                  yet - real availability coming soon.
                </span>
              </p>
            </div>
          )}
          <input
            type="text"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Your club name"
            required
            value={formData.clubName}
            onChange={(e) =>
              setFormData({ ...formData, clubName: e.target.value })
            }
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Your email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <textarea
            placeholder="Which dates interest you?"
            rows={3}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowInterestForm(false)}
              className="flex-1 px-4 py-3 text-base font-medium border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 text-base font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
