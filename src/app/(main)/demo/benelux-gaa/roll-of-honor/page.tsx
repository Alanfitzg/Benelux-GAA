"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { Trophy, Medal } from "lucide-react";

interface HonorRecord {
  year: number;
  competition: string;
  winner: string;
  runnerUp: string;
  notPlayed?: boolean;
}

// Men's Football 11s Records (2007-2025)
const mensFootball11sRecords: HonorRecord[] = [
  {
    year: 2025,
    competition: "Championship",
    winner: "Eindhoven A",
    runnerUp: "Brussels A",
  },
  {
    year: 2025,
    competition: "Shield",
    winner: "Leuven A",
    runnerUp: "Hague A",
  },
  {
    year: 2025,
    competition: "Plate",
    winner: "Groningen A",
    runnerUp: "Luxembourg B",
  },
  {
    year: 2024,
    competition: "Championship",
    winner: "Eindhoven A",
    runnerUp: "Leuven A",
  },
  {
    year: 2024,
    competition: "Shield",
    winner: "Amsterdam",
    runnerUp: "Nijmegen",
  },
  {
    year: 2024,
    competition: "Plate",
    winner: "Cologne",
    runnerUp: "Groningen",
  },
  {
    year: 2023,
    competition: "Championship",
    winner: "Amsterdam A",
    runnerUp: "Luxembourg A",
  },
  {
    year: 2023,
    competition: "Shield",
    winner: "Hague A",
    runnerUp: "Leuven A",
  },
  {
    year: 2023,
    competition: "Plate",
    winner: "Belgium B",
    runnerUp: "Amsterdam B",
  },
  {
    year: 2022,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "Belgium A",
  },
  {
    year: 2022,
    competition: "Shield",
    winner: "Nijmegen",
    runnerUp: "Maastricht",
  },
  {
    year: 2022,
    competition: "Plate",
    winner: "Leuven",
    runnerUp: "Luxembourg B",
  },
  {
    year: 2021,
    competition: "Championship",
    winner: "",
    runnerUp: "",
    notPlayed: true,
  },
  {
    year: 2020,
    competition: "Championship",
    winner: "",
    runnerUp: "",
    notPlayed: true,
  },
  {
    year: 2019,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "",
  },
  { year: 2019, competition: "Shield", winner: "", runnerUp: "" },
  {
    year: 2018,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "",
  },
  { year: 2018, competition: "Shield", winner: "", runnerUp: "" },
  {
    year: 2017,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "Belgium A",
  },
  {
    year: 2017,
    competition: "Shield",
    winner: "Eindhoven/Maastricht",
    runnerUp: "Leuven",
  },
  { year: 2016, competition: "Championship", winner: "", runnerUp: "" },
  { year: 2016, competition: "Shield", winner: "", runnerUp: "" },
  { year: 2015, competition: "Championship", winner: "", runnerUp: "" },
  { year: 2015, competition: "Shield", winner: "", runnerUp: "" },
  { year: 2014, competition: "Championship", winner: "", runnerUp: "" },
  { year: 2014, competition: "Shield", winner: "", runnerUp: "" },
  {
    year: 2013,
    competition: "Championship",
    winner: "Belgium A",
    runnerUp: "Amsterdam A",
  },
  {
    year: 2013,
    competition: "Shield",
    winner: "Dusseldorf",
    runnerUp: "Belgium B",
  },
  {
    year: 2012,
    competition: "Championship",
    winner: "Amsterdam A",
    runnerUp: "Luxembourg A",
  },
  {
    year: 2012,
    competition: "Shield",
    winner: "Amsterdam B",
    runnerUp: "Belgium B",
  },
  {
    year: 2011,
    competition: "Championship",
    winner: "Hague",
    runnerUp: "Amsterdam",
  },
  {
    year: 2010,
    competition: "Championship",
    winner: "Belgium A",
    runnerUp: "Hague",
  },
  {
    year: 2009,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "Hague",
  },
  {
    year: 2008,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Luxembourg",
  },
  {
    year: 2007,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Hague",
  },
].filter((r) => r.winner || r.notPlayed);

