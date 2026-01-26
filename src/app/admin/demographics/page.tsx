"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface County {
  id: string;
  name: string;
  clubsGAA: number | null;
  clubsLGFA: number | null;
  clubsCamogie: number | null;
  youthMalePlayers: number | null;
  youthFemalePlayers: number | null;
  fullMalePlayers: number | null;
  fullFemalePlayers: number | null;
  nonPlayers: number | null;
  totalPitches: number | null;
  totalFloodlitPitches: number | null;
  totalFullSizePitches: number | null;
  teamsPerPitch: number | null;
  teamsCamogie: number | null;
  teamsLadiesFootball: number | null;
  teamsHurling: number | null;
  teamsFootball: number | null;
  totalTeams: number | null;
  populationFemale: number | null;
  populationMale: number | null;
  populationTotal: number | null;
  averageAge: number | null;
  population0to5: number | null;
  population6to11: number | null;
}

interface Province {
  id: string;
  name: string;
  totalClubsGAA: number;
  totalClubsLGFA: number;
  totalClubsCamogie: number;
  totalYouthMalePlayers: number;
  totalYouthFemalePlayers: number;
  totalFullMalePlayers: number;
  totalFullFemalePlayers: number;
  totalNonPlayers: number;
  totalPitches: number;
  totalPopulation: number;
  counties: County[];
}

interface ReportSummary {
  id: string;
  reportTitle: string;
  reportSubtitle: string | null;
  publishedDate: string;
  totalPopulation: number;
  totalClubs: number;
  totalMembers: number;
  dublinCommuterBeltPopulation: number | null;
  dublinCommuterBeltPopPercent: number | null;
}

interface PlayawayStats {
  totalActiveClubs: number;
  verifiedClubs: number;
  totalRegisteredPlayers: number;
  playersTravelled: number;
}

interface DemographicsData {
  provinces: Province[];
  reportSummary: ReportSummary | null;
  playawayStats: PlayawayStats;
}

