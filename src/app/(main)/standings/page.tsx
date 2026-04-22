"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { Trophy, Medal, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import BreaghMensChampionship from "./BreaghMensChampionship";
import BreaghLadiesChampionship from "./BreaghLadiesChampionship";

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
      className={`rounded-xl overflow-hidden shadow-sm border-2 ${section.borderColor} mb-4 sm:mb-6`}
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

          <div className="mt-3 sm:mt-4 text-center text-gray-400 text-xs sm:text-sm">
            Standings will be updated as the season progresses
          </div>
        </div>
      )}
    </div>
  );
}

const defaultSections = competitionSections;

export default function StandingsPage() {
  const [sections, setSections] =
    useState<CompetitionSection[]>(defaultSections);
  const [selectedCompetition, setSelectedCompetition] =
    useState<string>("mens-championship");

  useEffect(() => {
    fetch("/api/admin/site-data?key=standings")
      .then((res) => res.json())
      .then((result) => {
        if (result.data && Array.isArray(result.data)) {
          setSections(result.data);
        }
      })
      .catch(() => {});
  }, []);

  const visibleSections = sections.filter((s) => s.id !== "football-11s");
  const filteredSections = visibleSections.filter(
    (s) => s.id === selectedCompetition
  );
  const showMensChampionship = selectedCompetition === "mens-championship";
  const showLadiesChampionship = selectedCompetition === "lgfa-championship";

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <Header currentPage="Standings" />

      {/* Hero Banner */}
      <div className="bg-[#1a3a4a] pt-6 sm:pt-20 md:pt-24 pb-8 sm:pb-14 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B9EB3]/10 via-transparent to-black/20" />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
            <div>
              <p className="text-[#2B9EB3] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-1 sm:mb-2">
                Benelux GAA
              </p>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                <EditableText
                  pageKey="standings"
                  contentKey="title"
                  defaultValue="League Standings"
                  maxLength={30}
                />
              </h1>
              <p className="text-white/40 text-xs sm:text-sm mt-1 hidden sm:block">
                <EditableText
                  pageKey="standings"
                  contentKey="subtitle"
                  defaultValue="Current Benelux GAA league tables for the 2026 season."
                  maxLength={100}
                />
              </p>
            </div>
            <a
              href="https://breaghrecruitment.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-3 group shrink-0"
            >
              <span className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-medium">
                Sponsored by
              </span>
              <Image
                src="/sponsors/breagh-white.png"
                alt="Breagh Recruitment"
                width={160}
                height={50}
                className="object-contain h-7 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                unoptimized
              />
            </a>
          </div>
        </div>
      </div>

      <main className="flex-1 -mt-4 sm:-mt-6 pb-8 sm:pb-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* Competition Filter - overlapping hero */}
          <div className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5">
            <div className="flex gap-2 sm:flex-wrap sm:gap-2">
              <button
                type="button"
                onClick={() => setSelectedCompetition("mens-championship")}
                className={`flex-1 sm:flex-initial px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-base font-bold tracking-tight transition-all border-2 text-center ${
                  selectedCompetition === "mens-championship"
                    ? "bg-[#1a3a4a] text-white border-[#1a3a4a] shadow-lg"
                    : "bg-white text-[#1a3a4a] border-[#1a3a4a]/30 hover:border-[#1a3a4a] hover:shadow-md"
                }`}
              >
                GAA Championship
              </button>
              <button
                type="button"
                onClick={() => setSelectedCompetition("lgfa-championship")}
                className={`flex-1 sm:flex-initial px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-base font-bold tracking-tight transition-all border-2 text-center ${
                  selectedCompetition === "lgfa-championship"
                    ? "bg-[#1a3a4a] text-white border-[#1a3a4a] shadow-lg"
                    : "bg-white text-[#1a3a4a] border-[#1a3a4a]/30 hover:border-[#1a3a4a] hover:shadow-md"
                }`}
              >
                LGFA Championship
              </button>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Other Competitions
              </p>
              {/* Mobile: native dropdown to save space */}
              <select
                value={
                  visibleSections.some((s) => s.id === selectedCompetition)
                    ? selectedCompetition
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) setSelectedCompetition(e.target.value);
                }}
                className="sm:hidden w-full px-3 py-2 rounded-lg text-sm border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3]/40 focus:border-[#2B9EB3]"
              >
                <option value="" disabled>
                  Select a competition…
                </option>
                {visibleSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.shortName}
                  </option>
                ))}
              </select>
              {/* Desktop: inline pills */}
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {visibleSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setSelectedCompetition(section.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCompetition === section.id
                        ? `${section.bgColor} text-white shadow-sm`
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {section.shortName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(showMensChampionship || showLadiesChampionship) && (
            <p className="text-center text-[11px] sm:text-xs text-gray-500 italic mb-5 sm:mb-6 px-4">
              <span className="sm:hidden">
                Data by{" "}
                <span className="font-semibold not-italic text-[#1a3a4a]">
                  PitchPerfect
                </span>
              </span>
              <span className="hidden sm:inline">
                Data was recorded and provided by the{" "}
                <span className="font-semibold not-italic text-[#1a3a4a]">
                  PitchPerfect
                </span>{" "}
                results and fixtures app
              </span>
            </p>
          )}

          {showMensChampionship && <BreaghMensChampionship />}
          {showLadiesChampionship && <BreaghLadiesChampionship />}

          {/* Competition Sections */}
          {!showMensChampionship &&
            !showLadiesChampionship &&
            filteredSections.map((section) => (
              <CompetitionSectionComponent key={section.id} section={section} />
            ))}

          {/* Legend */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mt-6 sm:mt-8">
            <h3 className="font-semibold text-[#1a3a4a] mb-3 sm:mb-4 text-sm sm:text-base">
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
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-600 rounded mt-0.5 sm:mt-1 flex-shrink-0" />
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
