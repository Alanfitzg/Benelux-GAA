"use client";

import { Trophy, Calendar, Users } from "lucide-react";

interface CalendarFiltersProps {
  filters: {
    showFixtures: boolean;
    showEvents: boolean;
    showInterest: boolean;
  };
  onFiltersChange: (filters: {
    showFixtures: boolean;
    showEvents: boolean;
    showInterest: boolean;
  }) => void;
  showInterestFilter?: boolean; // Hide interest filter for non-logged-in users
}

export default function CalendarFilters({ filters, onFiltersChange, showInterestFilter = true }: CalendarFiltersProps) {
  const toggleFilter = (key: keyof typeof filters) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Show:</span>

      <button
        onClick={() => toggleFilter("showFixtures")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          filters.showFixtures
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        <Trophy className="w-4 h-4" />
        Fixtures
      </button>

      <button
        onClick={() => toggleFilter("showEvents")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          filters.showEvents
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        <Calendar className="w-4 h-4" />
        Invitational Events
      </button>

      {showInterestFilter && (
        <button
          onClick={() => toggleFilter("showInterest")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filters.showInterest
              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Users className="w-4 h-4" />
          Interest Heatmap
        </button>
      )}
    </div>
  );
}