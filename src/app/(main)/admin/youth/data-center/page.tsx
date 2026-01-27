"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface EventStat {
  id: string;
  name: string;
  registrations: number;
  capacity: number;
  countries: number;
  avgAge: number;
}

interface CountryParticipation {
  country: string;
  clubs: number;
  players: number;
  events: number;
}

const eventStats: EventStat[] = [];

const countryStats: CountryParticipation[] = [];

const monthlyTrends: {
  month: string;
  registrations: number;
  events: number;
}[] = [];

export default function YouthDataCenterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "events" | "countries" | "trends"
  >("overview");

  useEffect(() => {
    if (status === "loading") return;
    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" &&
        session.user.role !== "YOUTH_OFFICER")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "YOUTH_OFFICER")
  ) {
    return null;
  }

  const totalRegistrations = eventStats.reduce(
    (acc, e) => acc + e.registrations,
    0
  );
  const totalCapacity = eventStats.reduce((acc, e) => acc + e.capacity, 0);
  const totalClubs = countryStats.reduce((acc, c) => acc + c.clubs, 0);
  const totalPlayers = countryStats.reduce((acc, c) => acc + c.players, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/admin/youth"
              className="text-white/70 hover:text-white transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Data Center
              </h1>
              <p className="text-white/70 text-sm">
                Analytics and insights for youth programs
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {(["overview", "events", "countries", "trends"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* Empty State */}
        {eventStats.length === 0 && countryStats.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Data Available
            </h3>
            <p className="text-white/60 mb-6">
              Analytics and insights will appear here once youth events and
              clubs are added.
            </p>
            <Link
              href="/admin/youth/events?action=new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Event
            </Link>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" &&
          (eventStats.length > 0 || countryStats.length > 0) && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="text-3xl font-bold text-white">
                    {totalRegistrations}
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    Total Registrations
                  </div>
                  <div className="text-xs text-green-400 mt-2">
                    +23% from last year
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="text-3xl font-bold text-white">
                    {totalClubs}
                  </div>
                  <div className="text-sm text-white/60 mt-1">Active Clubs</div>
                  <div className="text-xs text-green-400 mt-2">
                    +5 new clubs
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="text-3xl font-bold text-white">
                    {totalPlayers}
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    Youth Players
                  </div>
                  <div className="text-xs text-green-400 mt-2">+18% growth</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="text-3xl font-bold text-cyan-400">
                    {Math.round((totalRegistrations / totalCapacity) * 100)}%
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    Avg Fill Rate
                  </div>
                  <div className="text-xs text-white/40 mt-2">
                    Across all events
                  </div>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Events */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Top Events by Registration
                  </h3>
                  <div className="space-y-3">
                    {eventStats.slice(0, 5).map((event, idx) => (
                      <div key={event.id} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            idx === 0
                              ? "bg-amber-500 text-amber-900"
                              : idx === 1
                                ? "bg-gray-400 text-gray-900"
                                : idx === 2
                                  ? "bg-amber-700 text-amber-100"
                                  : "bg-white/10 text-white/60"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {event.name}
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-cyan-500 h-1.5 rounded-full"
                              style={{
                                width: `${(event.registrations / event.capacity) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-white/60">
                          {event.registrations}/{event.capacity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Country Distribution */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Participation by Country
                  </h3>
                  <div className="space-y-3">
                    {countryStats.map((country) => (
                      <div
                        key={country.country}
                        className="flex items-center gap-3"
                      >
                        <div className="w-24 text-sm text-white/80">
                          {country.country}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(country.players / totalPlayers) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-white/60 w-16 text-right">
                          {country.players} players
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        {/* Events Tab */}
        {activeTab === "events" && eventStats.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Fill Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Countries
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Avg Age
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eventStats.map((event) => (
                    <tr key={event.id} className="hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">
                          {event.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/60">
                        {event.registrations} / {event.capacity}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                event.registrations / event.capacity >= 0.8
                                  ? "bg-green-500"
                                  : event.registrations / event.capacity >= 0.5
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${(event.registrations / event.capacity) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-white/60">
                            {Math.round(
                              (event.registrations / event.capacity) * 100
                            )}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/60">
                        {event.countries}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/60">
                        {event.avgAge} years
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Countries Tab */}
        {activeTab === "countries" && countryStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryStats.map((country) => (
              <div
                key={country.country}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {country.country}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {country.clubs}
                    </div>
                    <div className="text-xs text-white/50">Clubs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {country.players}
                    </div>
                    <div className="text-xs text-white/50">Players</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {country.events}
                    </div>
                    <div className="text-xs text-white/50">Events</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && monthlyTrends.length > 0 && (
          <div className="space-y-6">
            {/* Registration Trend */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Registration Trend (2026)
              </h3>
              <div className="flex items-end gap-2 h-48">
                {monthlyTrends.map((month) => (
                  <div
                    key={month.month}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all"
                      style={{
                        height: `${(month.registrations / 400) * 100}%`,
                      }}
                    />
                    <span className="text-xs text-white/50">{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/60">
                <div className="w-3 h-3 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded" />
                <span>Cumulative Registrations</span>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="text-sm text-white/60 mb-2">
                  Year-over-Year Growth
                </div>
                <div className="text-3xl font-bold text-green-400">+23%</div>
                <div className="text-xs text-white/40 mt-1">vs 2025</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="text-sm text-white/60 mb-2">
                  New Clubs (2026)
                </div>
                <div className="text-3xl font-bold text-cyan-400">+5</div>
                <div className="text-xs text-white/40 mt-1">Joined program</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="text-sm text-white/60 mb-2">Retention Rate</div>
                <div className="text-3xl font-bold text-amber-400">87%</div>
                <div className="text-xs text-white/40 mt-1">
                  Returning players
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        {(eventStats.length > 0 || countryStats.length > 0) && (
          <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">Export Data</h3>
                <p className="text-xs text-white/50 mt-1">
                  Download reports in various formats
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
