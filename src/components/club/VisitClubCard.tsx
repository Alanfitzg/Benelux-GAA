"use client";

import { useState } from "react";

interface VisitClubCardProps {
  clubId: string;
  clubName: string;
  dayPassPrice?: number | null;
  dayPassCurrency?: string | null;
  isOpenToVisitors?: boolean;
  preferredWeekends?: string[] | null;
}

const placeholderWeekends = ["2026-03-14", "2026-07-11", "2026-08-15"];

export default function VisitClubCard({
  clubId,
  clubName,
  dayPassPrice,
  dayPassCurrency,
  isOpenToVisitors = true,
  preferredWeekends,
}: VisitClubCardProps) {
  const [isDayPassExpanded, setIsDayPassExpanded] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
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

  const currencySymbol = dayPassCurrency === "GBP" ? "£" : "€";
  const displayWeekends =
    preferredWeekends && preferredWeekends.length > 0
      ? preferredWeekends
      : placeholderWeekends;
  const isUsingPlaceholders =
    !preferredWeekends || preferredWeekends.length === 0;
  const visibleDates = showAllDates
    ? displayWeekends
    : displayWeekends.slice(0, 3);
  const hasMoreDates = displayWeekends.length > 3;

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "interest" }),
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

  return (
    <div className="bg-white rounded-xl border border-primary/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 px-4 py-3 border-b border-primary/20">
        <div className="flex items-center gap-2">
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
          <h3 className="text-base font-semibold text-primary">
            Plan Your Visit
          </h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Day-Pass Section */}
        {dayPassPrice && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
                <span className="font-medium text-gray-900">Day-Pass</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-sm">approx. </span>
                <span className="text-xl font-bold text-green-600">
                  {currencySymbol}
                  {dayPassPrice}
                </span>
                <span className="text-gray-500 text-sm"> /person</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDayPassExpanded(!isDayPassExpanded)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <span>What is a Day-Pass?</span>
              <svg
                className={`w-4 h-4 transition-transform ${isDayPassExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDayPassExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Unlike clubs in Ireland, European GAA clubs typically
                  don&apos;t own their own facilities. Pitch rental, equipment,
                  and venue hire all come at a cost.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The Day-Pass is a suggested per-person contribution that helps{" "}
                  {clubName} plan and budget for your visit.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="font-medium text-gray-900 text-sm mb-2">
                    What this helps cover:
                  </p>
                  <ul className="space-y-1">
                    {[
                      "Pitch and facility rental",
                      "Training session coordination",
                      "Equipment and supplies",
                      "Local club support",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-green-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Actual inclusions may vary. Contact the club to confirm
                  arrangements.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hosting Availability Section */}
        <div className="p-4">
          {!showInterestForm ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className={`w-5 h-5 ${isOpenToVisitors ? "text-primary" : "text-gray-400"}`}
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
                <span className="font-medium text-gray-900">
                  {isOpenToVisitors
                    ? "Open to Hosting"
                    : "Hosting Availability"}
                </span>
              </div>

              {isOpenToVisitors ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Available weekends for tournaments:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleDates.map((date, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {formatWeekendCompact(date)}
                      </span>
                    ))}
                    {!showAllDates && hasMoreDates && (
                      <button
                        type="button"
                        onClick={() => setShowAllDates(true)}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 border border-dashed border-gray-300"
                      >
                        +{displayWeekends.length - 3} more
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    Register your interest if any dates suit your club. When
                    clubs see demand, they&apos;re more likely to organise an
                    event.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (isUsingPlaceholders) {
                        setShowWarningPopup(true);
                      } else {
                        setShowInterestForm(true);
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Register Interest
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Not currently open to hosting visitors.
                </p>
              )}
            </>
          ) : success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <p className="text-green-700 font-semibold">
                Interest registered!
              </p>
              <p className="text-gray-600 text-sm">
                {clubName} will be notified.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Your club name"
                required
                value={formData.clubName}
                onChange={(e) =>
                  setFormData({ ...formData, clubName: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Your email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <textarea
                placeholder="Which dates interest you?"
                rows={2}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInterestForm(false)}
                  className="flex-1 px-3 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Warning Popup for Placeholder Dates */}
      {showWarningPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Please Note
                </h3>
                <p className="text-gray-600 text-sm">
                  These dates are placeholders. Real availability coming soon -
                  please do not register interest for these specific dates yet.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowWarningPopup(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWarningPopup(false);
                  setShowInterestForm(true);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
