"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import {
  Trophy,
  Medal,
  Sparkles,
  MousePointerClick,
  ChevronDown,
} from "lucide-react";

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

const ladiesFootball15sRecords: HonorRecord[] = [
  {
    year: 2024,
    competition: "Championship",
    winner: "Belgium/Groningen",
    runnerUp: "Amsterdam/Luxembourg",
  },
];

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

const hurling15sRecords: HonorRecord[] = [
  {
    year: 2024,
    competition: "Championship",
    winner: "Amsterdam",
    runnerUp: "Luxembourg",
  },
];

const camogie9sRecords: HonorRecord[] = [
  {
    year: 2022,
    competition: "Championship",
    winner: "Belgium",
    runnerUp: "Luxembourg/Hague",
  },
];

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
    records: { "11s": mensFootball11sRecords, "15s": mensFootball15sRecords },
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
    records: { "9s": hurling9sRecords, "15s": hurling15sRecords },
  },
  camogie: {
    label: "Camogie",
    availableSizes: ["7s"],
    records: { "7s": [...camogie7sRecords, ...camogie9sRecords] },
  },
};

interface FactCard {
  id: number;
  teaser: string;
  stat: string;
  title: string;
  subtitle: string;
  images: { src: string; alt: string; size: number }[];
}

const factCards: FactCard[] = [
  {
    id: 0,
    teaser: "Which club has won 13 Ladies Football titles across all formats?",
    stat: "13",
    title: "Most Dominant Team in European History",
    subtitle: "Belgium/Brussels LGFA",
    images: [
      {
        src: "/club-crests/benelux-brussels.png",
        alt: "Brussels GAA",
        size: 72,
      },
    ],
  },
  {
    id: 1,
    teaser:
      "Which club holds 7 consecutive Men\u2019s Football 15s Championships?",
    stat: "7",
    title: "Consecutive Men\u2019s Football 15s Titles",
    subtitle: "Amsterdam GAC (2017-2025)",
    images: [
      {
        src: "/club-crests/benelux-amsterdam-gac.png",
        alt: "Amsterdam GAC",
        size: 72,
      },
    ],
  },
  {
    id: 2,
    teaser:
      "Which club dominated the early era with 5 Men\u2019s Football 11s titles?",
    stat: "5",
    title: "Men\u2019s Football 11s Titles",
    subtitle: "Luxembourg GAA (2007-2019)",
    images: [
      {
        src: "/club-crests/benelux-luxembourg.png",
        alt: "Luxembourg GAA",
        size: 72,
      },
    ],
  },
  {
    id: 3,
    teaser:
      "Which two clubs contested the very first Benelux Championship final?",
    stat: "2007",
    title: "First Men\u2019s Football Championship",
    subtitle: "Luxembourg v Hague",
    images: [
      {
        src: "/club-crests/benelux-luxembourg.png",
        alt: "Luxembourg GAA",
        size: 52,
      },
      {
        src: "/club-crests/benelux-den-haag.png",
        alt: "Den Haag GAA",
        size: 52,
      },
    ],
  },
];

