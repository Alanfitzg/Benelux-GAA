'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ACTIVITIES, BUDGET_RANGES, MONTHS, SEASONS } from '@/lib/constants/onboarding';

interface DetailPreferencesProps {
  formData: {
    preferredCities: string[];
    preferredCountries: string[];
    preferredClubs: string[];
    activities: string[];
    budgetRange: string;
    maxFlightTime: number | null;
    preferredMonths: string[];
  };
  onUpdate: (updates: Partial<DetailPreferencesProps['formData']>) => void;
}

export default function DetailPreferences({ formData, onUpdate }: DetailPreferencesProps) {
  const [cityInput, setCityInput] = useState('');
  const [countryInput, setCountryInput] = useState('');

  const addItem = (type: 'city' | 'country', value: string) => {
    if (!value.trim()) return;
    
    if (type === 'city') {
      onUpdate({ preferredCities: [...formData.preferredCities, value] });
      setCityInput('');
    } else if (type === 'country') {
      onUpdate({ preferredCountries: [...formData.preferredCountries, value] });
      setCountryInput('');
    }
  };

  const removeItem = (type: 'city' | 'country', index: number) => {
    if (type === 'city') {
      onUpdate({ 
        preferredCities: formData.preferredCities.filter((_, i) => i !== index) 
      });
    } else if (type === 'country') {
      onUpdate({ 
        preferredCountries: formData.preferredCountries.filter((_, i) => i !== index) 
      });
    }
  };

  const toggleActivity = (activityId: string) => {
    if (formData.activities.includes(activityId)) {
      onUpdate({ 
        activities: formData.activities.filter(id => id !== activityId) 
      });
    } else {
      onUpdate({ 
        activities: [...formData.activities, activityId] 
      });
    }
  };

  const toggleMonth = (monthId: string) => {
    if (formData.preferredMonths.includes(monthId)) {
      onUpdate({ 
        preferredMonths: formData.preferredMonths.filter(id => id !== monthId) 
      });
    } else {
      onUpdate({ 
        preferredMonths: [...formData.preferredMonths, monthId] 
      });
    }
  };

  const selectSeason = (season: { id: string; label: string; icon: string; months: readonly string[] }) => {
    // Check if all months in the season are already selected
    const allMonthsSelected = season.months.every(month => 
      formData.preferredMonths.includes(month)
    );
    
    if (allMonthsSelected) {
      // Deselect all months in the season
      onUpdate({
        preferredMonths: formData.preferredMonths.filter(month => 
          !(season.months as readonly string[]).includes(month)
        )
      });
    } else {
      // Select all months in the season
      const newMonths = [...new Set([...formData.preferredMonths, ...season.months])];
      onUpdate({ preferredMonths: newMonths });
    }
  };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-gray-600 mb-4">
          Add more details to get personalized recommendations (all optional)
        </p>
      </motion.div>

      {/* Preferred Destinations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="font-semibold text-gray-900">Preferred Destinations</h3>
        
        {/* Cities */}
        <div>
          <label className="text-sm text-gray-600">Cities</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('city', cityInput)}
              placeholder="e.g., Barcelona, Dublin"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => addItem('city', cityInput)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.preferredCities.map((city, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
              >
                {city}
                <button
                  onClick={() => removeItem('city', index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div>
          <label className="text-sm text-gray-600">Countries</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('country', countryInput)}
              placeholder="e.g., Spain, Portugal"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => addItem('country', countryInput)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.preferredCountries.map((country, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
              >
                {country}
                <button
                  onClick={() => removeItem('country', index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Budget Range */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="font-semibold text-gray-900">Budget Range</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(BUDGET_RANGES).map((budget) => (
            <button
              key={budget.id}
              onClick={() => onUpdate({ budgetRange: budget.id })}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${formData.budgetRange === budget.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-sm font-medium">{budget.label}</div>
              <div className="text-xs text-gray-600">{budget.description}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h3 className="font-semibold text-gray-900">Activities You Enjoy</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.values(ACTIVITIES).map((activity) => (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`
                p-2 rounded-lg border transition-all text-center
                ${formData.activities.includes(activity.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-xl">{activity.icon}</div>
              <div className="text-xs mt-1">{activity.label}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Travel Months */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h3 className="font-semibold text-gray-900">When Do You Like to Travel?</h3>
        
        {/* Quick Season Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Quick select by season:</p>
          <div className="flex gap-2 flex-wrap">
            {SEASONS.map((season) => {
              const allMonthsSelected = season.months.every(month => 
                formData.preferredMonths.includes(month)
              );
              return (
                <button
                  key={season.id}
                  onClick={() => selectSeason(season)}
                  className={`
                    px-3 py-1.5 rounded-lg border text-sm transition-all flex items-center gap-1
                    ${allMonthsSelected
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <span>{season.icon}</span>
                  <span>{season.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Month Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Or select specific months:</p>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((month) => (
              <button
                key={month.id}
                onClick={() => toggleMonth(month.id)}
                className={`
                  px-3 py-2 rounded-lg border text-sm transition-all
                  ${formData.preferredMonths.includes(month.id)
                    ? 'border-primary bg-primary/5 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {month.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Max Flight Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <h3 className="font-semibold text-gray-900">Maximum Flight Time</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="12"
            value={formData.maxFlightTime || 4}
            onChange={(e) => onUpdate({ maxFlightTime: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm font-medium w-20 text-right">
            {formData.maxFlightTime || 4} hours
          </span>
        </div>
      </motion.div>
    </div>
  );
}