'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FEATURE_FLAGS, getFeatureFlags, setFeatureFlags, isFeatureEnabled } from '@/lib/featureFlags';

interface FeatureFlagContextType {
  flags: Record<string, boolean>;
  isEnabled: (featureId: string) => boolean;
  toggleFeature: (featureId: string) => void;
  resetToDefaults: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedFlags = getFeatureFlags();
    setFlags(loadedFlags);
    setIsLoaded(true);
  }, []);

  const toggleFeature = (featureId: string) => {
    const newFlags = {
      ...flags,
      [featureId]: !flags[featureId],
    };
    setFlags(newFlags);
    setFeatureFlags(newFlags);
  };

  const resetToDefaults = () => {
    const defaultFlags = Object.entries(FEATURE_FLAGS).reduce((acc, [key, flag]) => {
      acc[key] = flag.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    setFlags(defaultFlags);
    setFeatureFlags(defaultFlags);
  };

  const isEnabled = (featureId: string) => {
    if (!isLoaded) return isFeatureEnabled(featureId);
    return flags[featureId] ?? false;
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, isEnabled, toggleFeature, resetToDefaults }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}