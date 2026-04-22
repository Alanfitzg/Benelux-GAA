"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";

interface GroupRow {
  rank: number;
  name: string;
  crest?: string;
  fallbackLabel?: string;
  fallbackBg?: string;
  p: number;
  w: number;
  d: number;
  l: number;
  sf: number;
  sa: number;
  diff: number;
  pts: number;
}

interface Match {
  stage: "Cup Final";
  teamA: { name: string; score: string; points: number };
  teamB: { name: string; score: string; points: number };
  status: "final";
  winner?: "A" | "B";
}

interface FinalRank {
  rank: number;
  name: string;
  crest?: string;
  fallbackLabel?: string;
  fallbackBg?: string;
  note: string;
}

const groupStage: GroupRow[] = [
  {
    rank: 1,
    name: "Brussels",
    crest: "/club-crests/benelux-brussels.png",
    p: 4,
    w: 4,
    d: 0,
    l: 0,
    sf: 59,
    sa: 8,
    diff: 51,
    pts: 12,
  },
  {
    rank: 2,
    name: "Eindhoven",
    crest: "/club-crests/benelux-eindhoven-shamrocks.png",
    p: 4,
    w: 2,
    d: 1,
    l: 1,
    sf: 30,
    sa: 31,
    diff: -1,
    pts: 7,
  },
  {
    rank: 3,
    name: "Amsterdam",
    crest: "/club-crests/benelux-amsterdam-gac.png",
    p: 4,
    w: 1,
    d: 1,
    l: 2,
    sf: 17,
    sa: 32,
    diff: -15,
    pts: 4,
  },
  {
    rank: 4,
    name: "Den Haag",
    crest: "/club-crests/benelux-den-haag.png",
    p: 4,
    w: 1,
    d: 1,
    l: 2,
    sf: 22,
    sa: 34,
    diff: -12,
    pts: 4,
  },
  {
    rank: 5,
    name: "Paris",
    fallbackLabel: "PAR",
    fallbackBg: "bg-red-600",
    p: 4,
    w: 0,
    d: 1,
    l: 3,
    sf: 18,
    sa: 41,
    diff: -23,
    pts: 1,
  },
];

const matches: Match[] = [
  {
    stage: "Cup Final",
    teamA: { name: "Brussels", score: "9-03", points: 30 },
    teamB: { name: "Eindhoven", score: "0-02", points: 2 },
    status: "final",
    winner: "A",
  },
];

const finalRanking: FinalRank[] = [
  {
    rank: 1,
    name: "Brussels",
    crest: "/club-crests/benelux-brussels.png",
    note: "Cup Champions",
  },
  {
    rank: 2,
    name: "Eindhoven",
    crest: "/club-crests/benelux-eindhoven-shamrocks.png",
    note: "Cup Runners-up",
  },
  {
    rank: 3,
    name: "Amsterdam",
    crest: "/club-crests/benelux-amsterdam-gac.png",
    note: "3rd on group standings",
  },
  {
    rank: 4,
    name: "Den Haag",
    crest: "/club-crests/benelux-den-haag.png",
    note: "4th on group standings",
  },
  {
    rank: 5,
    name: "Paris",
    fallbackLabel: "PAR",
    fallbackBg: "bg-red-600",
    note: "5th on group standings",
  },
];

function TeamBadge({
  crest,
  name,
  fallbackLabel,
  fallbackBg,
  size = "md",
}: {
  crest?: string;
  name: string;
  fallbackLabel?: string;
  fallbackBg?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-6 h-6 sm:w-7 sm:h-7" : "w-7 h-7 sm:w-9 sm:h-9";
  if (crest) {
    return (
      <div className={`${dim} relative flex-shrink-0`}>
        <Image
          src={crest}
          alt={name}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }
  return (
    <div
      className={`${dim} flex-shrink-0 flex items-center justify-center rounded ${fallbackBg ?? "bg-gray-500"} text-white text-[9px] sm:text-[10px] font-bold tracking-tight`}
    >
      {fallbackLabel ?? name.slice(0, 3).toUpperCase()}
    </div>
  );
}

const rankBadgeColors: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-gray-300 text-gray-800",
  3: "bg-amber-600 text-white",
};

function FinalRankingCard({ row }: { row: FinalRank }) {
  const badge = rankBadgeColors[row.rank] ?? "bg-gray-100 text-gray-600";
  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5">
      <div
        className={`${badge} w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0`}
      >
        {row.rank}
      </div>
      <TeamBadge
        crest={row.crest}
        name={row.name}
        fallbackLabel={row.fallbackLabel}
        fallbackBg={row.fallbackBg}
      />
      <div className="min-w-0 flex-1">
        <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
          {row.name}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 truncate">
          {row.note}
        </div>
      </div>
      {row.rank === 1 && (
        <Trophy size={16} className="text-yellow-500 flex-shrink-0" />
      )}
    </div>
  );
}

