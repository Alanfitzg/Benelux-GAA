export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  experimental?: boolean;
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  CLUB_EVENTS: {
    id: 'CLUB_EVENTS',
    name: 'Club Events Display',
    description: 'Show events associated with clubs on the club details page',
    enabled: true,
  },
  ADVANCED_SEARCH: {
    id: 'ADVANCED_SEARCH',
    name: 'Advanced Search',
    description: 'Enable advanced search filters for clubs and events',
    enabled: false,
    experimental: true,
  },
  USER_PROFILES: {
    id: 'USER_PROFILES',
    name: 'User Profiles',
    description: 'Enable user profile pages and customization',
    enabled: false,
  },
  EVENT_REGISTRATION: {
    id: 'EVENT_REGISTRATION',
    name: 'Event Registration',
    description: 'Allow users to register for events directly',
    enabled: false,
    experimental: true,
  },
  CLUB_ANALYTICS: {
    id: 'CLUB_ANALYTICS',
    name: 'Club Analytics',
    description: 'Show analytics and statistics for clubs',
    enabled: false,
  },
  USER_ONBOARDING: {
    id: 'USER_ONBOARDING',
    name: 'User Onboarding Flow',
    description: 'Show onboarding questionnaire for new users to capture travel preferences and motivations',
    enabled: true,
    experimental: true,
  },
};

export function isFeatureEnabled(featureId: string): boolean {
  if (typeof window === 'undefined') {
    return FEATURE_FLAGS[featureId]?.enabled ?? false;
  }
  
  const localFlags = localStorage.getItem('featureFlags');
  if (localFlags) {
    try {
      const parsed = JSON.parse(localFlags);
      return parsed[featureId] ?? FEATURE_FLAGS[featureId]?.enabled ?? false;
    } catch {
      return FEATURE_FLAGS[featureId]?.enabled ?? false;
    }
  }
  
  return FEATURE_FLAGS[featureId]?.enabled ?? false;
}

export function getFeatureFlags(): Record<string, boolean> {
  if (typeof window === 'undefined') {
    return Object.entries(FEATURE_FLAGS).reduce((acc, [key, flag]) => {
      acc[key] = flag.enabled;
      return acc;
    }, {} as Record<string, boolean>);
  }
  
  const localFlags = localStorage.getItem('featureFlags');
  if (localFlags) {
    try {
      return JSON.parse(localFlags);
    } catch {
      return Object.entries(FEATURE_FLAGS).reduce((acc, [key, flag]) => {
        acc[key] = flag.enabled;
        return acc;
      }, {} as Record<string, boolean>);
    }
  }
  
  return Object.entries(FEATURE_FLAGS).reduce((acc, [key, flag]) => {
    acc[key] = flag.enabled;
    return acc;
  }, {} as Record<string, boolean>);
}

export function setFeatureFlags(flags: Record<string, boolean>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('featureFlags', JSON.stringify(flags));
  }
}