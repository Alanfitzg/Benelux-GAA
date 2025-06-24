"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Club {
  id: string;
  name: string;
  location: string | null;
  region: string | null;
}

interface ClubSelectorProps {
  value: string | null;
  onChange: (clubId: string | null) => void;
  disabled?: boolean;
}

export default function ClubSelector({ value, onChange, disabled = false }: ClubSelectorProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedClub = clubs.find(c => c.id === value);

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(search.toLowerCase()) ||
    (club.location && club.location.toLowerCase().includes(search.toLowerCase())) ||
    (club.region && club.region.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs/simple');
        if (response.ok) {
          const clubsData = await response.json();
          setClubs(clubsData);
        }
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClubSelect = (clubId: string) => {
    onChange(clubId);
    setIsOpen(false);
    setSearch('');
  };

  const handleNoClubSelect = () => {
    onChange(null);
    setIsOpen(false);
    setSearch('');
  };

  if (loading) {
    return (
      <div className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-500">
        Loading clubs...
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-left focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedClub ? (
              <div>
                <div className="font-medium text-gray-900">{selectedClub.name}</div>
                {selectedClub.location && (
                  <div className="text-sm text-gray-500">{selectedClub.location}</div>
                )}
              </div>
            ) : (
              <span className="text-gray-500">Select your club (optional)</span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {/* No club option */}
              <button
                type="button"
                onClick={handleNoClubSelect}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${
                  !value ? 'bg-primary/5 text-primary' : ''
                }`}
              >
                <div className="font-medium">I&apos;m not associated with a club</div>
                <div className="text-sm text-gray-500">Join as an individual member</div>
              </button>

              {filteredClubs.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  {search ? 'No clubs found matching your search' : 'No clubs available'}
                </div>
              ) : (
                filteredClubs.map((club) => (
                  <button
                    key={club.id}
                    type="button"
                    onClick={() => handleClubSelect(club.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                      club.id === value ? 'bg-primary/5 text-primary' : ''
                    }`}
                  >
                    <div className="font-medium">{club.name}</div>
                    {club.location && (
                      <div className="text-sm text-gray-500">{club.location}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}