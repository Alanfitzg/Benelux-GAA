"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Trophy,
  ExternalLink,
  Monitor,
  Info,
  PartyPopper,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface ClubMilestone {
  clubId: string;
  clubName: string;
  country: string;
  countryFlag: string;
  foundedYear: number;
  milestoneYear: number;
  anniversaryYears: number;
  isVerified: boolean;
  hasAdmin: boolean;
}

interface EuropeanEvent {
  date: string;
  name: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  type: "national" | "religious" | "festival" | "cultural";
  description: string;
  travelAppeal: "high" | "medium" | "low";
  typicalDuration: number;
  wikiUrl?: string;
}

interface SourceHoliday {
  date: string;
  name: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  isLongWeekend: boolean;
}

interface CombinedOpportunity {
  date: string;
  type: "holiday" | "festival" | "milestone" | "combined";
  title: string;
  description: string;
  country: string;
  countryFlag: string;
  travelAppeal?: string;
  clubMilestone?: ClubMilestone;
  nearbyHoliday?: {
    name: string;
    date: string;
    country: string;
  };
}

interface EventBuilderData {
  year: number;
  summary: {
    totalEuropeanClubs: number;
    clubsWithFoundedYear: number;
    milestonesThisYear: number;
    decadeMilestones: number;
    highAppealEvents: number;
    totalFestivals: number;
    combinedOpportunities: number;
  };
  milestones: ClubMilestone[];
  europeanEvents: EuropeanEvent[];
  sourceMarketHolidays: SourceHoliday[];
  combinedOpportunities: CombinedOpportunity[];
  eventsByMonth: Record<
    string,
    {
      europeanEvents: EuropeanEvent[];
      sourceHolidays: SourceHoliday[];
    }
  >;
  milestoneBreakdown: { anniversary: string; count: number }[];
  topMilestoneCountries: { country: string; count: number }[];
  availableCountries: { code: string; name: string; flag: string }[];
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventTypeColors: Record<string, string> = {
  national: "bg-blue-100 text-blue-800 border-blue-200",
  religious: "bg-purple-100 text-purple-800 border-purple-200",
  festival: "bg-orange-100 text-orange-800 border-orange-200",
  cultural: "bg-green-100 text-green-800 border-green-200",
};

export default function EventBuilderPage() {
  const [data, setData] = useState<EventBuilderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(Math.max(2026, new Date().getFullYear()));
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "calendar" | "milestones" | "opportunities"
  >("calendar");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ year: year.toString() });
      if (countryFilter) params.set("country", countryFilter);

      const response = await fetch(`/api/admin/event-builder?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching event builder data:", error);
    } finally {
      setLoading(false);
    }
  }, [year, countryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Event Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      {/* Mobile blocker */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Monitor className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Desktop Only</h2>
          <p className="text-indigo-200 mb-6">
            The Event Builder contains detailed calendars and data that require
            a larger screen. Please access this page on a desktop or laptop
            computer.
          </p>
          <Link
            href="/admin"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Admin
          </Link>
        </div>
      </div>

      {/* Desktop content */}
      <div className="hidden lg:block container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-indigo-300 hover:text-white text-sm mb-2 inline-block"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Event Builder
          </h1>
          <p className="text-indigo-200 mt-1">
            Plan tournaments around holidays, festivals, and club milestones
          </p>
        </div>

        {/* Year Selector & Filters */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setYear((y) => Math.max(2026, y - 1))}
                disabled={year <= 2026}
                className={`p-2 rounded-lg text-white ${
                  year <= 2026
                    ? "bg-white/5 cursor-not-allowed opacity-50"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold text-white px-4">{year}</span>
              <button
                type="button"
                onClick={() => setYear((y) => y + 1)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-300" />
              <select
                value={countryFilter || ""}
                onChange={(e) => setCountryFilter(e.target.value || null)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
              >
                <option value="">All Countries</option>
                {data?.availableCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "calendar"
                    ? "bg-white text-indigo-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("milestones")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "milestones"
                    ? "bg-white text-indigo-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Milestones
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("opportunities")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "opportunities"
                    ? "bg-white text-indigo-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                Golden Opportunities
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center relative group">
            <div className="absolute top-2 right-2 group/tooltip">
              <Info className="w-3.5 h-3.5 text-indigo-300/50 hover:text-indigo-200" />
              <div className="absolute right-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                Total GAA clubs registered in mainland Europe
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {data?.summary.totalEuropeanClubs || 0}
            </p>
            <p className="text-indigo-200 text-xs">European Clubs</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center relative group">
            <div className="absolute top-2 right-2 group/tooltip">
              <Info className="w-3.5 h-3.5 text-indigo-300/50 hover:text-indigo-200" />
              <div className="absolute right-0 top-6 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                Clubs celebrating milestone anniversaries (5, 10, 15, 20, 25,
                30+ years) in the selected year
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {data?.summary.milestonesThisYear || 0}
            </p>
            <p className="text-indigo-200 text-xs">Milestones in {year}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center relative group">
            <div className="absolute top-2 right-2 group/tooltip">
              <Info className="w-3.5 h-3.5 text-indigo-300/50 hover:text-indigo-200" />
              <div className="absolute right-0 top-6 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                Major European festivals (carnivals, cultural celebrations)
                great for combined GAA trips
              </div>
            </div>
            <p className="text-3xl font-bold text-pink-400">
              {data?.summary.totalFestivals || 0}
            </p>
            <p className="text-indigo-200 text-xs">Festivals</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center relative group">
            <div className="absolute top-2 right-2 group/tooltip">
              <Info className="w-3.5 h-3.5 text-indigo-300/50 hover:text-indigo-200" />
              <div className="absolute right-0 top-6 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                Events rated as highly attractive for GAA travel - best
                opportunities for tournament scheduling
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {data?.summary.highAppealEvents || 0}
            </p>
            <p className="text-indigo-200 text-xs">High Appeal Events</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center relative group">
            <div className="absolute top-2 right-2 group/tooltip">
              <Info className="w-3.5 h-3.5 text-indigo-300/50 hover:text-indigo-200" />
              <div className="absolute right-0 top-6 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                Irish and UK bank holidays - key travel windows when clubs are
                most likely to travel
              </div>
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              {data?.sourceMarketHolidays.length || 0}
            </p>
            <p className="text-indigo-200 text-xs">IE/UK Holidays</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center relative group">
            <div className="absolute top-2 right-2 group/tooltip">
              <Info className="w-3.5 h-3.5 text-indigo-300/50 hover:text-indigo-200" />
              <div className="absolute right-0 top-6 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                Club milestones that coincide with local festivals - premium
                event opportunities
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {data?.summary.combinedOpportunities || 0}
            </p>
            <p className="text-indigo-200 text-xs">Combined Opportunities</p>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MONTHS.map((month, idx) => {
              const monthKey = (idx + 1).toString().padStart(2, "0");
              const monthData = data?.eventsByMonth[monthKey];
              const events = monthData?.europeanEvents || [];
              const rawHolidays = monthData?.sourceHolidays || [];

              // Group holidays by date and name to combine IE/UK flags
              const groupedHolidays = rawHolidays.reduce(
                (acc, h) => {
                  const key = `${h.date}-${h.name}`;
                  if (!acc[key]) {
                    acc[key] = { ...h, flags: [h.countryFlag] };
                  } else {
                    acc[key].flags.push(h.countryFlag);
                  }
                  return acc;
                },
                {} as Record<
                  string,
                  (typeof rawHolidays)[0] & { flags: string[] }
                >
              );
              const holidays = Object.values(groupedHolidays);

              return (
                <div key={month} className="bg-white rounded-xl p-4 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                    {month}
                    <span className="text-xs font-normal text-gray-500">
                      {events.length + holidays.length} events
                    </span>
                  </h3>

                  {/* Source Market Holidays (IE/UK) */}
                  {holidays.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1 font-medium">
                        Irish/UK Holidays
                      </p>
                      {holidays.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0"
                        >
                          <span>{h.flags.join(" ")}</span>
                          <span className="text-sm text-gray-700">
                            {h.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(h.date).getDate()}
                          </span>
                          {h.isLongWeekend && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              Long W/E
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* European Events */}
                  {events.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1 font-medium">
                        European Events
                      </p>
                      {events.slice(0, 5).map((e, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-base">{e.countryFlag}</span>
                          <div className="flex-1 min-w-0">
                            {e.wikiUrl ? (
                              <a
                                href={e.wikiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate flex items-center gap-1"
                              >
                                {e.name}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            ) : (
                              <p className="text-sm text-gray-700 truncate">
                                {e.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">{e.country}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs text-gray-400">
                              {new Date(e.date).getDate()}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded border ${eventTypeColors[e.type]}`}
                            >
                              {e.type}
                            </span>
                          </div>
                        </div>
                      ))}
                      {events.length > 5 && (
                        <p className="text-xs text-gray-400 mt-1">
                          +{events.length - 5} more
                        </p>
                      )}
                    </div>
                  )}

                  {events.length === 0 && holidays.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      No major events this month
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="space-y-6">
            {/* Milestone Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Club Anniversaries in {year}
              </h3>

              {data?.milestoneBreakdown &&
              data.milestoneBreakdown.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {data.milestoneBreakdown.map((m, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 text-center border border-yellow-200"
                    >
                      <p className="text-3xl font-bold text-yellow-600">
                        {m.count}
                      </p>
                      <p className="text-sm text-yellow-800">{m.anniversary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No milestone anniversaries found for {year}
                </p>
              )}

              {/* Countries with milestones */}
              {data?.topMilestoneCountries &&
                data.topMilestoneCountries.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">
                      By Country
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.topMilestoneCountries.map((c, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {c.country}: {c.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Full milestone list */}
              <h4 className="font-medium text-gray-700 mb-3">All Milestones</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                        Club
                      </th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                        Country
                      </th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                        Founded
                      </th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                        Anniversary
                      </th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.milestones || []).map((m, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          <Link
                            href={`/clubs/${m.clubId}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {m.clubName}
                          </Link>
                        </td>
                        <td className="py-2 px-3">
                          {m.countryFlag} {m.country}
                        </td>
                        <td className="py-2 px-3 text-gray-600">
                          {m.foundedYear}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">
                            {m.anniversaryYears} years
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {m.isVerified ? (
                            <span className="text-green-600 text-sm">
                              ✓ Verified
                            </span>
                          ) : m.hasAdmin ? (
                            <span className="text-blue-600 text-sm">
                              Has Admin
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white mb-6">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Star className="w-6 h-6" />
                Golden Opportunities
              </h3>
              <p className="text-yellow-100">
                These are prime moments where club milestones align with
                festivals or holidays - perfect for special anniversary
                tournaments!
              </p>
            </div>

            {(data?.combinedOpportunities || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.combinedOpportunities.map((opp, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-yellow-500"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{opp.title}</h4>
                      <span className="text-2xl">{opp.countryFlag}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {opp.description}
                    </p>
                    {opp.nearbyHoliday && (
                      <div className="bg-orange-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-orange-600 font-medium mb-1">
                          Suggested Timing
                        </p>
                        <p className="text-sm text-orange-800">
                          <PartyPopper className="w-4 h-4 inline mr-1" />
                          {opp.nearbyHoliday.name} -{" "}
                          {new Date(opp.nearbyHoliday.date).toLocaleDateString(
                            "en-IE",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </p>
                      </div>
                    )}
                    {opp.clubMilestone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <Link
                          href={`/clubs/${opp.clubMilestone.clubId}`}
                          className="text-indigo-600 hover:underline"
                        >
                          View {opp.clubMilestone.clubName}
                        </Link>
                        {opp.clubMilestone.hasAdmin && (
                          <span className="text-green-600 text-xs">
                            (Has Admin)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No combined opportunities found for {year}.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting the year or country filter.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
