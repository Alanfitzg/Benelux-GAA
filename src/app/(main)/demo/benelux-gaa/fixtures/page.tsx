"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import Image from "next/image";
import { Calendar, MapPin, Clock, AlertCircle } from "lucide-react";

const venueToClub: Record<string, { name: string; crest: string }> = {
  Leuven: {
    name: "Earls of Leuven",
    crest: "/club-crests/earls of leuven.png",
  },
  "Den Haag": { name: "CLG Den Haag", crest: "/club-crests/clg den haag.png" },
  "The Hague": { name: "CLG Den Haag", crest: "/club-crests/clg den haag.png" },
  Cologne: {
    name: "Cologne Celtics",
    crest: "/club-crests/logo-cologne_celtics.png",
  },
  Maastricht: {
    name: "Maastricht Gaels",
    crest: "/club-crests/maastricht gaels - red round - cropped.png",
  },
  Eindhoven: {
    name: "Eindhoven Shamrocks",
    crest: "/club-crests/eindhoven.webp",
  },
  Luxembourg: {
    name: "Luxembourg GAA",
    crest: "/club-crests/gaelic_sports_club_luxembourg_crest.jpg",
  },
  Amsterdam: { name: "Amsterdam GAA", crest: "/club-crests/amsterdam.png" },
};

interface Fixture {
  id: string;
  date: string;
  time?: string;
  competition: string;
  code: string;
  venue: string;
  homeTeam?: string;
  awayTeam?: string;
  round?: string;
  notes?: string;
  tbc?: boolean;
}

