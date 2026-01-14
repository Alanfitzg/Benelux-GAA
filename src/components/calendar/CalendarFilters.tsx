"use client";

import { Globe, Lock, Users } from "lucide-react";

interface CalendarFiltersProps {
  filters: {
    showPublic: boolean;
    showPrivate: boolean;
    showInterest: boolean;
  };
  onFiltersChange: (filters: {
    showPublic: boolean;
    showPrivate: boolean;
    showInterest: boolean;
  }) => void;
  showInterestFilter?: boolean;
}

export default function CalendarFilters({
  filters,
  onFiltersChange,
  showInterestFilter = true,
}: CalendarFiltersProps) {
  const toggleFilter = (key: keyof typeof filters) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggleFilter("showPublic")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          filters.showPublic
            ? "bg-primary text-white shadow-sm"
            : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        Public
      </button>

      <button
        type="button"
        onClick={() => toggleFilter("showPrivate")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          filters.showPrivate
            ? "bg-primary/90 text-white shadow-sm"
            : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
        }`}
      >
        <Lock className="w-3.5 h-3.5" />
        Private
      </button>

      {showInterestFilter && (
        <button
          type="button"
          onClick={() => toggleFilter("showInterest")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filters.showInterest
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Interest
        </button>
      )}
    </div>
  );
}
