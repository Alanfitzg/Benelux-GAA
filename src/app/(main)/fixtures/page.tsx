"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import Image from "next/image";
import { Calendar, MapPin, Clock, ChevronDown } from "lucide-react";
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
  const [allFixtures, setAllFixtures] = useState<Fixture[]>(fixtures2026);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string>("all");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/site-data?key=fixtures")
      .then((res) => res.json())
      .then((result) => {
        if (result.data && Array.isArray(result.data)) {
          setAllFixtures(result.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    ...new Set(allFixtures.map((f) => f.competition)),
  ];

  let filteredFixtures = allFixtures;
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
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <Header currentPage="Fixtures" />

      {/* Hero Banner */}
      <div className="bg-[#1a3a4a] pt-16 sm:pt-20 md:pt-24 pb-10 sm:pb-14 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B9EB3]/10 via-transparent to-black/20" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
            <div>
              <p className="text-[#2B9EB3] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-1 sm:mb-2">
                Benelux GAA
              </p>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                <EditableText
                  pageKey="fixtures"
                  contentKey="title"
                  defaultValue="2026 Fixtures Calendar"
                  maxLength={40}
                />
              </h1>
            </div>
            <a
              href="https://breagh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-3 group shrink-0"
            >
              <span className="text-white/30 text-[8px] sm:text-[10px] uppercase tracking-[0.15em] font-medium">
                Sponsored by
              </span>
              <Image
                src="/sponsors/breagh-white.png"
                alt="Breagh Recruitment"
                width={160}
                height={50}
                className="object-contain h-5 sm:h-7 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                unoptimized
              />
            </a>
          </div>
        </div>
      </div>

      <main className="flex-1 -mt-4 sm:-mt-6 pb-8 sm:pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Filters - overlapping hero */}
          <div className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {codes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedCode(code)}
                      className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        selectedCode === code
                          ? "bg-[#1a3a4a] text-white shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {code === "all" ? "All Codes" : code}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:w-52 relative">
                <select
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="w-full appearance-none px-3 sm:px-4 py-2 sm:py-2.5 pr-9 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent bg-gray-50 text-sm font-medium text-gray-700"
                >
                  {competitions.map((comp) => (
                    <option key={comp} value={comp}>
                      {comp === "all" ? "All Competitions" : comp}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Fixtures List */}
          {Object.entries(groupedByMonth).map(([month, monthFixtures]) => (
            <div key={month} className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2B9EB3] rounded-lg flex items-center justify-center shadow-sm">
                  <Calendar
                    size={16}
                    className="text-white sm:w-[18px] sm:h-[18px]"
                  />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#1a3a4a]">
                  {month}
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  ({monthFixtures.length})
                </span>
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                {monthFixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${
                      fixture.tbc
                        ? "border-l-red-500"
                        : competitionColors[fixture.competition] ||
                          "border-l-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Date */}
                      <div className="flex-shrink-0 sm:w-32">
                        <div className="text-xs sm:text-sm font-semibold text-[#1a3a4a] flex items-center gap-2">
                          {formatDate(fixture.date)}
                          {fixture.tbc && (
                            <span
                              className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse"
                              title="TBC"
                            />
                          )}
                        </div>
                        {fixture.time && (
                          <div className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} className="sm:w-3 sm:h-3" />
                            {fixture.time}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                          <span className="font-semibold text-[#1a3a4a] text-sm sm:text-base truncate">
                            {fixture.competition}
                          </span>
                          {fixture.round && (
                            <span className="text-gray-400 text-xs sm:text-sm flex-shrink-0">
                              - {fixture.round}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
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
                          <span className="px-1.5 sm:px-2 py-0.5 bg-[#f0f2f5] rounded text-[11px] sm:text-xs font-medium text-gray-500">
                            {fixture.code}
                          </span>
                        </div>
                        {fixture.notes && (
                          <div className="text-[11px] sm:text-xs text-gray-400 mt-1 italic">
                            {fixture.notes}
                          </div>
                        )}
                      </div>

                      {/* Host Club Crest */}
                      {venueToClub[fixture.venue] && (
                        <div className="flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 relative opacity-80">
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
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-amber-800 font-semibold text-sm sm:text-base">
                Summer Break: 18 July - 15 August 2026
              </p>
              <p className="text-amber-600/80 text-xs sm:text-sm">
                No fixtures scheduled during this period
              </p>
            </div>
          )}

          {filteredFixtures.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-sm">
              <Calendar
                size={40}
                className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-12 sm:h-12"
              />
              <p className="text-gray-400 text-sm sm:text-base font-medium">
                No fixtures found matching your filters.
              </p>
            </div>
          )}

          {/* Download / Calendar Sync */}
          <div className="mt-8 sm:mt-10 bg-[#1a3a4a] rounded-2xl p-5 sm:p-6 md:p-8 text-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2B9EB3]/15 via-transparent to-transparent" />
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                Add to Your Calendar
              </h3>
              <p className="text-white/50 mb-4 sm:mb-6 text-sm sm:text-base">
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
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all text-sm sm:text-base"
                >
                  Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
