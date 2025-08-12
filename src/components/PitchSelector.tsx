"use client";

import React, { useEffect, useState } from 'react';

interface PitchLocation {
  id: string;
  name: string;
  city: string;
  address?: string;
  club?: {
    name: string;
  };
}

interface PitchSelectorProps {
  selectedPitches: string[];
  onChange: (pitches: string[]) => void;
  clubId?: string;
  isTournament?: boolean;
}

export default function PitchSelector({ 
  selectedPitches, 
  onChange, 
  clubId,
  isTournament = false 
}: PitchSelectorProps) {
  const [pitches, setPitches] = useState<PitchLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        const url = clubId 
          ? `/api/pitch-locations?clubId=${clubId}`
          : '/api/pitch-locations';
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPitches(data);
        }
      } catch (error) {
        console.error('Error fetching pitches:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPitches();
  }, [clubId]);

  const handlePitchToggle = (pitchId: string) => {
    if (selectedPitches.includes(pitchId)) {
      onChange(selectedPitches.filter(id => id !== pitchId));
    } else {
      if (isTournament) {
        onChange([...selectedPitches, pitchId]);
      } else {
        onChange([pitchId]);
      }
    }
  };

  const filteredPitches = pitches.filter(pitch => 
    pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pitch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pitch.club?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg mb-3"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          placeholder="Search pitches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
        />
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-xl p-3">
        {filteredPitches.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {searchTerm ? 'No pitches found' : 'No pitches available'}
          </p>
        ) : (
          filteredPitches.map(pitch => (
            <label
              key={pitch.id}
              className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedPitches.includes(pitch.id)
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPitches.includes(pitch.id)}
                onChange={() => handlePitchToggle(pitch.id)}
                className="mt-1 w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{pitch.name}</div>
                <div className="text-sm text-gray-600">
                  {pitch.city}
                  {pitch.address && ` • ${pitch.address}`}
                </div>
                {pitch.club && (
                  <div className="text-xs text-gray-500 mt-1">
                    {pitch.club.name}
                  </div>
                )}
              </div>
            </label>
          ))
        )}
      </div>

      {isTournament && selectedPitches.length > 0 && (
        <p className="text-sm text-gray-600">
          {selectedPitches.length} pitch{selectedPitches.length !== 1 ? 'es' : ''} selected
        </p>
      )}
    </div>
  );
}