function MatchRow({ match }: { match: Match }) {
  const winnerA = match.winner === "A";
  const winnerB = match.winner === "B";
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2.5 border-b border-gray-100 last:border-b-0">
      <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 w-14 sm:w-20 flex-shrink-0">
        {match.stage}
      </div>
      <div
        className={`flex-1 flex items-center justify-end gap-2 min-w-0 ${winnerA ? "font-semibold text-gray-900" : "text-gray-500"}`}
      >
        <span className="text-xs sm:text-sm truncate">{match.teamA.name}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm tabular-nums flex-shrink-0">
        <span className={winnerA ? "font-bold text-gray-900" : "text-gray-500"}>
          {match.teamA.points}
        </span>
        <span className="text-gray-300">·</span>
        <span className={winnerB ? "font-bold text-gray-900" : "text-gray-500"}>
          {match.teamB.points}
        </span>
      </div>
      <div
        className={`flex-1 flex items-center gap-2 min-w-0 ${winnerB ? "font-semibold text-gray-900" : "text-gray-500"}`}
      >
        <span className="text-xs sm:text-sm truncate">{match.teamB.name}</span>
      </div>
    </div>
  );
}

export default function BreaghCamogieChampionship() {
  return (
    <div className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#2B9EB3]/30 overflow-hidden">
      <div className="bg-gradient-to-r from-[#1a3a4a] to-[#0d2530] text-white p-3 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[#2B9EB3] text-[9px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-0.5 sm:mb-1">
              Breagh Sweepstakes
            </p>
            <h2 className="text-base sm:text-2xl font-extrabold tracking-tight leading-tight">
              2026 Regional Camogie Championship
            </h2>
            <p className="text-white/60 text-[10px] sm:text-sm mt-0.5 sm:mt-1">
              The Hague · 28 March · 7s format
            </p>
          </div>
          <a
            href="https://breaghrecruitment.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
          >
            <span className="hidden sm:inline text-white/40 text-[10px] uppercase tracking-[0.15em]">
              Sponsored by
            </span>
            <Image
              src="/sponsors/breagh-white.png"
              alt="Breagh Recruitment"
              width={140}
              height={44}
              className="object-contain h-4 sm:h-8 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
              unoptimized
            />
          </a>
        </div>
      </div>

      {/* Final Rankings */}
      <div className="p-3 sm:p-5 border-b border-gray-200 bg-gray-50/40">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 sm:mb-3">
          Final Rankings
        </h3>
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-2.5">
          {finalRanking.map((row) => (
            <FinalRankingCard key={row.rank} row={row} />
          ))}
        </div>
      </div>

      {/* Knockouts */}
      <div className="p-3 sm:p-5 border-b border-gray-200">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 sm:mb-3">
          Knockouts
        </h3>
        <div>
          {matches.map((m, i) => (
            <MatchRow key={i} match={m} />
          ))}
        </div>
      </div>

      {/* Group Stage */}
      <div className="p-3 sm:p-5">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 sm:mb-3">
          Group Stage
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-1.5 sm:px-2 py-2 text-center text-[10px] sm:text-xs font-bold uppercase text-gray-500">
                  #
                </th>
                <th className="px-1 py-2 w-8"></th>
                <th className="px-2 py-2 text-[10px] sm:text-xs font-bold uppercase text-gray-500">
                  Team
                </th>
                {["P", "W", "D", "L", "SF", "SA", "Diff", "Pts"].map((h) => (
                  <th
                    key={h}
                    className={`px-1 sm:px-2 py-2 text-center text-[10px] sm:text-xs font-bold uppercase text-gray-500 tabular-nums ${
                      h === "SF" || h === "SA" ? "hidden sm:table-cell" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupStage.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-1.5 sm:px-2 py-2 sm:py-2.5 text-center text-xs sm:text-sm font-semibold text-gray-700">
                    {row.rank}
                  </td>
                  <td className="px-1 py-2 sm:py-2.5">
                    <TeamBadge
                      crest={row.crest}
                      name={row.name}
                      fallbackLabel={row.fallbackLabel}
                      fallbackBg={row.fallbackBg}
                      size="sm"
                    />
                  </td>
                  <td className="px-2 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center text-xs sm:text-sm text-gray-700 tabular-nums">
                    {row.p}
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center text-xs sm:text-sm text-green-700 font-semibold tabular-nums">
                    {row.w}
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center text-xs sm:text-sm text-blue-600 tabular-nums">
                    {row.d}
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center text-xs sm:text-sm text-red-600 tabular-nums">
                    {row.l}
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center text-xs sm:text-sm text-gray-700 tabular-nums hidden sm:table-cell">
                    {row.sf}
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center text-xs sm:text-sm text-gray-700 tabular-nums hidden sm:table-cell">
                    {row.sa}
                  </td>
                  <td
                    className={`px-1 sm:px-2 py-2 text-center text-xs sm:text-sm tabular-nums ${row.diff >= 0 ? "text-green-700" : "text-red-600"}`}
                  >
                    {row.diff >= 0 ? `+${row.diff}` : row.diff}
                  </td>
                  <td className="px-1 sm:px-2 py-2 text-center text-sm sm:text-base font-bold text-[#1a3a4a] tabular-nums">
                    {row.pts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 px-3 sm:px-5 py-3 text-[11px] sm:text-xs text-gray-500 leading-relaxed border-t border-gray-200">
        <span className="font-semibold text-gray-700">Format:</span> Single-day
        tournament. Round-robin group stage (3 points per win, 1 per draw), then
        Cup Final. 3rd/4th playoff not played — final positions taken from group
        standings. Paris hosted as guests due to limited camogie in France.
      </div>
    </div>
  );
}
