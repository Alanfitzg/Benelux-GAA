'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Edit2 } from 'lucide-react';
import { isFeatureEnabled } from '@/lib/featureFlags';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { TRAVEL_MOTIVATIONS, COMPETITIVE_LEVELS } from '@/lib/constants/onboarding';

interface UserPreferences {
  motivations: string[];
  competitiveLevel: string;
  preferredCities: string[];
  preferredCountries: string[];
  preferredClubs: string[];
  budgetRange: string;
  preferredMonths: string[];
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
}

export default function PreferencesSection() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const showPreferences = isFeatureEnabled('USER_ONBOARDING');

  useEffect(() => {
    if (showPreferences) {
      fetchPreferences();
    }
  }, [showPreferences]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = () => {
    setIsEditingPreferences(false);
    fetchPreferences();
  };

  if (!showPreferences || loading) {
    return null;
  }

  const hasPreferences = preferences && (preferences.onboardingCompleted || preferences.onboardingSkipped);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Travel Preferences</h2>
          </div>
          <button
            onClick={() => setIsEditingPreferences(true)}
            className="text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            {hasPreferences ? 'Edit' : 'Set'} Preferences
          </button>
        </div>

        {!hasPreferences ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              You haven&apos;t set your travel preferences yet.
            </p>
            <button
              onClick={() => setIsEditingPreferences(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Set Your Preferences
            </button>
          </div>
        ) : preferences.onboardingSkipped ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              You skipped setting preferences. Set them now to get personalized recommendations!
            </p>
            <button
              onClick={() => setIsEditingPreferences(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Set Your Preferences
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Travel Motivations */}
            {preferences.motivations?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Travel Priorities (ranked)</h3>
                <div className="space-y-2">
                  {preferences.motivations.map((motivationId: string, index: number) => {
                    const motivation = TRAVEL_MOTIVATIONS[motivationId as keyof typeof TRAVEL_MOTIVATIONS];
                    if (!motivation) return null;
                    return (
                      <div
                        key={motivationId}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span>{motivation.icon}</span>
                        <span>{motivation.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Competitive Level */}
            {preferences.competitiveLevel && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Competitive Level</h3>
                <p className="text-sm">
                  {COMPETITIVE_LEVELS[preferences.competitiveLevel as keyof typeof COMPETITIVE_LEVELS]?.label}
                </p>
              </div>
            )}

            {/* Preferred Destinations */}
            {(preferences.preferredCities?.length > 0 || preferences.preferredCountries?.length > 0) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Destinations</h3>
                <div className="space-y-1">
                  {preferences.preferredCities?.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Cities:</span> {preferences.preferredCities.join(', ')}
                    </p>
                  )}
                  {preferences.preferredCountries?.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Countries:</span> {preferences.preferredCountries.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Budget Range */}
            {preferences.budgetRange && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Budget Range</h3>
                <p className="text-sm capitalize">{preferences.budgetRange.replace('-', ' ')}</p>
              </div>
            )}

            {/* Travel Months */}
            {preferences.preferredMonths?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Preferred Travel Months</h3>
                <p className="text-sm capitalize">
                  {preferences.preferredMonths.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {isEditingPreferences && (
        <OnboardingModal
          isOpen={isEditingPreferences}
          onClose={handlePreferencesUpdate}
        />
      )}
    </>
  );
}