// Men's Football 15s Records
const mensFootball15sRecords: HonorRecord[] = [
  {
    year: 2025,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
  {
    year: 2024,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
  {
    year: 2023,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
  {
    year: 2022,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
  {
    year: 2020,
    competition: "Championship",
    winner: "",
    runnerUp: "",
    notPlayed: true,
  },
  {
    year: 2019,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
  {
    year: 2018,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
  {
    year: 2017,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
];

// Ladies Football 9s Records (2011-2019)
const ladiesFootball9sRecords: HonorRecord[] = [
  {
    year: 2019,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2018,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2017,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2016,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2015,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2014,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2013,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2012,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2011,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
];

// Ladies Football 9s Records (2022-2023)
const ladiesFootball9s2022Records: HonorRecord[] = [
  {
    year: 2023,
    competition: "Championship",
    winner: "Belgium A",
    runnerUp: "Amsterdam A",
  },
  { year: 2023, competition: "Shield", winner: "Nijmegen", runnerUp: "Leuven" },
  {
    year: 2023,
    competition: "Plate",
    winner: "Hamburg",
    runnerUp: "Eindhoven",
  },
  {
    year: 2022,
    competition: "Championship",
    winner: "Belgium A",
    runnerUp: "Amsterdam A",
  },
  {
    year: 2022,
    competition: "Shield",
    winner: "Leuven",
    runnerUp: "Hague/Eindhoven/Maastricht",
  },
];

// Ladies Football 11s Records (2024-2025)
const ladiesFootball11sRecords: HonorRecord[] = [
  {
    year: 2025,
    competition: "Championship",
    winner: "Brussels A",
    runnerUp: "Luxembourg A",
  },
  {
    year: 2025,
    competition: "Shield",
    winner: "Nijmegen",
    runnerUp: "Groningen A",
  },
  { year: 2025, competition: "Plate", winner: "Hague", runnerUp: "Hamburg" },
  {
    year: 2024,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Groningen",
  },
  { year: 2024, competition: "Shield", winner: "Nijmegen", runnerUp: "Hague" },
];

// Ladies Football 15s Records
const ladiesFootball15sRecords: HonorRecord[] = [
  {
    year: 2024,
    competition: "Championship",
    winner: "Belgium/Groningen",
    runnerUp: "Amsterdam/Luxembourg",
  },
];

// Hurling 9s Records
const hurling9sRecords: HonorRecord[] = [
  {
    year: 2025,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Brussels B",
  },
  {
    year: 2024,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
  {
    year: 2023,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Amsterdam/Maastricht",
  },
  {
    year: 2022,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Amsterdam/Maastricht",
  },
];

// Hurling 15s Records
const hurling15sRecords: HonorRecord[] = [
  {
    year: 2024,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
];

// Camogie 9s Records
const camogie9sRecords: HonorRecord[] = [
  {
    year: 2022,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Luxembourg/Hague",
  },
];

// Camogie 7/9s Records (2024-2025)
const camogie7sRecords: HonorRecord[] = [
  {
    year: 2025,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "Brussels A",
  },
  {
    year: 2024,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "Belgium A",
  },
];

type SportCategory = "mensFootball" | "ladiesFootball" | "hurling" | "camogie";
type TeamSize = "9s" | "11s" | "15s" | "7s";

interface SportConfig {
  label: string;
  availableSizes: TeamSize[];
  records: Record<string, HonorRecord[]>;
}

const sportConfig: Record<SportCategory, SportConfig> = {
  mensFootball: {
    label: "Men's Football",
    availableSizes: ["11s", "15s"],
    records: {
      "11s": mensFootball11sRecords,
      "15s": mensFootball15sRecords,
    },
  },
  ladiesFootball: {
    label: "Ladies Football",
    availableSizes: ["9s", "11s", "15s"],
    records: {
      "9s": [...ladiesFootball9s2022Records, ...ladiesFootball9sRecords],
      "11s": ladiesFootball11sRecords,
      "15s": ladiesFootball15sRecords,
    },
  },
  hurling: {
    label: "Hurling",
    availableSizes: ["9s", "15s"],
    records: {
      "9s": hurling9sRecords,
      "15s": hurling15sRecords,
    },
  },
  camogie: {
    label: "Camogie",
    availableSizes: ["7s"],
    records: {
      "7s": [...camogie7sRecords, ...camogie9sRecords],
    },
  },
};

export default function RollOfHonorPage() {
  const [selectedSport, setSelectedSport] =
    useState<SportCategory>("mensFootball");
  const [selectedSize, setSelectedSize] = useState<TeamSize>("11s");

  const currentSportConfig = sportConfig[selectedSport];
  const availableSizes = currentSportConfig.availableSizes;

  // Auto-select first available size when sport changes
  const effectiveSize = availableSizes.includes(selectedSize)
    ? selectedSize
    : availableSizes[0];

  const currentRecords = currentSportConfig.records[effectiveSize] || [];

  // Group records by year
  const groupedByYear: Record<number, HonorRecord[]> = {};
  currentRecords.forEach((record) => {
    if (!groupedByYear[record.year]) {
      groupedByYear[record.year] = [];
    }
    groupedByYear[record.year].push(record);
  });

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Count championships for current code
  const championshipCount = currentRecords.filter(
    (r) => r.competition === "Championship" && !r.notPlayed && r.winner
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">
      {/* Textured Gradient Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 0%, rgba(43, 158, 179, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 30%, rgba(26, 58, 74, 0.06) 0%, transparent 40%),
            radial-gradient(ellipse at 20% 70%, rgba(43, 158, 179, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 90%, rgba(26, 58, 74, 0.05) 0%, transparent 40%),
            linear-gradient(180deg, rgba(241, 245, 249, 1) 0%, rgba(226, 232, 240, 1) 100%)
          `,
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Header currentPage="Roll of Honor" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Trophy
              size={32}
              className="mx-auto text-[#2B9EB3] mb-2 sm:mb-3 sm:w-10 sm:h-10"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              <EditableText
                pageKey="roll-of-honor"
                contentKey="title"
                defaultValue="Roll of Honor"
                maxLength={30}
              />
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              <EditableText
                pageKey="roll-of-honor"
                contentKey="subtitle"
                defaultValue="Benelux GAA champions through the years (2007-2025)"
                maxLength={100}
              />
            </p>
          </div>

          {/* Sport & Size Selectors */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-center gap-3">
              {/* Sport Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedSport}
                  onChange={(e) =>
                    setSelectedSport(e.target.value as SportCategory)
                  }
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent cursor-pointer min-w-[160px]"
                >
                  {(Object.keys(sportConfig) as SportCategory[]).map(
                    (sport) => (
                      <option key={sport} value={sport}>
                        {sportConfig[sport].label}
                      </option>
                    )
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="h-4 w-4"
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
                </div>
              </div>

              {/* Team Size Dropdown */}
              <div className="relative">
                <select
                  value={effectiveSize}
                  onChange={(e) => setSelectedSize(e.target.value as TeamSize)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent cursor-pointer min-w-[100px]"
                >
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size === "7s" ? "7/9s" : size}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="h-4 w-4"
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
                </div>
              </div>
            </div>
          </div>

          {/* Championship Count */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-[#2B9EB3]/10 text-[#1a3a4a] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <Trophy
                size={16}
                className="text-[#2B9EB3] sm:w-[18px] sm:h-[18px]"
              />
              <span className="font-semibold text-sm sm:text-base">
                {championshipCount} Championships
              </span>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-gray-50 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="bg-[#1a3a4a] text-white text-xs sm:text-sm">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold w-14 sm:w-20">
                    Year
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">
                    Competition
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">
                    Winner
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold hidden sm:table-cell">
                    Runner-up
                  </th>
                </tr>
              </thead>
              <tbody>
                {years.map((year, yearIdx) =>
                  groupedByYear[year].map((record, recordIdx) => {
                    const isFirstOfYear = recordIdx === 0;
                    const rowCount = groupedByYear[year].length;

                    return (
                      <tr
                        key={`${year}-${record.competition}-${recordIdx}`}
                        className={`border-b border-gray-200 ${yearIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        {isFirstOfYear && (
                          <td
                            rowSpan={rowCount}
                            className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-gray-900 align-top border-r border-gray-200 text-sm sm:text-base"
                          >
                            {year}
                          </td>
                        )}
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          {record.notPlayed ? (
                            <span className="text-gray-400 italic text-xs sm:text-sm">
                              Not played (COVID-19)
                            </span>
                          ) : (
                            <span
                              className={`text-xs sm:text-sm font-medium ${
                                record.competition === "Championship"
                                  ? "text-[#1a3a4a]"
                                  : "text-gray-500"
                              }`}
                            >
                              {record.competition}
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          {!record.notPlayed && record.winner && (
                            <div className="flex items-center gap-1 sm:gap-2">
                              {record.competition === "Championship" && (
                                <Trophy
                                  size={12}
                                  className="text-yellow-500 flex-shrink-0 sm:w-[14px] sm:h-[14px]"
                                />
                              )}
                              <span
                                className={`font-medium text-xs sm:text-sm ${record.competition === "Championship" ? "text-gray-900" : "text-gray-700"}`}
                              >
                                {record.winner}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-xs sm:text-sm hidden sm:table-cell">
                          {!record.notPlayed && record.runnerUp && (
                            <div className="flex items-center gap-2">
                              <Medal
                                size={12}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <span>{record.runnerUp}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 justify-center text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Trophy
                size={12}
                className="text-yellow-500 sm:w-[14px] sm:h-[14px]"
              />
              <span>Championship (Top tier)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Shield = 2nd tier</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Plate = 3rd tier</span>
            </div>
          </div>

          {/* Notes */}
          <div className="text-center text-xs text-gray-400 mt-4 space-y-1">
            <p>* Names with &quot;/&quot; denote joint winners or runners-up</p>
            <p>* Brussels (previously Belgium GAA)</p>
          </div>

          {/* Notable Records */}
          <div className="mt-10 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-400" />
              Notable Records
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Belgium/Brussels Ladies Dominance */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  13
                </div>
                <div className="text-sm font-semibold mb-1">
                  Ladies Football Championships
                </div>
                <div className="text-xs text-white/70">
                  Belgium/Brussels Ladies (2011-2019, 2022-2025) - The most
                  dominant team in Benelux GAA history
                </div>
              </div>

              {/* Amsterdam 15s Streak */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">7</div>
                <div className="text-sm font-semibold mb-1">
                  Men&apos;s 15s Championships in a Row
                </div>
                <div className="text-xs text-white/70">
                  Amsterdam (2017-2025, excl. COVID) - Undefeated in the
                  15-a-side code
                </div>
              </div>

              {/* Luxembourg Men's 11s */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">5</div>
                <div className="text-sm font-semibold mb-1">
                  Men&apos;s 11s Championships
                </div>
                <div className="text-xs text-white/70">
                  Luxembourg (2007, 2009, 2017-2019) - Most titles in the
                  flagship 11-a-side code
                </div>
              </div>

              {/* Longest Running Competition */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  2007
                </div>
                <div className="text-sm font-semibold mb-1">
                  First Benelux Championship
                </div>
                <div className="text-xs text-white/70">
                  Luxembourg defeated Hague in the inaugural Men&apos;s Football
                  final
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
