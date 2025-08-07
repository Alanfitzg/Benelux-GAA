// Pitch location constants for form options

export const ORIGINAL_PURPOSES = [
  'GAA Pitch',
  'Football/Soccer',
  'Rugby',
  'Cricket',
  'Baseball',
  'American Football',
  'Athletics Track',
  'Hockey',
  'Multi-sport',
  'Other'
] as const;

export const SURFACE_TYPES = [
  'Natural Grass',
  'Artificial Turf (3G)',
  'Artificial Turf (4G)', 
  'Sand-based',
  'Hybrid (Natural/Artificial)',
  'Hard Court',
  'Clay',
  'Other'
] as const;

export const AGE_GROUP_SUITABILITY = [
  'Youth Only (U18)',
  'Adult Only (18+)',
  'Mixed Age Groups',
  'Senior (35+)',
  'All Ages'
] as const;

export const FLOODLIGHT_HOURS = [
  'Not Available',
  'Dawn to Dusk',
  '6:00 AM - 10:00 PM',
  '7:00 AM - 11:00 PM',
  '24 Hours',
  'Custom Hours'
] as const;

// Helper function to convert constants to options for select inputs
export function getSelectOptions<T extends readonly string[]>(
  items: T
): Array<{ value: T[number]; label: T[number] }> {
  return items.map(item => ({ value: item, label: item }));
}