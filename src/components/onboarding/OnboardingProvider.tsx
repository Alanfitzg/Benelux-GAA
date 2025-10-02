"use client";

// Disabled automatic opening to reduce bounce rate
// Profile Builder is now accessed via welcome email link at /profile-builder

export default function OnboardingProvider() {
  return null;
}

/* DISABLED CODE - Profile Builder opens via /profile-builder link from welcome email

import { useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingModal from './OnboardingModal';

export default function OnboardingProvider() {
  const { shouldShowOnboarding, isLoading } = useOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && shouldShowOnboarding) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding, isLoading]);

  if (isLoading || !shouldShowOnboarding) {
    return null;
  }

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
*/
