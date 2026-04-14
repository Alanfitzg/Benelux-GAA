export interface Fixture {
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

export const venueToClub: Record<string, { name: string; crest: string }> = {
  Leuven: {
    name: "Earls of Leuven",
    crest: "/club-crests/benelux-earls-of-leuven.png",
  },
  "Den Haag": {
    name: "CLG Den Haag",
    crest: "/club-crests/benelux-den-haag.png",
  },
  "The Hague": {
    name: "CLG Den Haag",
    crest: "/club-crests/benelux-den-haag.png",
  },
  Cologne: {
    name: "Cologne Celtics",
    crest: "/club-crests/benelux-cologne-celts.png",
  },
  Maastricht: {
    name: "Maastricht Gaels",
    crest: "/club-crests/benelux-maastricht-gaels.png",
  },
  Eindhoven: {
    name: "Eindhoven Shamrocks",
    crest: "/club-crests/benelux-eindhoven-shamrocks.png",
  },
  Luxembourg: {
    name: "Luxembourg GAA",
    crest: "/club-crests/benelux-luxembourg.png",
  },
  Amsterdam: {
    name: "Amsterdam GAA",
    crest: "/club-crests/benelux-amsterdam-gac.png",
  },
  Frankfurt: {
    name: "Eintracht Frankfurt GAA",
    crest: "/club-crests/benelux-frankfurt.png",
  },
};

export const fixtures2026: Fixture[] = [
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
    competition: "Benelux Breagh Championship (11s)",
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
    competition: "Benelux Breagh Championship (11s)",
    code: "Football",
    venue: "Frankfurt",
    round: "Round 2",
  },
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
    competition: "Benelux Breagh Championship (11s)",
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
  {
    id: "20",
    date: "2026-08-22",
    competition: "Benelux Breagh 15s Football Finals",
    code: "15s",
    venue: "Maastricht",
    notes: "Finals",
  },
  {
    id: "21",
    date: "2026-08-29",
    competition: "Benelux Breagh 15s Camogie & Hurling Finals",
    code: "15s",
    venue: "Maastricht",
    notes: "Finals",
  },
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
    competition: "Benelux Breagh Championship (11s)",
    code: "Football",
    venue: "Eindhoven",
    round: "Round 4",
  },
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
  {
    id: "27",
    date: "2026-11-07",
    competition: "Football Development Tournament (11s)",
    code: "Football",
    venue: "TBC",
    tbc: true,
  },
];

export function getUpcomingFixtures(count: number = 3): Fixture[] {
  const today = new Date().toISOString().split("T")[0];
  return fixtures2026.filter((f) => f.date >= today).slice(0, count);
}

export const competitionSponsors: Record<
  string,
  { name: string; logo: string }
> = {
  "Benelux Breagh Championship (11s)": {
    name: "Breagh",
    logo: "/sponsors/breagh.jpg",
  },
};

export const competitionColors: Record<string, string> = {
  "Benelux Breagh Championship (11s)": "border-l-[#2B9EB3]",
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
