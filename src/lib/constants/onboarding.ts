export const TRAVEL_MOTIVATIONS = {
  weather_sun: {
    id: 'weather_sun',
    label: 'Sun & Warmth',
    icon: '☀️',
    description: 'Warm weather destinations'
  },
  budget: {
    id: 'budget',
    label: 'Budget-Friendly',
    icon: '💰',
    description: 'Affordable trips'
  },
  specific_location: {
    id: 'specific_location',
    label: 'Specific Place',
    icon: '📍',
    description: 'City or club in mind'
  },
  activities: {
    id: 'activities',
    label: 'Activities',
    icon: '🏄',
    description: 'Sports & adventures'
  },
  social: {
    id: 'social',
    label: 'Social & Craic',
    icon: '🍺',
    description: 'Nightlife & fun'
  },
  tournament: {
    id: 'tournament',
    label: 'Top Tournaments',
    icon: '🏆',
    description: 'Competitive events'
  },
  short_trip: {
    id: 'short_trip',
    label: 'Quick Getaway',
    icon: '✈️',
    description: 'Short travel time'
  },
  culture: {
    id: 'culture',
    label: 'Culture',
    icon: '🏛️',
    description: 'Local experiences'
  },
  friends: {
    id: 'friends',
    label: 'Follow Friends',
    icon: '👥',
    description: 'Where teams are going'
  }
} as const;

export const COMPETITIVE_LEVELS = {
  casual: {
    id: 'casual',
    label: 'Social & Fun',
    description: 'Just for the craic - focus on fun and meeting people'
  },
  mixed: {
    id: 'mixed',
    label: 'Mixed Ability',
    description: 'Some competitive games, some social'
  },
  competitive_irish: {
    id: 'competitive_irish',
    label: 'Competitive Irish',
    description: 'Match against similar Irish teams abroad'
  },
  international: {
    id: 'international',
    label: 'International Challenge',
    description: 'Test yourself against local European teams'
  },
  elite: {
    id: 'elite',
    label: 'Elite Level',
    description: 'High-level competitive tournaments only'
  }
} as const;

export const BUDGET_RANGES = {
  budget: {
    id: 'budget',
    label: 'Budget',
    description: '€0-200 per person'
  },
  'mid-range': {
    id: 'mid-range',
    label: 'Mid-Range',
    description: '€200-500 per person'
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    description: '€500+ per person'
  }
} as const;

export const MONTHS = [
  { id: 'january', label: 'January' },
  { id: 'february', label: 'February' },
  { id: 'march', label: 'March' },
  { id: 'april', label: 'April' },
  { id: 'may', label: 'May' },
  { id: 'june', label: 'June' },
  { id: 'july', label: 'July' },
  { id: 'august', label: 'August' },
  { id: 'september', label: 'September' },
  { id: 'october', label: 'October' },
  { id: 'november', label: 'November' },
  { id: 'december', label: 'December' }
] as const;

export const SEASONS = [
  { 
    id: 'spring', 
    label: 'Spring', 
    icon: '🌸',
    months: ['march', 'april', 'may']
  },
  { 
    id: 'summer', 
    label: 'Summer', 
    icon: '☀️',
    months: ['june', 'july', 'august']
  },
  { 
    id: 'autumn', 
    label: 'Autumn', 
    icon: '🍂',
    months: ['september', 'october', 'november']
  },
  { 
    id: 'winter', 
    label: 'Winter', 
    icon: '❄️',
    months: ['december', 'january', 'february']
  }
] as const;

export const ACTIVITIES = {
  surfing: { id: 'surfing', label: 'Surfing', icon: '🏄' },
  hiking: { id: 'hiking', label: 'Hiking', icon: '🥾' },
  swimming: { id: 'swimming', label: 'Swimming', icon: '🏊' },
  skiing: { id: 'skiing', label: 'Skiing', icon: '⛷️' },
  cycling: { id: 'cycling', label: 'Cycling', icon: '🚴' },
  golf: { id: 'golf', label: 'Golf', icon: '⛳' },
  fishing: { id: 'fishing', label: 'Fishing', icon: '🎣' },
  sailing: { id: 'sailing', label: 'Sailing', icon: '⛵' }
} as const;