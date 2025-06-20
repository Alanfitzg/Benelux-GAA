export const TEAM_TYPES = [
  "Mens Gaelic Football",
  "LGFA", 
  "Hurling",
  "Camogie",
  "Rounders",
  "G4MO",
  "Dads & Lads",
  "Higher Education",
  "Youth",
  "Elite training camp",
  "Beach Gaelic"
] as const;

export const TEAM_CONSTANTS = {
  TYPES: TEAM_TYPES,
} as const;

export type TeamType = typeof TEAM_TYPES[number];