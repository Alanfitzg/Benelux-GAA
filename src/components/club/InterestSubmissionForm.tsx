'use client';

import { useState } from 'react';
import { X, Users, MessageSquare } from 'lucide-react';
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
  const [interestType, setInterestType] = useState<'SPECIFIC_DATE' | 'ENTIRE_MONTH' | 'DATE_RANGE' | 'MULTIPLE_MONTHS'>('ENTIRE_MONTH');
  const [specificDate, setSpecificDate] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [flexibility, setFlexibility] = useState<'FIXED' | 'FLEXIBLE' | 'VERY_FLEXIBLE'>('FLEXIBLE');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getNextSixMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = addMonths(today, i);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
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
    setLoading(true);
    setError('');

    try {
      const data: {
        interestType: string;
        teamSize: number;
        flexibility: string;
        message?: string;
        specificDate?: string;
        months?: string[];
        dateRangeStart?: string;
        dateRangeEnd?: string;
      } = {
        interestType,
        teamSize: parseInt(teamSize),
        flexibility,
        message,
      };

      if (interestType === 'SPECIFIC_DATE') {
        data.specificDate = specificDate;
      } else if (interestType === 'ENTIRE_MONTH' || interestType === 'MULTIPLE_MONTHS') {
        data.months = selectedMonths;
      } else if (interestType === 'DATE_RANGE') {
        data.dateRangeStart = dateRangeStart;
        data.dateRangeEnd = dateRangeEnd;
      }

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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Express Interest in {clubName}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                When would you like to visit?
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="interestType"
                    value="SPECIFIC_DATE"
                    checked={interestType === 'SPECIFIC_DATE'}
                    onChange={(e) => setInterestType(e.target.value as 'SPECIFIC_DATE' | 'ENTIRE_MONTH' | 'DATE_RANGE' | 'MULTIPLE_MONTHS')}
                    className="mr-3"
                  />
                  <span>Specific date</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="interestType"
                    value="ENTIRE_MONTH"
                    checked={interestType === 'ENTIRE_MONTH'}
                    onChange={(e) => setInterestType(e.target.value as 'SPECIFIC_DATE' | 'ENTIRE_MONTH' | 'DATE_RANGE' | 'MULTIPLE_MONTHS')}
                    className="mr-3"
                  />
                  <span>Entire month(s)</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="interestType"
                    value="DATE_RANGE"
                    checked={interestType === 'DATE_RANGE'}
                    onChange={(e) => setInterestType(e.target.value as 'SPECIFIC_DATE' | 'ENTIRE_MONTH' | 'DATE_RANGE' | 'MULTIPLE_MONTHS')}
                    className="mr-3"
                  />
                  <span>Date range</span>
                </label>
              </div>
            </div>

            {interestType === 'SPECIFIC_DATE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select date
                </label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {(interestType === 'ENTIRE_MONTH' || interestType === 'MULTIPLE_MONTHS') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select month(s)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getNextSixMonths().map(month => (
                    <label
                      key={month.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMonths.includes(month.value)
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={month.value}
                        checked={selectedMonths.includes(month.value)}
                        onChange={() => handleMonthToggle(month.value)}
                        className="sr-only"
                      />
                      <span className="text-sm">{month.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {interestType === 'DATE_RANGE' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End date
                  </label>
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    min={dateRangeStart}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Team size
              </label>
              <input
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                placeholder="e.g., 20"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How flexible are your dates?
              </label>
              <select
                value={flexibility}
                onChange={(e) => setFlexibility(e.target.value as 'FIXED' | 'FLEXIBLE' | 'VERY_FLEXIBLE')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="FIXED">Fixed - Must be these dates</option>
                <option value="FLEXIBLE">Flexible - Preferred but open to alternatives</option>
                <option value="VERY_FLEXIBLE">Very Flexible - Just exploring options</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Additional message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell the club about your team and what you're looking for..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (interestType === 'ENTIRE_MONTH' && selectedMonths.length === 0)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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