'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { isFeatureEnabled } from '@/lib/featureFlags';

interface UserPreferences {
  motivations: string[];
  competitiveLevel: string;
  preferredCities: string[];
  preferredCountries: string[];
  preferredClubs: string[];
  activities: string[];
  budgetRange: string;
  maxFlightTime: number | null;
  preferredMonths: string[];
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
}

interface OnboardingStatus {
  shouldShowOnboarding: boolean;
  isLoading: boolean;
  preferences: UserPreferences | null;
}

export function useOnboarding(): OnboardingStatus {
  const { data: session, status } = useSession();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    async function checkOnboardingStatus() {
      // If feature is disabled, don't show onboarding
      if (!isFeatureEnabled('USER_ONBOARDING')) {
        setShouldShowOnboarding(false);
        setIsLoading(false);
        return;
      }

      // If not logged in, don't show onboarding
      if (status === 'loading') return;
      
      if (!session?.user) {
        setShouldShowOnboarding(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/preferences');
        const data = await response.json();
        
        if (response.ok) {
          setPreferences(data.preferences);
          // Show onboarding if user has no preferences and hasn't skipped
          setShouldShowOnboarding(
            !data.preferences || 
            (!data.preferences.onboardingCompleted && !data.preferences.onboardingSkipped)
          );
        } else {
          // If no preferences exist, show onboarding
          setShouldShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setShouldShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [session, status]);

  return { shouldShowOnboarding, isLoading, preferences };
}