"use client";

import { useState } from "react";

interface VisitClubCardProps {
  clubId: string;
  clubName: string;
  dayPassPrice?: number | null;
  dayPassCurrency?: string | null;
}

export default function VisitClubCard({
  clubId,
  clubName,
  dayPassPrice,
  dayPassCurrency,
}: VisitClubCardProps) {
  const [isDayPassExpanded, setIsDayPassExpanded] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeekend, setSelectedWeekend] = useState("");
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

  // Generate next 6 months
  const getNextMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return months;
  };

  // Generate weekends for selected month
  const getWeekendsInMonth = (monthValue: string) => {
    if (!monthValue) return [];
    const [year, month] = monthValue.split("-").map(Number);
    const weekends = [];
    const date = new Date(year, month - 1, 1);

    while (date.getMonth() === month - 1) {
      if (date.getDay() === 6) {
        // Saturday
        const saturday = new Date(date);
        const sunday = new Date(date);
        sunday.setDate(sunday.getDate() + 1);

        weekends.push({
          value: saturday.toISOString().split("T")[0],
          label: `${saturday.getDate()}-${sunday.getDate()} ${saturday.toLocaleDateString("en-GB", { month: "short" })}`,
        });
      }
      date.setDate(date.getDate() + 1);
    }
    return weekends;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/clubs/${clubId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "interest",
          preferredWeekend: selectedWeekend,
          message: `Preferred weekend: ${selectedWeekend}${formData.message ? `\n\nAdditional notes: ${formData.message}` : ""}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", clubName: "", email: "", message: "" });
        setSelectedMonth("");
        setSelectedWeekend("");
        setTimeout(() => {
          setShowInterestForm(false);
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const months = getNextMonths();
  const weekends = getWeekendsInMonth(selectedMonth);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-white"
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
          <h3 className="text-base font-semibold text-white">
            Plan Your Visit
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Day-Pass Section */}
        {dayPassPrice && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-600"
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
                <span className="text-sm font-medium text-gray-700">
                  Day-Pass
                </span>
              </div>
              <div>
                <span className="text-lg font-bold text-green-600">
                  {currencySymbol}
                  {dayPassPrice}
                </span>
                <span className="text-xs text-gray-500">/person</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDayPassExpanded(!isDayPassExpanded)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-2"
            >
              <span>What&apos;s included?</span>
              <svg
                className={`w-3 h-3 transition-transform ${isDayPassExpanded ? "rotate-180" : ""}`}
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
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 space-y-3">
                <p>
                  Unlike clubs back home, European GAA clubs don&apos;t own
                  their own facilities - so this contribution helps cover:
                </p>
                <ul className="space-y-2">
                  {[
                    {
                      title: "Pitch rental",
                      desc: "Access to local sports facilities",
                    },
                    {
                      title: "Equipment",
                      desc: "Balls, cones, bibs, and gear provided",
                    },
                    {
                      title: "Local coordination",
                      desc: "Club members organising your visit",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.title}
                        </span>
                        <span className="text-gray-500"> - {item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 italic">
                  Many clubs also organise post-match socials - a great way to
                  connect with the local GAA community!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Interest Section */}
        {!showInterestForm ? (
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-sm font-medium text-gray-900">
                Interested in visiting {clubName}?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Let them know when you&apos;d like to visit
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInterestForm(true)}
              className="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
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
              Pick a Weekend
            </button>
          </div>
        ) : success ? (
          <div className="text-center py-6">
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
            <p className="text-green-700 font-semibold">Interest registered!</p>
            <p className="text-gray-600 text-sm mt-1">
              {clubName} will be notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-center pb-2">
              <p className="text-sm font-medium text-gray-900">
                Pick your preferred weekend
              </p>
            </div>

            {/* Month Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedWeekend("");
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select month...</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Weekend Selection */}
            {selectedMonth && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Weekend
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {weekends.map((weekend) => (
                    <button
                      key={weekend.value}
                      type="button"
                      onClick={() => setSelectedWeekend(weekend.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selectedWeekend === weekend.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary"
                      }`}
                    >
                      {weekend.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedWeekend && (
              <>
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your details
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Your club name"
                      required
                      value={formData.clubName}
                      onChange={(e) =>
                        setFormData({ ...formData, clubName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <textarea
                      placeholder="Any additional notes? (optional)"
                      rows={2}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {error && <p className="text-red-600 text-xs">{error}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInterestForm(false);
                      setSelectedMonth("");
                      setSelectedWeekend("");
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-3 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Register Interest"}
                  </button>
                </div>
              </>
            )}

            {!selectedWeekend && selectedMonth && (
              <button
                type="button"
                onClick={() => {
                  setShowInterestForm(false);
                  setSelectedMonth("");
                }}
                className="w-full px-3 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

            {!selectedMonth && (
              <button
                type="button"
                onClick={() => setShowInterestForm(false)}
                className="w-full px-3 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
