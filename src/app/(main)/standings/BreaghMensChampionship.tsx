"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";

type Tier = "CUP" | "SHIELD" | "PLATE";

interface TeamRow {
  rank: number;
  name: string;
  crest: string;
  rounds: (number | null)[];
  total: number;
  tier: Tier;
}

const rounds = [
  { label: "R1", host: "Maastricht", date: "21 Mar" },
  { label: "R2", host: "Frankfurt", date: "18 Apr" },
  { label: "R3", host: "Luxembourg", date: "30 May" },
  { label: "R4", host: "Eindhoven", date: "26 Sept" },
];

const teams: TeamRow[] = [
  {
    rank: 1,
    name: "Amsterdam A",
    crest: "/club-crests/benelux-amsterdam-gac.png",
    rounds: [20, 25, null, null],
    total: 45,
    tier: "CUP",
  },
  {
    rank: 2,
    name: "Luxembourg A",
    crest: "/club-crests/benelux-luxembourg.png",
    rounds: [25, 13, null, null],
    total: 38,
    tier: "CUP",
  },
  {
    rank: 3,
    name: "Eindhoven A",
    crest: "/club-crests/benelux-eindhoven-shamrocks.png",
    rounds: [16, 11, null, null],
    total: 27,
    tier: "CUP",
  },
  {
    rank: 4,
    name: "Brussels A",
    crest: "/club-crests/benelux-brussels.png",
    rounds: [9, 16, null, null],
    total: 25,
    tier: "CUP",
  },
  {
    rank: 5,
    name: "Frankfurt A",
    crest: "/club-crests/benelux-frankfurt.png",
    rounds: [5, 20, null, null],
    total: 25,
    tier: "SHIELD",
  },
  {
    rank: 6,
    name: "Leuven A",
    crest: "/club-crests/benelux-earls-of-leuven.png",
    rounds: [11, 10, null, null],
    total: 21,
    tier: "SHIELD",
  },
  {
    rank: 7,
    name: "Maastricht/Nijmegen",
    crest: "/club-crests/benelux-maastricht-gaels.png",
    rounds: [13, 4.9, null, null],
    total: 17.9,
    tier: "SHIELD",
  },
  {
    rank: 8,
    name: "Hague",
    crest: "/club-crests/benelux-den-haag.png",
    rounds: [5.7, 8.5, null, null],
    total: 14.2,
    tier: "SHIELD",
  },
  {
    rank: 9,
    name: "Groningen A",
    crest: "/club-crests/benelux-groningen-gaels.png",
    rounds: [10, null, null, null],
    total: 10,
    tier: "PLATE",
  },
  {
    rank: 10,
    name: "Brussels B",
    crest: "/club-crests/benelux-brussels.png",
    rounds: [6, 2.8, null, null],
    total: 8.8,
    tier: "PLATE",
  },
  {
    rank: 11,
    name: "Luxembourg B",
    crest: "/club-crests/benelux-luxembourg.png",
    rounds: [4.2, 3.6, null, null],
    total: 7.8,
    tier: "PLATE",
  },
  {
    rank: 12,
    name: "Eindhoven B",
    crest: "/club-crests/benelux-eindhoven-shamrocks.png",
    rounds: [4, 2.8, null, null],
    total: 6.8,
    tier: "PLATE",
  },
  {
    rank: 13,
    name: "Leuven B",
    crest: "/club-crests/benelux-earls-of-leuven.png",
    rounds: [2.8, 2.4, null, null],
    total: 5.2,
    tier: "PLATE",
  },
  {
    rank: 14,
    name: "Frankfurt B",
    crest: "/club-crests/benelux-frankfurt.png",
    rounds: [null, 2.7, null, null],
    total: 2.7,
    tier: "PLATE",
  },
  {
    rank: 15,
    name: "Aachen",
    crest: "/club-crests/benelux-aachen-gaels.png",
    rounds: [2.3, null, null, null],
    total: 2.3,
    tier: "PLATE",
  },
  {
    rank: 16,
    name: "Dusseldorf",
    crest: "/club-crests/benelux-dusseldorf.png",
    rounds: [0, 1.8, null, null],
    total: 1.8,
    tier: "PLATE",
  },
  {
    rank: 16,
    name: "Hamburg",
    crest: "/club-crests/benelux-hamburg-gaa.png",
    rounds: [null, 1.8, null, null],
    total: 1.8,
    tier: "PLATE",
  },
  {
    rank: 18,
    name: "Frankfurt C",
    crest: "/club-crests/benelux-frankfurt.png",
    rounds: [null, 1.4, null, null],
    total: 1.4,
    tier: "PLATE",
  },
  {
    rank: 19,
    name: "Cologne",
    crest: "/club-crests/benelux-cologne-celts.png",
    rounds: [0, null, null, null],
    total: 0,
    tier: "PLATE",
  },
];

const lastPlayedRoundIndex = 1;

const tierStyles: Record<
  Tier,
  { bar: string; label: string; row: string; accent: string }
