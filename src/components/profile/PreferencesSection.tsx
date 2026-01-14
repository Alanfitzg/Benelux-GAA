"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Edit2, CheckCircle } from "lucide-react";
import { isFeatureEnabled } from "@/lib/featureFlags";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import {
  TRAVEL_MOTIVATIONS,
  COMPETITIVE_LEVELS,
} from "@/lib/constants/onboarding";

interface UserPreferences {
  motivations: string[];
  competitiveLevels: string[];
  preferredCities: string[];
  preferredCountries: string[];
  preferredClubs: string[];
  budgetRange: string;
  preferredMonths: string[];
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
}

interface PreferencesSectionProps {
  compact?: boolean;
  defaultExpanded?: boolean;
}

export default function PreferencesSection({
  compact = false,
  defaultExpanded = false,
}: PreferencesSectionProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const showPreferences = isFeatureEnabled("USER_ONBOARDING");

  useEffect(() => {
    if (showPreferences) {
      fetchPreferences();
    }
  }, [showPreferences]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
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

  const hasPreferences =
    preferences &&
    (preferences.onboardingCompleted || preferences.onboardingSkipped);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`bg-white rounded-xl shadow-lg ${compact ? "p-5 mt-0" : "mt-8 p-6"}`}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
        >
          <div>
            <h3
              className={`font-bold text-gray-900 flex items-center gap-2 ${compact ? "text-base" : "text-xl"}`}
            >
              <Settings
                className={`text-primary ${compact ? "w-5 h-5" : "w-6 h-6"}`}
              />
              Travel Preferences
              {preferences?.onboardingCompleted && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </h3>
            <p
              className={`text-gray-500 text-left mt-0.5 ${compact ? "text-xs" : "text-sm"}`}
            >
              Your travel style and destination preferences
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                {!hasPreferences ? (
                  <div className={`text-center ${compact ? "py-6" : "py-8"}`}>
                    <p
                      className={`text-gray-600 mb-4 ${compact ? "text-sm" : ""}`}
                    >
                      You haven&apos;t set your travel preferences yet.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingPreferences(true);
                      }}
                      className={`bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors ${compact ? "px-4 py-1.5 text-sm" : "px-6 py-2"}`}
                    >
                      Set Your Preferences
                    </button>
                  </div>
                ) : preferences.onboardingSkipped ? (
                  <div className={`text-center ${compact ? "py-6" : "py-8"}`}>
                    <p
                      className={`text-gray-600 mb-4 ${compact ? "text-sm" : ""}`}
                    >
                      You skipped setting preferences. Set them now to get
                      personalized recommendations!
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingPreferences(true);
                      }}
                      className={`bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors ${compact ? "px-4 py-1.5 text-sm" : "px-6 py-2"}`}
                    >
                      Set Your Preferences
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Edit button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingPreferences(true);
                        }}
                        className="text-primary hover:text-primary-dark transition-colors flex items-center gap-1 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Preferences
                      </button>
                    </div>

                    {/* Travel Motivations */}
                    {preferences.motivations?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Travel Priorities (ranked)
                        </h3>
                        <div className="space-y-2">
                          {preferences.motivations.map(
                            (motivationId: string, index: number) => {
                              const motivation =
                                TRAVEL_MOTIVATIONS[
                                  motivationId as keyof typeof TRAVEL_MOTIVATIONS
                                ];
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
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Competitive Levels */}
                    {preferences.competitiveLevels?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Interested In
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {preferences.competitiveLevels.map(
                            (levelId: string) => {
                              const level =
                                COMPETITIVE_LEVELS[
                                  levelId as keyof typeof COMPETITIVE_LEVELS
                                ];
                              if (!level) return null;
                              return (
                                <span
                                  key={levelId}
                                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                >
                                  {level.label}
                                </span>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preferred Destinations */}
                    {(preferences.preferredCities?.length > 0 ||
                      preferences.preferredCountries?.length > 0) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Preferred Destinations
                        </h3>
                        <div className="space-y-1">
                          {preferences.preferredCities?.length > 0 && (
                            <p className="text-sm">
                              <span className="font-medium">Cities:</span>{" "}
                              {preferences.preferredCities.join(", ")}
                            </p>
                          )}
                          {preferences.preferredCountries?.length > 0 && (
                            <p className="text-sm">
                              <span className="font-medium">Countries:</span>{" "}
                              {preferences.preferredCountries.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Budget Range */}
                    {preferences.budgetRange && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          Budget Range
                        </h3>
                        <p className="text-sm capitalize">
                          {preferences.budgetRange.replace("-", " ")}
                        </p>
                      </div>
                    )}

                    {/* Travel Months */}
                    {preferences.preferredMonths?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          Preferred Travel Months
                        </h3>
                        <p className="text-sm capitalize">
                          {preferences.preferredMonths.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
