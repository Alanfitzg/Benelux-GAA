"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { Trophy, ChevronDown, ChevronUp, Crown } from "lucide-react";

interface Competition {
  id: string;
  name: string;
  description: string;
  reigningChampion: string;
  runnerUp?: string;
  color: string;
}

interface CompetitionGroup {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  competitions: Competition[];
}

const competitionGroups: CompetitionGroup[] = [
  {
    id: "benelux",
    title: "BENELUX",
    subtitle: "Regional 11-a-side Football Championships",
    bgColor: "bg-green-600",
    competitions: [
      {
        id: "mens-11s",
        name: "Men's Championship",
        description: "4-round regional league",
        reigningChampion: "Eindhoven A",
        runnerUp: "Brussels A",
        color: "text-green-600",
      },
      {
        id: "ladies-11s",
        name: "Ladies Championship",
        description: "4-round regional league",
        reigningChampion: "Brussels A",
        runnerUp: "Luxembourg A",
        color: "text-green-600",
      },
    ],
  },
  {
    id: "football-15s",
    title: "15s Football",
    subtitle: "Full-sided Championships",
    bgColor: "bg-indigo-600",
    competitions: [
      {
        id: "mens-15s",
        name: "Men's Championship",
        description: "Pool stage + knockout rounds",
        reigningChampion: "Amsterdam",
        runnerUp: "Luxembourg",
        color: "text-indigo-600",
      },
      {
        id: "ladies-15s",
        name: "Ladies Championship",
        description: "Pool stage + knockout rounds",
        reigningChampion: "Belgium/Groningen",
        runnerUp: "Amsterdam/Luxembourg",
        color: "text-indigo-600",
      },
    ],
  },
  {
    id: "hurling",
    title: "Hurling",
    subtitle: "Small-sided and Full-sided Championships",
    bgColor: "bg-amber-600",
    competitions: [
      {
        id: "hurling-9s",
        name: "9s Championship",
        description: "Regional group stage",
        reigningChampion: "Amsterdam",
        runnerUp: "Brussels B",
        color: "text-amber-600",
      },
      {
        id: "hurling-15s",
        name: "15s Championship",
        description: "Round robin format",
        reigningChampion: "Amsterdam",
        runnerUp: "Luxembourg",
        color: "text-amber-600",
      },
    ],
  },
  {
    id: "camogie",
    title: "Camogie",
    subtitle: "7/9-a-side Championships",
    bgColor: "bg-purple-600",
    competitions: [
      {
        id: "camogie-7s",
        name: "7/9s Championship",
        description: "Regional group stage",
        reigningChampion: "Luxembourg A",
        runnerUp: "Brussels A",
        color: "text-purple-600",
      },
    ],
  },
];

function CompetitionGroupCard({ group }: { group: CompetitionGroup }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full ${group.bgColor} text-white p-3 sm:p-4 flex items-center justify-between hover:opacity-95 transition-opacity`}
      >
        <div className="text-left">
          <h2 className="text-base sm:text-lg font-bold">{group.title}</h2>
          <span className="text-xs sm:text-sm opacity-80">
            {group.subtitle}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="opacity-80" />
        ) : (
          <ChevronDown size={20} className="opacity-80" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 sm:p-4">
          <div className="space-y-3">
            {group.competitions.map((comp) => (
              <div key={comp.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-sm sm:text-base ${comp.color}`}
                    >
                      {comp.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {comp.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Crown size={14} className="text-yellow-500" />
                      <span className="text-xs text-gray-500">Reigning</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                      {comp.reigningChampion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StandingsPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("benelux");

  const filteredGroups = competitionGroups.filter(
    (g) => g.id === selectedGroup
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header currentPage="Standings" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <Trophy
              size={36}
              className="hidden sm:block mx-auto text-[#f4c430] mb-4 sm:w-12 sm:h-12"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              <EditableText
                pageKey="standings"
                contentKey="title"
                defaultValue="League Standings"
                maxLength={30}
              />
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
              <EditableText
                pageKey="standings"
                contentKey="subtitle"
                defaultValue="Benelux GAA competitions for the 2026 season"
                maxLength={100}
              />
            </p>
          </div>

          {/* Competition Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {competitionGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedGroup === group.id
                    ? `${group.bgColor} text-white shadow-md`
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>

          {/* Season Not Started Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 mb-6 text-center">
            <p className="text-amber-800 font-semibold text-base sm:text-lg">
              The 2026 season has not yet started
            </p>
            <p className="text-amber-600 text-sm mt-1">
              Standings will appear here once the league gets underway
            </p>
          </div>

          {/* Reigning Champions Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
              2025 Champions
            </h2>

            {filteredGroups.map((group) => (
              <CompetitionGroupCard key={group.id} group={group} />
            ))}
          </div>

          {/* BENELUX Explanation */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
              What is BENELUX?
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              BENELUX is the flagship 11-a-side regional football league,
              running throughout the season with 4 rounds hosted across
              different venues. It&apos;s the main competition for clubs in
              Belgium, Netherlands, and Luxembourg, featuring both Men&apos;s
              and Ladies divisions with Championship, Shield, and Plate tiers.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
