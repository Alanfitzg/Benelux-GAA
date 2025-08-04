export const EVENT_TYPES = [
  "Tournament",
  "Challenge match"
] as const;

export type EventType = typeof EVENT_TYPES[number];

export const TOURNAMENT_FORMATS = [
  "Round Robin",
  "Single Elimination",
  "Double Elimination", 
  "Group Stage + Knockout",
  "Swiss System"
] as const;

export type TournamentFormat = typeof TOURNAMENT_FORMATS[number];

export const EVENT_CONSTANTS = {
  TYPES: EVENT_TYPES,
  TOURNAMENT_FORMATS: TOURNAMENT_FORMATS,
  DEFAULT_INCLUDES: [
    "All scheduled activities and fixtures",
    "Dedicated event manager",
    "Pitchside water",
    "Pitchside snack/lunch",
    "After tournament dinner",
    "Pitch rental costs"
  ],
  DEFAULT_HIGHLIGHTS: [
    "Friendly fixture with a local team",
    "Team-building activities",
    "Social night out", 
    "Guided city tour"
  ],
  TOURNAMENT_HIGHLIGHTS: [
    "Competitive matches in structured format",
    "Group stages and knockout rounds",
    "Awards ceremony and trophies",
    "Team registration and match scheduling",
    "Live results and standings"
  ]
} as const;