function FlipCard({
  card,
  revealed,
  onReveal,
}: {
  card: FactCard;
  revealed: boolean;
  onReveal: () => void;
  index: number;
}) {
  return (
    <div
      className="group [perspective:1000px] cursor-pointer"
      onClick={!revealed ? onReveal : undefined}
    >
      <div
        className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${revealed ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* Front - Teaser */}
        <div className="[backface-visibility:hidden] rounded-xl bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] p-3 sm:p-5 min-h-[100px] sm:min-h-[130px] flex flex-col justify-between shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <span className="text-white/90 text-base sm:text-lg font-bold">
                ?
              </span>
            </div>
            <p className="text-white/90 text-[13px] sm:text-sm font-medium leading-snug">
              {card.teaser}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-white/40 text-[11px] group-hover:text-white/70 transition-colors">
            <MousePointerClick size={12} />
            <span>Tap to reveal</span>
          </div>
        </div>

        {/* Back - Revealed */}
        <div className="[backface-visibility:hidden] [transform:rotateY(180deg)] absolute inset-0 rounded-xl bg-white border border-gray-100 p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="flex items-center gap-1 flex-shrink-0">
            {card.images.map((img, i) => (
              <Image
                key={i}
                src={img.src}
                alt={img.alt}
                width={img.size}
                height={img.size}
                className={`object-contain flex-shrink-0 ${img.size > 60 ? "w-[40px] h-[40px] sm:w-[60px] sm:h-[60px]" : "w-[32px] h-[32px] sm:w-[44px] sm:h-[44px]"}`}
                unoptimized
              />
            ))}
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-[#2B9EB3]">
              {card.stat}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-[#1a3a4a] leading-snug">
              {card.title}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              {card.subtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RollOfHonorPage() {
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [selectedSport, setSelectedSport] =
    useState<SportCategory>("mensFootball");
  const [selectedSize, setSelectedSize] = useState<TeamSize>("11s");

  const handleReveal = (id: number) => {
    setRevealedCards((prev) => new Set(prev).add(id));
  };

  const allRevealed = revealedCards.size === factCards.length;

  const handleRevealAll = () => {
    setRevealedCards(new Set(factCards.map((c) => c.id)));
  };

  const currentSportConfig = sportConfig[selectedSport];
  const availableSizes = currentSportConfig.availableSizes;

  const effectiveSize = availableSizes.includes(selectedSize)
    ? selectedSize
    : availableSizes[0];

  const currentRecords = currentSportConfig.records[effectiveSize] || [];

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

  const championshipCount = currentRecords.filter(
    (r) => r.competition === "Championship" && !r.notPlayed && r.winner
  ).length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <Header currentPage="Roll of Honor" />

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
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <Trophy size={22} className="text-[#2B9EB3] sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[#2B9EB3] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-0.5 sm:mb-1">
                  Benelux GAA
                </p>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  <EditableText
                    pageKey="roll-of-honor"
                    contentKey="title"
                    defaultValue="Roll of Honor"
                    maxLength={30}
                  />
                </h1>
              </div>
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
          {/* Fact Cards - desktop only */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-4 mb-8">
            {factCards.map((card, index) => (
              <FlipCard
                key={card.id}
                card={card}
                revealed={revealedCards.has(card.id)}
                onReveal={() => handleReveal(card.id)}
                index={index}
              />
            ))}
          </div>

          {!allRevealed && (
            <div className="hidden sm:block text-center mb-8">
              <button
                type="button"
                onClick={handleRevealAll}
                className="inline-flex items-center gap-1.5 text-xs text-[#2B9EB3] hover:text-[#1a3a4a] transition-colors font-medium"
              >
                <Sparkles size={13} />
                Reveal all
              </button>
            </div>
          )}

          {/* Sport & Size Selectors */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative">
                <select
                  value={selectedSport}
                  onChange={(e) =>
                    setSelectedSport(e.target.value as SportCategory)
                  }
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 pr-8 text-xs sm:text-sm font-semibold text-[#1a3a4a] hover:border-[#2B9EB3]/40 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent cursor-pointer transition-colors"
                >
                  {(Object.keys(sportConfig) as SportCategory[]).map(
                    (sport) => (
                      <option key={sport} value={sport}>
                        {sportConfig[sport].label}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              <div className="flex gap-1 sm:gap-1.5">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      effectiveSize === size
                        ? "bg-[#1a3a4a] text-white shadow-md"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {size === "7s" ? "7/9s" : size}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-1.5 bg-[#2B9EB3]/10 text-[#1a3a4a] px-3 py-1.5 sm:py-2 rounded-full">
                <Trophy size={14} className="text-[#2B9EB3]" />
                <span className="font-bold text-xs sm:text-sm">
                  {championshipCount}
                </span>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a3a4a] text-white text-xs sm:text-sm">
                  <th className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-left font-semibold w-14 sm:w-20">
                    Year
                  </th>
                  <th className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-left font-semibold">
                    Comp
                  </th>
                  <th className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-left font-semibold">
                    Winner
                  </th>
                  <th className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-left font-semibold hidden sm:table-cell">
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
                        className={`border-b border-gray-50 transition-colors hover:bg-[#2B9EB3]/[0.03] ${yearIdx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                      >
                        {isFirstOfYear && (
                          <td
                            rowSpan={rowCount}
                            className="px-3 sm:px-5 py-2 sm:py-3 font-bold text-[#1a3a4a] align-top border-r border-gray-100 text-sm sm:text-base"
                          >
                            {year}
                          </td>
                        )}
                        <td className="px-3 sm:px-5 py-2 sm:py-3">
                          {record.notPlayed ? (
                            <span className="text-gray-400 italic text-[11px] sm:text-xs">
                              COVID-19
                            </span>
                          ) : (
                            <span
                              className={`text-[11px] sm:text-xs font-medium ${
                                record.competition === "Championship"
                                  ? "text-[#1a3a4a]"
                                  : "text-gray-400"
                              }`}
                            >
                              {record.competition}
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-5 py-2 sm:py-3">
                          {!record.notPlayed && record.winner && (
                            <div className="flex items-center gap-1.5">
                              {record.competition === "Championship" && (
                                <Trophy
                                  size={12}
                                  className="text-yellow-500 flex-shrink-0 sm:w-[14px] sm:h-[14px]"
                                />
                              )}
                              <span
                                className={`font-semibold text-xs sm:text-sm ${record.competition === "Championship" ? "text-gray-900" : "text-gray-500"}`}
                              >
                                {record.winner}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-5 py-2 sm:py-3 text-gray-400 text-xs sm:text-sm hidden sm:table-cell">
                          {!record.notPlayed && record.runnerUp && (
                            <div className="flex items-center gap-1.5">
                              <Medal
                                size={12}
                                className="text-gray-300 flex-shrink-0"
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
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-4 sm:gap-6 justify-center text-[11px] sm:text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Trophy size={11} className="text-yellow-500" />
              <span>Championship</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
              <span>Shield (2nd tier)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200 inline-block" />
              <span>Plate (3rd tier)</span>
            </div>
          </div>

          <div className="text-center text-[11px] text-gray-400 mt-2 space-y-0.5">
            <p>Names with &quot;/&quot; denote joint winners or runners-up</p>
            <p>Brussels (previously Belgium GAA)</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