const fixtures2026: Fixture[] = [
  // February
  {
    id: "1",
    date: "2026-02-21",
    competition: "Football Development Tournament (11s)",
    code: "Football",
    venue: "Leuven",
  },
  {
    id: "2",
    date: "2026-02-28",
    competition: "Den Haag Invitational",
    code: "Invitational",
    venue: "Den Haag",
  },
  // March
  {
    id: "3",
    date: "2026-03-14",
    competition: "Cologne Invitational",
    code: "Invitational",
    venue: "Cologne",
  },
  {
    id: "4",
    date: "2026-03-21",
    competition: "Benelux Regional Football Championships (11s)",
    code: "Football",
    venue: "Maastricht",
    round: "Round 1",
  },
  {
    id: "5",
    date: "2026-03-28",
    competition: "Benelux Regional Camogie & Hurling Championships (7s/9s)",
    code: "Camogie/Hurling",
    venue: "The Hague",
  },
  // April
  {
    id: "6",
    date: "2026-04-11",
    competition: "German Cup",
    code: "Mixed",
    venue: "Germany",
    tbc: true,
  },
  {
    id: "7",
    date: "2026-04-18",
    competition: "Benelux Regional Football Championships (11s)",
    code: "Football",
    venue: "TBC",
    round: "Round 2",
    tbc: true,
  },
  // May
  {
    id: "8",
    date: "2026-05-02",
    competition: "European 'Feile' Youth Football Championships",
    code: "Youth Football",
    venue: "Maastricht",
  },
  {
    id: "9",
    date: "2026-05-02",
    competition: "European Camogie/Hurling (9s) Championships",
    code: "Camogie/Hurling",
    venue: "Eindhoven",
    round: "Round 1",
  },
  {
    id: "10",
    date: "2026-05-02",
    competition: "European Collegiate Football Championships",
    code: "Football",
    venue: "Leuven",
    tbc: true,
    notes: "Date TBC",
  },
  {
    id: "11",
    date: "2026-05-16",
    competition: "Benelux Regional Football Championships (11s)",
    code: "Football",
    venue: "TBC",
    round: "Round 3",
    tbc: true,
  },
  {
    id: "12",
    date: "2026-05-30",
    competition: "Luxembourg Invitational",
    code: "Invitational",
    venue: "Luxembourg",
    tbc: true,
    notes: "Possible - TBC",
  },
  {
    id: "13",
    date: "2026-05-30",
    competition: "Benelux 15s Football Championships",
    code: "15s",
    venue: "Maastricht",
    notes: "QFs (if required) or SFs",
  },
  // June
  {
    id: "14",
    date: "2026-06-13",
    competition: "Football Development Tournament (11s)",
    code: "Football",
    venue: "TBC",
    tbc: true,
  },
  {
    id: "15",
    date: "2026-06-13",
    competition: "Benelux 15s Football Championships",
    code: "15s",
    venue: "Maastricht",
    notes: "QFs (if required) or SFs",
  },
  {
    id: "16",
    date: "2026-06-20",
    competition: "Benelux 15s Football Championships",
    code: "15s",
    venue: "Maastricht",
    notes: "SFs or Finals - dates & times TBC after competition draw",
    tbc: true,
  },
  {
    id: "17",
    date: "2026-06-27",
    competition: "Benelux 15s Football Championships",
    code: "15s",
    venue: "Maastricht",
    notes: "SFs or Finals - dates & times TBC after competition draw",
    tbc: true,
  },
  // July
  {
    id: "18",
    date: "2026-07-04",
    competition: "Benelux 15s Hurling Championship",
    code: "15s",
    venue: "Maastricht",
    notes: "Semi-finals (if required)",
    tbc: true,
  },
  {
    id: "19",
    date: "2026-07-13",
    competition: "World Games",
    code: "Mixed",
    venue: "International",
    notes: "13-17 July",
  },
  // August
  {
    id: "20",
    date: "2026-08-22",
    competition: "Benelux 15s Football Championships",
    code: "15s",
    venue: "Maastricht",
    notes: "Finals",
  },
  {
    id: "21",
    date: "2026-08-29",
    competition: "Benelux 15s Camogie & Hurling Championships",
    code: "15s",
    venue: "Maastricht",
    notes: "Finals",
  },
  // September
  {
    id: "22",
    date: "2026-09-12",
    competition: "European Premier Football Championships (15s)",
    code: "Football",
    venue: "TBC",
    tbc: true,
  },
  {
    id: "23",
    date: "2026-09-19",
    competition: "European Premier Camogie/Hurling Championships (15s)",
    code: "Camogie/Hurling",
    venue: "TBC",
    tbc: true,
  },
  {
    id: "24",
    date: "2026-09-26",
    competition: "Benelux Regional Football Championships (11s)",
    code: "Football",
    venue: "Eindhoven",
    round: "Round 4",
  },
  // October
  {
    id: "25",
    date: "2026-10-03",
    competition: "European Camogie/Hurling (9s) Championships",
    code: "Camogie/Hurling",
    venue: "Amsterdam",
    round: "Round 4",
  },
  {
    id: "26",
    date: "2026-10-17",
    competition: "'Pan-Euros' European Football Championships (11s)",
    code: "Football",
    venue: "TBC",
    tbc: true,
  },
  // November
  {
    id: "27",
    date: "2026-11-07",
    competition: "Football Development Tournament (11s)",
    code: "Football",
    venue: "TBC",
    tbc: true,
  },
];

const competitionColors: Record<string, string> = {
  "Benelux Regional Football Championships (11s)": "border-l-[#2B9EB3]",
  "Benelux Regional Camogie & Hurling Championships (7s/9s)":
    "border-l-red-500",
  "Benelux 15s Football Championships": "border-l-[#1a3a4a]",
  "Benelux 15s Hurling Championship": "border-l-amber-600",
  "Benelux 15s Camogie & Hurling Championships": "border-l-red-600",
  "Football Development Tournament (11s)": "border-l-green-400",
  "European Camogie/Hurling (9s) Championships": "border-l-blue-500",
  "European 'Feile' Youth Football Championships": "border-l-purple-500",
  "European Collegiate Football Championships": "border-l-purple-400",
  "European Premier Football Championships (15s)": "border-l-purple-600",
  "European Premier Camogie/Hurling Championships (15s)": "border-l-purple-700",
  "'Pan-Euros' European Football Championships (11s)": "border-l-indigo-500",
  "World Games": "border-l-yellow-500",
  "Den Haag Invitational": "border-l-orange-400",
  "Cologne Invitational": "border-l-orange-500",
  "Luxembourg Invitational": "border-l-orange-600",
  "German Cup": "border-l-gray-600",
};

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

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
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
