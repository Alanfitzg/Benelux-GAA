"use client";

import { useState, useRef, useEffect } from 'react';
import { TEAM_TYPES } from '@/lib/constants/teams';

interface TeamTypeMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export default function TeamTypeMultiSelect({ value, onChange, className = "" }: TeamTypeMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOption = (teamType: string) => {
    if (value.includes(teamType)) {
      onChange(value.filter(type => type !== teamType));
    } else {
      onChange([...value, teamType]);
    }
  };

  const handleRemoveTag = (teamType: string) => {
    onChange(value.filter(type => type !== teamType));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Display selected team types as tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((teamType) => (
            <span
              key={teamType}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
            >
              {teamType}
              <button
                type="button"
                onClick={() => handleRemoveTag(teamType)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 text-left flex items-center justify-between"
      >
        <span className="text-gray-600">
          {value.length === 0 ? "Select team types..." : `${value.length} team type${value.length === 1 ? '' : 's'} selected`}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {TEAM_TYPES.map((teamType) => (
            <label
              key={teamType}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(teamType)}
                onChange={() => handleToggleOption(teamType)}
                className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-900">{teamType}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}