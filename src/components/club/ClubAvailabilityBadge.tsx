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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
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
          Available Dates
        </h3>
        <p className="text-sm text-gray-500">Not currently hosting visitors.</p>
      </div>
    );
  }

  const visibleDates = showAllDates
    ? displayWeekends
    : displayWeekends.slice(0, 3);
  const hasMoreDates = displayWeekends.length > 3;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-gray-400"
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
        Available Dates
      </h3>

      {!showInterestForm ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Weekends open for hosting:</p>

          <div className="flex flex-wrap gap-1.5">
            {visibleDates.map((date, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {formatWeekendCompact(date)}
              </span>
            ))}
            {!showAllDates && hasMoreDates && (
              <button
                type="button"
                onClick={() => setShowAllDates(true)}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                +{displayWeekends.length - 3} more
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowInterestForm(true)}
            className="w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Register Interest
          </button>
        </div>
      ) : success ? (
        <div className="text-center py-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-primary text-sm font-medium">
            Interest registered!
          </p>
          <p className="text-gray-500 text-xs">{clubName} will be notified.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Name your club"
            required
            value={formData.clubName}
            onChange={(e) =>
              setFormData({ ...formData, clubName: e.target.value })
            }
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Your email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <textarea
            placeholder="Which dates interest you?"
            rows={2}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowInterestForm(false)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
