export const TRAVEL_MOTIVATIONS = {
  sun_beach: {
    id: "sun_beach",
    label: "Sun & Beach",
    icon: "☀️",
    description: "Warm weather destinations",
  },
  city_break: {
    id: "city_break",
    label: "City Break",
    icon: "🏙️",
    description: "Urban destinations & nightlife",
  },
  budget: {
    id: "budget",
    label: "Budget Trip",
    icon: "💰",
    description: "Cheapest option available",
  },
  big_event: {
    id: "big_event",
    label: "Big Event",
    icon: "🎉",
    description: "Align with sports/music events",
  },
  competitive: {
    id: "competitive",
    label: "Competitive",
    icon: "🏆",
    description: "Serious tournament, results matter",
  },
  long_haul: {
    id: "long_haul",
    label: "Long Haul",
    icon: "🌍",
    description: "USA, Australia, etc.",
    note: "Not currently offering",
  },
} as const;

export const COMPETITIVE_LEVELS = {
  training_camp: {
    id: "training_camp",
    label: "Training Camp",
    description:
      "Team preparation with training facilities and practice matches",
  },
  friendly_tournament: {
    id: "friendly_tournament",
    label: "Friendly Tournament",
    description: "Competitive games in a relaxed, social atmosphere",
  },
  fifteen_a_side: {
    id: "fifteen_a_side",
    label: "15-a-Side",
    description: "Full format competitive matches against local teams",
  },
  social_gaa: {
    id: "social_gaa",
    label: "Social GAA",
    description: "Focus on fun, culture, and craic - results secondary",
  },
  blitz_tournament: {
    id: "blitz_tournament",
    label: "Blitz Tournament",
    description: "Multiple short games in round-robin format",
  },
  exhibition_match: {
    id: "exhibition_match",
    label: "Exhibition Match",
    description: "One-off showcase game against a local team",
  },
} as const;

export const BUDGET_RANGES = {
  budget: {
    id: "budget",
    label: "Budget",
    description: "€0-200 per person",
  },
  "mid-range": {
    id: "mid-range",
    label: "Mid-Range",
    description: "€200-500 per person",
  },
  premium: {
    id: "premium",
    label: "Premium",
    description: "€500+ per person",
  },
} as const;

export const MONTHS = [
  { id: "january", label: "January" },
  { id: "february", label: "February" },
  { id: "march", label: "March" },
  { id: "april", label: "April" },
  { id: "may", label: "May" },
  { id: "june", label: "June" },
  { id: "july", label: "July" },
  { id: "august", label: "August" },
  { id: "september", label: "September" },
  { id: "october", label: "October" },
  { id: "november", label: "November" },
  { id: "december", label: "December" },
] as const;

export const SEASONS = [
  {
    id: "spring",
    label: "Spring",
    icon: "🌸",
    months: ["march", "april", "may"],
  },
  {
    id: "summer",
    label: "Summer",
    icon: "☀️",
    months: ["june", "july", "august"],
  },
  {
    id: "autumn",
    label: "Autumn",
    icon: "🍂",
    months: ["september", "october", "november"],
  },
  {
    id: "winter",
    label: "Winter",
    icon: "❄️",
    months: ["december", "january", "february"],
  },
] as const;

export const ACTIVITIES = {
  surfing: { id: "surfing", label: "Surfing", icon: "🏄" },
  hiking: { id: "hiking", label: "Hiking", icon: "🥾" },
  swimming: { id: "swimming", label: "Swimming", icon: "🏊" },
  skiing: { id: "skiing", label: "Skiing", icon: "⛷️" },
  cycling: { id: "cycling", label: "Cycling", icon: "🚴" },
  golf: { id: "golf", label: "Golf", icon: "⛳" },
  fishing: { id: "fishing", label: "Fishing", icon: "🎣" },
  sailing: { id: "sailing", label: "Sailing", icon: "⛵" },
} as const;
