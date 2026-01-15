"use client";

import React from "react";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import Link from "next/link";

export default function FeatureTogglesPage() {
  const { flags, toggleFeature, resetToDefaults } = useFeatureFlags();

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Feature Toggles
        </h1>
        <p className="text-xs sm:text-base text-gray-600">
          Enable or disable features for testing and gradual rollout.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-800">
            Available Features
          </h2>
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors self-start sm:self-auto"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {Object.entries(FEATURE_FLAGS).map(([key, feature]) => (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <h3 className="text-xs sm:text-base font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                    {feature.experimental && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Experimental
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-sm text-gray-600">
                    {feature.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    ID: {feature.id}
                  </p>
                </div>
                <div className="ml-3 sm:ml-4 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFeature(key)}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      flags[key] ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        flags[key]
                          ? "translate-x-4 sm:translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h3 className="text-xs sm:text-base font-semibold text-blue-900 mb-1.5 sm:mb-2">
          How to use feature flags:
        </h3>
        <ol className="list-decimal list-inside text-[10px] sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
          <li>Toggle features on/off using the switches above</li>
          <li>Settings are saved in your browser&apos;s local storage</li>
          <li className="hidden sm:list-item">
            Use the feature flag ID in your code to conditionally render
            features
          </li>
          <li>Experimental features may be unstable or incomplete</li>
        </ol>
      </div>

      <div className="mt-4 sm:mt-6 text-center">
        <Link href="/" className="text-xs sm:text-base text-primary underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