export default function DemographicsPage() {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/demographics");
        if (!response.ok) {
          throw new Error("Failed to fetch demographics data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading demographics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { provinces, reportSummary, playawayStats } = data;

  const totalMembers = provinces.reduce(
    (acc, p) =>
      acc +
      (p.totalYouthMalePlayers || 0) +
      (p.totalYouthFemalePlayers || 0) +
      (p.totalFullMalePlayers || 0) +
      (p.totalFullFemalePlayers || 0) +
      (p.totalNonPlayers || 0),
    0
  );

  const totalPitches = provinces.reduce(
    (acc, p) => acc + (p.totalPitches || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="mb-4 md:mb-6">
          <Link
            href="/admin"
            className="text-white/70 hover:text-white text-xs md:text-sm"
          >
            &larr; Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl md:text-2xl">📊</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-white">
              GAA Demographics Report
            </h1>
            {reportSummary && (
              <p className="text-xs md:text-sm text-white/60 truncate">
                {reportSummary.reportTitle} -{" "}
                {new Date(reportSummary.publishedDate).toLocaleDateString(
                  "en-IE",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-start gap-2 md:gap-3">
            <span className="text-blue-400 text-base md:text-lg flex-shrink-0">
              ℹ️
            </span>
            <div>
              <h3 className="text-xs md:text-sm font-medium text-blue-300 mb-1">
                External GAA Report Data
              </h3>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                <span className="hidden md:inline">
                  This page displays demographic data from the GAA&apos;s
                  official December 2025 report &quot;No One Shouted Stop—Until
                  Now: The GAA&apos;s Response to Ireland&apos;s Demographic
                  Shift&quot;.
                </span>
                <strong className="text-white/90">
                  {" "}
                  This is external reference data only—it is not PlayAway data.
                </strong>{" "}
                <span className="hidden md:inline">
                  PlayAway&apos;s own club and user statistics are shown
                  separately in the comparison section below and do not yet
                  match the GAA&apos;s total figures. The GAA report covers the
                  entire Irish GAA ecosystem, while PlayAway is growing its
                  platform reach within this larger landscape.
                </span>
                <span className="md:hidden">
                  PlayAway&apos;s own statistics are shown separately below.
                </span>
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-sm md:text-lg font-semibold text-white/80 mb-2 md:mb-3">
          GAA Report Figures (External Data)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="text-xl md:text-3xl font-bold text-white">
              {reportSummary?.totalPopulation.toLocaleString() || "N/A"}
            </div>
            <div className="text-xs md:text-sm text-white/70">
              Total Population
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="text-xl md:text-3xl font-bold text-white">
              {reportSummary?.totalClubs.toLocaleString() || "N/A"}
            </div>
            <div className="text-xs md:text-sm text-white/70">
              GAA Clubs in Report
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="text-xl md:text-3xl font-bold text-white">
              {totalMembers > 0
                ? totalMembers.toLocaleString()
                : reportSummary?.totalMembers?.toLocaleString() || "N/A"}
            </div>
            <div className="text-xs md:text-sm text-white/70">
              Total Members
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="text-xl md:text-3xl font-bold text-secondary">
              {totalPitches > 0 ? totalPitches.toLocaleString() : "N/A"}
            </div>
            <div className="text-xs md:text-sm text-white/70">
              Total Pitches
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg md:rounded-xl p-3 md:p-6 mb-6 md:mb-8">
          <h2 className="text-sm md:text-lg font-semibold text-white mb-0.5 md:mb-1">
            PlayAway Platform Data (Our Data)
          </h2>
          <p className="text-xs md:text-sm text-white/60 mb-3 md:mb-4">
            Live statistics compared against GAA report totals
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-white/10 rounded-lg p-2.5 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-emerald-400">
                {playawayStats.totalActiveClubs}
              </div>
              <div className="text-[10px] md:text-xs text-white/70">
                Active Clubs
              </div>
              <div className="text-[10px] md:text-xs text-emerald-400 mt-0.5 md:mt-1">
                {reportSummary?.totalClubs
                  ? `${((playawayStats.totalActiveClubs / reportSummary.totalClubs) * 100).toFixed(1)}% of report`
                  : "N/A"}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-emerald-400">
                {playawayStats.verifiedClubs}
              </div>
              <div className="text-[10px] md:text-xs text-white/70">
                Verified Clubs
              </div>
              <div className="text-[10px] md:text-xs text-emerald-400 mt-0.5 md:mt-1">
                {playawayStats.totalActiveClubs > 0
                  ? `${((playawayStats.verifiedClubs / playawayStats.totalActiveClubs) * 100).toFixed(1)}% of PlayAway`
                  : "N/A"}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-emerald-400">
                {playawayStats.totalRegisteredPlayers.toLocaleString()}
              </div>
              <div className="text-[10px] md:text-xs text-white/70">
                Registered Users
              </div>
              <div className="text-[10px] md:text-xs text-emerald-400 mt-0.5 md:mt-1">
                {totalMembers > 0
                  ? `${((playawayStats.totalRegisteredPlayers / totalMembers) * 100).toFixed(2)}% of GAA`
                  : "N/A"}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-emerald-400">
                {playawayStats.playersTravelled.toLocaleString()}
              </div>
              <div className="text-[10px] md:text-xs text-white/70">
                Users Travelled
              </div>
              <div className="text-[10px] md:text-xs text-emerald-400 mt-0.5 md:mt-1">
                {playawayStats.totalRegisteredPlayers > 0
                  ? `${((playawayStats.playersTravelled / playawayStats.totalRegisteredPlayers) * 100).toFixed(1)}% of users`
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-base md:text-xl font-semibold text-white mb-3 md:mb-4">
          Province Breakdown
        </h2>
        <div className="space-y-2 md:space-y-4">
          {provinces.map((province) => (
            <div
              key={province.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedProvince(
                    expandedProvince === province.id ? null : province.id
                  )
                }
                className="w-full p-3 md:p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <h3 className="text-sm md:text-lg font-semibold text-white">
                    {province.name}
                  </h3>
                  <span className="text-xs md:text-sm text-white/60">
                    {province.counties.length} counties
                  </span>
                </div>
                <div className="flex items-center gap-2 md:gap-6">
                  <div className="text-right">
                    <div className="text-xs md:text-sm font-medium text-white">
                      {province.totalClubsGAA.toLocaleString()} clubs
                    </div>
                    <div className="text-[10px] md:text-xs text-white/60 hidden md:block">
                      {province.totalPopulation.toLocaleString()} population
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">
                    {expandedProvince === province.id ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedProvince === province.id && (
                <div className="border-t border-white/10 p-3 md:p-4">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                    <div>
                      <span className="text-white/60 block md:inline">
                        Members:
                      </span>{" "}
                      <span className="text-white font-medium">
                        {(
                          (province.totalYouthMalePlayers || 0) +
                          (province.totalYouthFemalePlayers || 0) +
                          (province.totalFullMalePlayers || 0) +
                          (province.totalFullFemalePlayers || 0) +
                          (province.totalNonPlayers || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60 block md:inline">
                        GAA:
                      </span>{" "}
                      <span className="text-white font-medium">
                        {province.totalClubsGAA}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60 block md:inline">
                        LGFA:
                      </span>{" "}
                      <span className="text-white font-medium">
                        {province.totalClubsLGFA}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-white/60">Camogie:</span>{" "}
                      <span className="text-white font-medium">
                        {province.totalClubsCamogie}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-white/60">Pitches:</span>{" "}
                      <span className="text-white font-medium">
                        {province.totalPitches}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                    <table className="w-full text-xs md:text-sm min-w-[500px] md:min-w-0">
                      <thead>
                        <tr className="text-white/60 border-b border-white/10">
                          <th className="text-left py-1.5 md:py-2 px-1 md:px-2">
                            County
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2 hidden md:table-cell">
                            Population
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2">
                            Members
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2">
                            GAA
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2 hidden md:table-cell">
                            LGFA
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2 hidden md:table-cell">
                            Camogie
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2">
                            Pitches
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2 hidden md:table-cell">
                            Teams
                          </th>
                          <th className="text-right py-1.5 md:py-2 px-1 md:px-2 hidden md:table-cell">
                            Avg Age
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {province.counties.map((county) => (
                          <tr
                            key={county.id}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-white font-medium">
                              {county.name}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80 hidden md:table-cell">
                              {county.populationTotal?.toLocaleString() || "-"}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80">
                              {(
                                (county.youthMalePlayers || 0) +
                                (county.youthFemalePlayers || 0) +
                                (county.fullMalePlayers || 0) +
                                (county.fullFemalePlayers || 0) +
                                (county.nonPlayers || 0)
                              ).toLocaleString() || "-"}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80">
                              {county.clubsGAA || "-"}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80 hidden md:table-cell">
                              {county.clubsLGFA || "-"}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80 hidden md:table-cell">
                              {county.clubsCamogie || "-"}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80">
                              {county.totalPitches || "-"}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80 hidden md:table-cell">
                              {county.totalTeams || "-"}
                            </td>
                            <td className="py-1.5 md:py-2 px-1 md:px-2 text-right text-white/80 hidden md:table-cell">
                              {county.averageAge?.toFixed(1) || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {reportSummary && (
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-white/5 rounded-lg md:rounded-xl">
            <h3 className="text-xs md:text-sm font-medium text-white/60 mb-1 md:mb-2">
              Report Source
            </h3>
            <p className="text-sm md:text-base text-white">
              {reportSummary.reportTitle}
              {reportSummary.reportSubtitle && (
                <span className="text-white/60 hidden md:inline">
                  {" "}
                  - {reportSummary.reportSubtitle}
                </span>
              )}
            </p>
            <p className="text-xs md:text-sm text-white/60 mt-1">
              Published:{" "}
              {new Date(reportSummary.publishedDate).toLocaleDateString(
                "en-IE",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
