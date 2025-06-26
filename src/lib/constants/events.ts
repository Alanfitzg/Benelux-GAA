export const EVENT_TYPES = [
  "Tournament",
  "Friendly"
] as const;

export type EventType = typeof EVENT_TYPES[number];

export const EVENT_CONSTANTS = {
  TYPES: EVENT_TYPES,
  DEFAULT_INCLUDES: [
    "3 nights in a centrally located hotel",
    "Breakfast each morning", 
    "All scheduled activities and fixtures",
    "Dedicated event manager",
    "Souvenir or event pennant"
  ],
  DEFAULT_HIGHLIGHTS: [
    "Friendly fixture with a local team",
    "Team-building activities",
    "Social night out", 
    "Guided city tour"
  ]
} as const;