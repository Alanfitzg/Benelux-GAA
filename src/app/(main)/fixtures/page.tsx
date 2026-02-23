"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import Image from "next/image";
import { Calendar, MapPin, Clock, AlertCircle } from "lucide-react";
import { fixtures2026, venueToClub, competitionColors } from "../data/fixtures";
import type { Fixture } from "../data/fixtures";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function FixturesPage() {
  const [selectedCode, setSelectedCode] = useState<string>("all");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");

  const codes = [
    "all",
    "Football",
    "Camogie/Hurling",
    "Hurling",
    "Youth Football",
    "Mixed",
    "Invitational",
    "15s",
  ];
  const competitions = [
    "all",
    ...new Set(fixtures2026.map((f) => f.competition)),
  ];

  let filteredFixtures = fixtures2026;
  if (selectedCode !== "all") {
    filteredFixtures = filteredFixtures.filter((f) => f.code === selectedCode);
  }
  if (selectedCompetition !== "all") {
    filteredFixtures = filteredFixtures.filter(
      (f) => f.competition === selectedCompetition
    );
  }

  const groupedByMonth: Record<string, Fixture[]> = {};
  filteredFixtures.forEach((fixture) => {
    const monthYear = getMonthYear(fixture.date);
    if (!groupedByMonth[monthYear]) {
      groupedByMonth[monthYear] = [];
    }
    groupedByMonth[monthYear].push(fixture);
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header currentPage="Fixtures" />

      <main className="flex-1 pt-20 pb-8 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              <EditableText
                pageKey="fixtures"
                contentKey="title"
                defaultValue="2026 Fixtures Calendar"
                maxLength={40}
              />
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="fixtures"
                contentKey="subtitle"
                defaultValue="Complete schedule of Benelux GAA fixtures, tournaments, and competitions."
                maxLength={120}
              />
            </p>
          </div>

          {/* TBC Notice */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 flex items-start gap-2 sm:gap-3 shadow-md">
            <AlertCircle
              className="text-red-500 flex-shrink-0 mt-0.5"
              size={18}
            />
            <div>
              <p className="text-red-800 font-semibold text-sm sm:text-base">
                Some fixtures are still to be confirmed
              </p>
              <p className="text-red-600 text-xs sm:text-sm">
                Events marked with a red indicator have venues or dates that are
                TBC (to be confirmed).
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 sm:mb-8">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm text-slate-500 mb-2 font-medium">
                  Code
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {codes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedCode(code)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedCode === code
                          ? "bg-[#1a3a4a] text-white shadow-md"
                          : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {code === "all" ? "All Codes" : code}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-slate-500 mb-2 font-medium">
                  Competition
                </label>
                <select
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] bg-white text-sm sm:text-base"
                >
                  {competitions.map((comp) => (
                    <option key={comp} value={comp}>
                      {comp === "all" ? "All Competitions" : comp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fixtures List */}
          {Object.entries(groupedByMonth).map(([month, monthFixtures]) => (
            <div key={month} className="mb-6 sm:mb-10">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-[#2B9EB3] sm:w-5 sm:h-5" />
                {month}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {monthFixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    className={`bg-white rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-200 border-l-4 ${
                      fixture.tbc
                        ? "border-l-red-500"
                        : competitionColors[fixture.competition] ||
                          "border-l-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Date */}
                      <div className="flex-shrink-0 sm:w-32">
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2">
                          {formatDate(fixture.date)}
                          {fixture.tbc && (
                            <span
                              className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 shadow-sm"
                              title="TBC"
                            />
                          )}
                        </div>
                        {fixture.time && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={10} className="sm:w-3 sm:h-3" />
                            {fixture.time}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                            {fixture.competition}
                          </span>
                          {fixture.round && (
                            <span className="text-slate-500 text-xs sm:text-sm flex-shrink-0">
                              - {fixture.round}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin
                              size={12}
                              className={`sm:w-3.5 sm:h-3.5 ${fixture.tbc && fixture.venue === "TBC" ? "text-red-500" : "text-[#2B9EB3]"}`}
                            />
                            <span
                              className={
                                fixture.venue === "TBC"
                                  ? "text-red-500 font-medium"
                                  : ""
                              }
                            >
                              {fixture.venue}
                            </span>
                          </span>
                          <span className="px-1.5 sm:px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-600 shadow-sm">
                            {fixture.code}
                          </span>
                        </div>
                        {fixture.notes && (
                          <div className="text-xs text-slate-500 mt-1 italic">
                            {fixture.notes}
                          </div>
                        )}
                      </div>

                      {/* Host Club Crest */}
                      {venueToClub[fixture.venue] && (
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 relative">
                          <Image
                            src={venueToClub[fixture.venue].crest}
                            alt={venueToClub[fixture.venue].name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summer Break Notice */}
          {selectedCode === "all" && selectedCompetition === "all" && (
            <div className="mb-6 sm:mb-10 bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-center shadow-md">
              <p className="text-amber-800 font-semibold text-sm sm:text-base">
                Summer Break: 18 July - 15 August 2026
              </p>
              <p className="text-amber-600 text-xs sm:text-sm">
                No fixtures scheduled during this period
              </p>
            </div>
          )}

          {filteredFixtures.length === 0 && (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-lg">
              <Calendar
                size={40}
                className="mx-auto text-slate-300 mb-3 sm:mb-4 sm:w-12 sm:h-12"
              />
              <p className="text-slate-500 text-sm sm:text-base">
                No fixtures found matching your filters.
              </p>
            </div>
          )}

          {/* Download / Calendar Sync */}
          <div className="mt-8 sm:mt-10 bg-[#1a3a4a] rounded-xl p-5 sm:p-6 md:p-8 text-center shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              Add to Your Calendar
            </h3>
            <p className="text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Never miss a match - sync the Benelux GAA fixtures with your
              calendar.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                type="button"
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#2B9EB3] text-white rounded-lg font-semibold hover:bg-[#238a9c] transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Download iCal
              </button>
              <button
                type="button"
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Google Calendar
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
