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

const mensFootballRecords: HonorRecord[] = [
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
    winner: "Leuven",
    runnerUp: "Luxembourg B",
  },
  {
    year: 2022,
    competition: "Plate",
    winner: "Nijmegen",
    runnerUp: "Maastricht",
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
  {
    year: 2018,
    competition: "Championship",
    winner: "Luxembourg A",
    runnerUp: "",
  },
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
];

const lgfaRecords: HonorRecord[] = [
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
    runnerUp: "Hague + Eindhoven/Maastricht",
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
    winner: "Holland Ladies",
    runnerUp: "",
  },
  {
    year: 2018,
    competition: "Championship",
    winner: "Belgium A",
    runnerUp: "",
  },
  {
    year: 2017,
    competition: "Championship",
    winner: "Holland Ladies A",
    runnerUp: "Belgium A",
  },
  { year: 2016, competition: "Championship", winner: "Belgium", runnerUp: "" },
  { year: 2015, competition: "Championship", winner: "Belgium", runnerUp: "" },
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
];

const hurlingRecords: HonorRecord[] = [
  {
    year: 2023,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Amsterdam/Maastricht",
  },
];

const camogieRecords: HonorRecord[] = [
  {
    year: 2023,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Luxembourg/Hague",
  },
];

const mens15sRecords: HonorRecord[] = [
  {
    year: 2023,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Belgium",
  },
  {
    year: 2022,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Luxembourg",
  },
  {
    year: 2019,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Belgium",
  },
  {
    year: 2018,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Luxembourg",
  },
  {
    year: 2017,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Belgium",
  },
];

const lgfa15sRecords: HonorRecord[] = [
  {
    year: 2023,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2022,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Holland Ladies",
  },
  {
    year: 2019,
    competition: "Championship",
    winner: "Holland Ladies",
    runnerUp: "Belgium",
  },
];

const hurling15sRecords: HonorRecord[] = [
  {
    year: 2023,
    competition: "Championship",
    winner: "Luxembourg",
    runnerUp: "Brussels",
  },
];

const camogie15sRecords: HonorRecord[] = [
  {
    year: 2023,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Amsterdam",
  },
];

type CodeType =
  | "mens"
  | "mens15s"
  | "lgfa"
  | "lgfa15s"
  | "hurling"
  | "hurling15s"
  | "camogie"
  | "camogie15s";

const codeConfig: Record<CodeType, { label: string; records: HonorRecord[] }> =
  {
    mens: { label: "Men's Football 7s", records: mensFootballRecords },
    mens15s: { label: "Men's Football 15s", records: mens15sRecords },
    lgfa: { label: "Ladies Football 7s", records: lgfaRecords },
    lgfa15s: { label: "Ladies Football 15s", records: lgfa15sRecords },
    hurling: { label: "Hurling 7s", records: hurlingRecords },
    hurling15s: { label: "Hurling 15s", records: hurling15sRecords },
    camogie: { label: "Camogie 7s", records: camogieRecords },
    camogie15s: { label: "Camogie 15s", records: camogie15sRecords },
  };

export default function RollOfHonorPage() {
  const [selectedCode, setSelectedCode] = useState<CodeType>("mens");

  const currentRecords = codeConfig[selectedCode].records;

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
                defaultValue="Benelux GAA champions through the years"
                maxLength={100}
              />
            </p>
          </div>

          {/* Code Tabs - Organized by Sport */}
          <div className="mb-6 sm:mb-8 space-y-3">
            {/* Football Row */}
            <div className="flex justify-center">
              <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedCode("mens")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "mens"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Men&apos;s 7s
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCode("mens15s")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "mens15s"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Men&apos;s 15s
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCode("lgfa")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "lgfa"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Ladies 7s
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCode("lgfa15s")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "lgfa15s"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Ladies 15s
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 uppercase tracking-wider">
              Football
            </p>

            {/* Hurling/Camogie Row */}
            <div className="flex justify-center">
              <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedCode("hurling")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "hurling"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Hurling 7s
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCode("hurling15s")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "hurling15s"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Hurling 15s
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCode("camogie")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "camogie"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Camogie 7s
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCode("camogie15s")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCode === "camogie15s"
                      ? "bg-[#1a3a4a] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Camogie 15s
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 uppercase tracking-wider">
              Hurling &amp; Camogie
            </p>
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
                              Not played
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
