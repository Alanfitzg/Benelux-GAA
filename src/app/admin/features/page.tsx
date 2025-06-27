'use client';

import React from 'react';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import Link from 'next/link';

export default function FeatureTogglesPage() {
  const { flags, toggleFeature, resetToDefaults } = useFeatureFlags();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Toggles</h1>
        <p className="text-gray-600">
          Enable or disable features for testing and gradual rollout.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Available Features</h2>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(FEATURE_FLAGS).map(([key, feature]) => (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                    {feature.experimental && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Experimental
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {feature.id}</p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleFeature(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      flags[key] ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        flags[key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to use feature flags:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Toggle features on/off using the switches above</li>
          <li>Settings are saved in your browser&apos;s local storage</li>
          <li>Use the feature flag ID in your code to conditionally render features</li>
          <li>Experimental features may be unstable or incomplete</li>
        </ol>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-primary underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}