> = {
  CUP: {
    bar: "bg-yellow-400",
    label: "text-yellow-900",
    row: "bg-yellow-50",
    accent: "border-l-yellow-400",
  },
  SHIELD: {
    bar: "bg-orange-400",
    label: "text-orange-900",
    row: "bg-orange-50/60",
    accent: "border-l-orange-400",
  },
  PLATE: {
    bar: "bg-emerald-500",
    label: "text-emerald-900",
    row: "bg-emerald-50/50",
    accent: "border-l-emerald-500",
  },
};

const tierDescriptions: Record<Tier, string> = {
  CUP: "Cup contenders — top 4",
  SHIELD: "Shield tier — 5th to 8th",
  PLATE: "Plate tier — 9th and below",
};

function formatPoints(pts: number | null): string {
  if (pts === null) return "–";
  if (pts === 0) return "0";
  return Number.isInteger(pts) ? String(pts) : pts.toFixed(1);
}

function TeamRowView({
  team,
  roundsPlayed,
}: {
  team: TeamRow;
  roundsPlayed: number;
}) {
  const styles = tierStyles[team.tier];
  return (
    <tr
      className={`${styles.row} border-b border-gray-100 hover:bg-white transition-colors`}
    >
      <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 w-8 sm:w-10">
        {team.rank}
      </td>
      <td className="px-2 py-2 sm:py-3 w-8 sm:w-10">
        <div className="w-7 h-7 sm:w-9 sm:h-9 relative">
          <Image
            src={team.crest}
            alt={team.name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </td>
      <td className="px-2 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
        {team.name}
      </td>
      {team.rounds.map((pts, i) => {
        const isLastPlayed = i === roundsPlayed - 1;
        const isFuture = i >= roundsPlayed;
        return (
          <td
            key={i}
            className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm ${
              isFuture ? "text-gray-300 hidden sm:table-cell" : "text-gray-700"
            } ${isLastPlayed ? "bg-white/60 font-semibold" : ""}`}
          >
            {formatPoints(pts)}
          </td>
        );
      })}
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-bold text-[#1a3a4a] whitespace-nowrap">
        {formatPoints(team.total)}
      </td>
    </tr>
  );
}

function TierBand({ tier }: { tier: Tier }) {
  const styles = tierStyles[tier];
  return (
    <tr>
      <td colSpan={3 + rounds.length + 1} className="p-0">
        <div className={`${styles.bar} px-3 py-1.5 flex items-center gap-2`}>
          <Trophy size={14} className={styles.label} />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${styles.label}`}
          >
            {tier}
          </span>
          <span
            className={`text-xs ${styles.label} opacity-80 hidden sm:inline`}
          >
            {tierDescriptions[tier]}
          </span>
        </div>
      </td>
    </tr>
  );
}

export default function BreaghMensChampionship() {
  const tiers: Tier[] = ["CUP", "SHIELD", "PLATE"];

  return (
    <div className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#2B9EB3]/30 overflow-hidden">
      <div className="bg-gradient-to-r from-[#1a3a4a] to-[#0d2530] text-white p-3 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[#2B9EB3] text-[9px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-0.5 sm:mb-1">
              Breagh Sweepstakes
            </p>
            <h2 className="text-base sm:text-2xl font-extrabold tracking-tight leading-tight">
              2026 Men&apos;s Football Championship
            </h2>
            <p className="text-white/60 text-[10px] sm:text-sm mt-0.5 sm:mt-1">
              After R{lastPlayedRoundIndex + 1} · {lastPlayedRoundIndex + 1} of{" "}
              {rounds.length} rounds played
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

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-bold uppercase text-gray-500 tracking-wider">
                #
              </th>
              <th className="px-2 py-2 text-[10px] sm:text-xs font-bold uppercase text-gray-500 tracking-wider"></th>
              <th className="px-2 py-2 text-[10px] sm:text-xs font-bold uppercase text-gray-500 tracking-wider">
                Team
              </th>
              {rounds.map((r, i) => {
                const isFuture = i > lastPlayedRoundIndex;
                return (
                  <th
                    key={r.label}
                    className={`px-2 sm:px-3 py-2 text-center whitespace-nowrap ${
                      isFuture ? "hidden sm:table-cell" : ""
                    }`}
                  >
                    <div className="text-sm sm:text-base font-extrabold text-[#1a3a4a] tracking-wide">
                      {r.label}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-medium text-gray-500 normal-case mt-0.5">
                      {r.host}
                    </div>
                  </th>
                );
              })}
              <th className="px-2 sm:px-4 py-2 text-center text-[10px] sm:text-xs font-bold uppercase text-gray-500 tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.flatMap((tier) => {
              const tierTeams = teams.filter((t) => t.tier === tier);
              if (tierTeams.length === 0) return [];
              return [
                <TierBand key={`band-${tier}`} tier={tier} />,
                ...tierTeams.map((team) => (
                  <TeamRowView
                    key={`${tier}-${team.rank}-${team.name}`}
                    team={team}
                    roundsPlayed={lastPlayedRoundIndex + 1}
                  />
                )),
              ];
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-3 sm:px-5 py-3 text-[11px] sm:text-xs text-gray-500 leading-relaxed border-t border-gray-200">
        <span className="font-semibold text-gray-700">Pro-rata scoring:</span>{" "}
        combined teams and squads below full strength receive scaled points
        based on player numbers. Teams with fewer than 3 players score 0.
      </div>
    </div>
  );
}
