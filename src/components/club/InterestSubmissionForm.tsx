'use client';

import { useState } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface InterestSubmissionFormProps {
  clubId: string;
  clubName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function InterestSubmissionForm({
  clubId,
  clubName,
  onClose,
  onSubmit,
}: InterestSubmissionFormProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState('');
  const [flexibility, setFlexibility] = useState<'FIXED' | 'FLEXIBLE' | 'VERY_FLEXIBLE'>('FLEXIBLE');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getNextTwelveMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = addMonths(today, i);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
        shortLabel: format(date, 'MMM'),
        year: format(date, 'yyyy'),
      });
    }
    return months;
  };

  const handleMonthToggle = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMonths.length === 0) {
      setError('Please select at least one month');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const data = {
        interestType: selectedMonths.length > 1 ? 'MULTIPLE_MONTHS' : 'ENTIRE_MONTH',
        teamSize: parseInt(teamSize),
        flexibility,
        message,
        months: selectedMonths,
      };

      const response = await fetch(`/api/clubs/${clubId}/tournament-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit interest');
      }

      onSubmit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full mx-4 sm:mx-auto max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tournament Interest</h2>
                <p className="text-sm text-gray-500 mt-0.5">{clubName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Select month(s) for your visit
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMonths.length === getNextTwelveMonths().length) {
                        setSelectedMonths([]);
                      } else {
                        setSelectedMonths(getNextTwelveMonths().map(m => m.value));
                      }
                    }}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    {selectedMonths.length === getNextTwelveMonths().length ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const months = getNextTwelveMonths();
                    const monthsByYear = months.reduce((acc, month) => {
                      const year = month.year;
                      if (!acc[year]) acc[year] = [];
                      acc[year].push(month);
                      return acc;
                    }, {} as Record<string, typeof months>);
                    
                    return Object.entries(monthsByYear).map(([year, yearMonths]) => (
                      <div key={year}>
                        <p className="text-xs font-medium text-gray-500 mb-2">{year}</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {yearMonths.map(month => (
                            <button
                              key={month.value}
                              type="button"
                              onClick={() => handleMonthToggle(month.value)}
                              className={`
                                relative p-2 rounded-md border transition-all text-xs font-medium
                                ${selectedMonths.includes(month.value)
                                  ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }
                              `}
                            >
                              {month.shortLabel}
                              {selectedMonths.includes(month.value) && (
                                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  Team size
                </label>
                <input
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="e.g., 15"
                  min="1"
                  max="50"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Schedule flexibility
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFlexibility('FIXED')}
                    className={`
                      p-2.5 rounded-lg border-2 transition-all text-sm
                      ${flexibility === 'FIXED'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    Fixed dates
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlexibility('FLEXIBLE')}
                    className={`
                      p-2.5 rounded-lg border-2 transition-all text-sm
                      ${flexibility === 'FLEXIBLE'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    Flexible
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlexibility('VERY_FLEXIBLE')}
                    className={`
                      p-2.5 rounded-lg border-2 transition-all text-sm
                      ${flexibility === 'VERY_FLEXIBLE'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    Very flexible
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any specific dates or requirements..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedMonths.length === 0}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Interest'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}