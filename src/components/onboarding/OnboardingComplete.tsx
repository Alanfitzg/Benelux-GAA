'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { TRAVEL_MOTIVATIONS, COMPETITIVE_LEVELS } from '@/lib/constants/onboarding';

interface OnboardingCompleteProps {
  preferences: {
    motivations: string[];
    competitiveLevel: string;
    preferredCities: string[];
    preferredCountries: string[];
    preferredClubs: string[];
    budgetRange: string;
    preferredMonths: string[];
  };
  isSubmitting: boolean;
}

export default function OnboardingComplete({ preferences, isSubmitting }: OnboardingCompleteProps) {
  const selectedMotivations = preferences.motivations
    .map((id: string) => TRAVEL_MOTIVATIONS[id as keyof typeof TRAVEL_MOTIVATIONS])
    .filter(Boolean);
    
  const competitiveLevel = COMPETITIVE_LEVELS[preferences.competitiveLevel as keyof typeof COMPETITIVE_LEVELS];

  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-green-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-gray-900">Perfect!</h3>
        <p className="text-gray-600 mt-2">
          We&apos;ve got everything we need to personalize your PlayAway experience.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-xl p-6 text-left space-y-4"
      >
        <h4 className="font-semibold text-gray-900">Your Preferences Summary:</h4>
        
        {selectedMotivations.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Travel Priorities (ranked):</p>
            <div className="space-y-2">
              {selectedMotivations.map((motivation, index) => (
                <div
                  key={motivation.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                >
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{motivation.icon}</span>
                  <span className="text-sm">{motivation.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {competitiveLevel && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Competitive Level:</p>
            <p className="font-medium">{competitiveLevel.label}</p>
          </div>
        )}
        
        {preferences.preferredCities.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Preferred Cities:</p>
            <p className="text-sm">{preferences.preferredCities.join(', ')}</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-gray-600"
      >
        {isSubmitting ? (
          <p>Saving your preferences...</p>
        ) : (
          <p>You can update these anytime in your profile settings.</p>
        )}
      </motion.div>
    </div>
  );
}