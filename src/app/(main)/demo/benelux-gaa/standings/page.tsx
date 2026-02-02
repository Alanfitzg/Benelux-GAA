"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import {
  Trophy,
  Medal,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
} from "lucide-react";

interface CompetitionSection {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subtitle: string;
  status: "upcoming" | "in_progress" | "complete";
  nextFixture?: string;
  pools?: { name: string; teams: string[] }[];
  teams?: string[];
}

const competitionSections: CompetitionSection[] = [
  {
    id: "football-11s",
    name: "Regional Football Championships (11s)",
    shortName: "Football 11s",
    color: "text-green-700",
    bgColor: "bg-green-600",
    borderColor: "border-green-600",
    subtitle: "4 rounds throughout the season",
    status: "upcoming",
    nextFixture: "Round 1 - March 21, 2026 (Maastricht)",
    teams: [
      "Amsterdam GAA",
      "Brussels GAA",
      "Luxembourg GAA",
      "Den Haag GAA",
      "Leuven Gaels",
      "Maastricht Gaels",
    ],
  },
  {
    id: "football-15s",
    name: "15s Football Championships",
    shortName: "Football 15s",
    color: "text-indigo-700",
    bgColor: "bg-indigo-600",
    borderColor: "border-indigo-600",
    subtitle: "Pool stage followed by knockout rounds",
    status: "upcoming",
    nextFixture: "QFs/SFs - May 30, 2026 (Maastricht)",
    pools: [
      {
        name: "Pool A",
        teams: ["Amsterdam GAA", "Brussels GAA", "Leuven Gaels"],
      },
      {
        name: "Pool B",
        teams: ["Luxembourg GAA", "Den Haag GAA", "Maastricht Gaels"],
      },
    ],
  },
  {
    id: "camogie-hurling-79s",
    name: "Regional Camogie & Hurling Championships (7s/9s)",
    shortName: "Camogie/Hurling 7s/9s",
    color: "text-amber-700",
    bgColor: "bg-amber-600",
    borderColor: "border-amber-600",
    subtitle: "Group stage format",
    status: "upcoming",
    nextFixture: "March 28, 2026 (The Hague)",
    teams: [
      "Brussels GAA",
      "Amsterdam GAA",
      "Luxembourg GAA",
      "Den Haag GAA",
      "Eindhoven GAA",
    ],
  },
  {
    id: "hurling-15s",
    name: "15s Hurling Championship",
    shortName: "Hurling 15s",
    color: "text-amber-800",
    bgColor: "bg-amber-700",
    borderColor: "border-amber-700",
    subtitle: "Round robin format - Finals in August",
    status: "upcoming",
    nextFixture: "Semi-finals - July 4, 2026 (Maastricht)",
    teams: ["Brussels GAA", "Luxembourg GAA", "Amsterdam/Maastricht"],
  },
  {
    id: "camogie-15s",
    name: "15s Camogie & Hurling Championships",
    shortName: "Camogie 15s",
    color: "text-purple-700",
    bgColor: "bg-purple-600",
    borderColor: "border-purple-600",
    subtitle: "Round robin format - Finals in August",
    status: "upcoming",
    nextFixture: "Finals - August 29, 2026 (Maastricht)",
    teams: ["Belgium", "Amsterdam GAA", "Luxembourg/Hague"],
  },
];

function CompetitionSectionComponent({
  section,
}: {
  section: CompetitionSection;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg border-2 ${section.borderColor} mb-4 sm:mb-6`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full ${section.bgColor} text-white p-3 sm:p-4 flex items-center justify-between hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Trophy size={18} className="sm:w-[22px] sm:h-[22px]" />
          <div className="text-left">
            <h2 className="text-sm sm:text-lg font-bold">{section.name}</h2>
            <span className="text-xs sm:text-sm opacity-80">
              {section.subtitle}
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="sm:w-[22px] sm:h-[22px]" />
        ) : (
          <ChevronDown size={18} className="sm:w-[22px] sm:h-[22px]" />
        )}
      </button>

      {isExpanded && (
        <div className="bg-white p-3 sm:p-5">
          {/* Next Fixture */}
          {section.nextFixture && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 flex items-start sm:items-center gap-2 sm:gap-3">
              <Calendar
                size={16}
                className="text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0 sm:w-5 sm:h-5"
              />
              <div>
                <span className="text-xs sm:text-sm font-medium text-blue-800">
                  Next Fixture:
                </span>
                <span className="text-xs sm:text-sm text-blue-700 ml-1 sm:ml-2">
                  {section.nextFixture}
                </span>
              </div>
            </div>
          )}

          {/* Pools or Teams */}
          {section.pools ? (
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              {section.pools.map((pool) => (
                <div
                  key={pool.name}
                  className="bg-gray-50 rounded-lg p-3 sm:p-4"
                >
                  <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Medal size={14} className="text-[#2B9EB3] sm:w-4 sm:h-4" />
                    {pool.name}
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {pool.teams.map((team, idx) => (
                      <li
                        key={team}
                        className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base"
                      >
                        <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </span>
                        {team}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : section.teams ? (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                Participating Teams
              </h3>
              <ul className="grid sm:grid-cols-2 gap-1.5 sm:gap-2">
                {section.teams.map((team, idx) => (
                  <li
                    key={team}
                    className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base"
                  >
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    {team}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Status Message */}
          <div className="mt-3 sm:mt-4 text-center text-gray-500 text-xs sm:text-sm">
            Standings will be updated as the season progresses
          </div>
        </div>
      )}
    </div>
  );
}

export default function StandingsPage() {
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");

  const filteredSections =
    selectedCompetition === "all"
      ? competitionSections
      : competitionSections.filter((s) => s.id === selectedCompetition);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header currentPage="Standings" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <Trophy
              size={36}
              className="mx-auto text-[#f4c430] mb-3 sm:mb-4 sm:w-12 sm:h-12"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              <EditableText
                pageKey="standings"
                contentKey="title"
                defaultValue="League Standings"
                maxLength={30}
              />
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="standings"
                contentKey="subtitle"
                defaultValue="Current Benelux GAA league tables for the 2026 season."
                maxLength={100}
              />
            </p>
          </div>

          {/* Competition Filter */}
          <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 text-gray-700">
              <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="font-semibold text-xs sm:text-sm">
                Filter by Competition
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSelectedCompetition("all")}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedCompetition === "all"
                    ? "bg-[#1a3a4a] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Competitions
              </button>
              {competitionSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedCompetition(section.id)}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    selectedCompetition === section.id
                      ? `${section.bgColor} text-white shadow-md`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {section.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Season Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 text-center">
            <p className="text-amber-800 font-medium text-sm sm:text-base">
              The 2026 season begins in February
            </p>
            <p className="text-amber-600 text-xs sm:text-sm mt-1">
              Standings will be updated after each round of fixtures
            </p>
          </div>

          {/* Competition Sections */}
          {filteredSections.map((section) => (
            <CompetitionSectionComponent key={section.id} section={section} />
          ))}

          {/* Legend */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mt-6 sm:mt-8">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
              Competition Structure
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-600 rounded mt-0.5 sm:mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-800">
                    11s Football
                  </span>
                  <p>Regional league format with 4 rounds</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-indigo-600 rounded mt-0.5 sm:mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-800">
                    15s Football
                  </span>
                  <p>Pool stage followed by knockout rounds</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-600 rounded mt-0.5 sm:mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-800">
                    7s/9s Camogie & Hurling
                  </span>
                  <p>Regional group stage format</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-purple-600 rounded mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-800">
                    15s Camogie & Hurling
                  </span>
                  <p>Round robin with finals in August</p>
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
