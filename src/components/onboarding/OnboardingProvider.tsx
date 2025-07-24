'use client';

import { useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingModal from './OnboardingModal';

export default function OnboardingProvider() {
  const { shouldShowOnboarding, isLoading } = useOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && shouldShowOnboarding) {
      // Delay showing modal to avoid jarring UX
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