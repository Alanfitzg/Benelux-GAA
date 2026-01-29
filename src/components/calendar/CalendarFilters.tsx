"use client";

import { useState } from "react";
import { Globe, Lock, Users, Info } from "lucide-react";

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
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const toggleFilter = (key: keyof typeof filters) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const tooltips = {
    public: "Invitational events open to the public",
    private: "Competitive GGE tournaments (not open to public)",
    interest: "Show interest heatmap from clubs",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
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
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowTooltip(showTooltip === "public" ? null : "public")
            }
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          {showTooltip === "public" && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
              {tooltips.public}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
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
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowTooltip(showTooltip === "private" ? null : "private")
            }
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          {showTooltip === "private" && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
              {tooltips.private}
            </div>
          )}
        </div>
      </div>

      {showInterestFilter && (
        <div className="flex items-center gap-1">
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
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowTooltip(showTooltip === "interest" ? null : "interest")
              }
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {showTooltip === "interest" && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                {tooltips.interest}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
