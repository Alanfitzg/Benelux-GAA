"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Team {
  id: string;
  teamName: string;
  club: {
    name: string;
  };
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  round?: string;
}

interface PlayerAward {
  awardType: string;
  playerName: string;
  teamName: string;
}

interface ParticipatingTeam {
  teamId: string;
  teamName: string;
  clubName: string;
  finalPosition?: number;
}

interface InitialData {
  status?: 'DRAFT' | 'PUBLISHED';
  winnerTeamId?: string;
  runnerUpTeamId?: string;
  thirdPlaceTeamId?: string;
  participatingTeams?: ParticipatingTeam[];
  playerAwards?: PlayerAward[];
  amenitiesProvided?: string;
  eventHighlights?: string;
  summary?: string;
}

interface EventReportFormProps {
  eventId: string;
  eventType: string;
  onSuccess?: () => void;
  initialData?: InitialData;
}

export default function EventReportForm({ 
  eventId, 
  eventType,
  onSuccess,
  initialData 
}: EventReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(
    initialData?.status || 'DRAFT'
  );
  const [winnerTeamId, setWinnerTeamId] = useState(initialData?.winnerTeamId || '');
  const [runnerUpTeamId, setRunnerUpTeamId] = useState(initialData?.runnerUpTeamId || '');
  const [thirdPlaceTeamId, setThirdPlaceTeamId] = useState(initialData?.thirdPlaceTeamId || '');
  
  const [participatingTeams, setParticipatingTeams] = useState<ParticipatingTeam[]>(
    initialData?.participatingTeams || []
  );
  
  const [playerAwards, setPlayerAwards] = useState<PlayerAward[]>(
    initialData?.playerAwards || []
  );
  
  const [amenitiesProvided, setAmenitiesProvided] = useState(
    initialData?.amenitiesProvided || ''
  );
  const [eventHighlights, setEventHighlights] = useState(
    initialData?.eventHighlights || ''
  );
  const [summary, setSummary] = useState(initialData?.summary || '');

  useEffect(() => {
    fetchEventData();
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEventData = async () => {
    try {
      if (eventType === 'Tournament') {
        const [teamsRes, matchesRes] = await Promise.all([
          fetch(`/api/tournaments/${eventId}/teams`),
          fetch(`/api/tournaments/${eventId}/matches`)
        ]);

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData);
          
          if (!initialData?.participatingTeams) {
            setParticipatingTeams(
              teamsData.map((team: Team) => ({
                teamId: team.id,
                teamName: team.teamName,
                clubName: team.club.name,
              }))
            );
          }
        }

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData);
        }
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const addPlayerAward = () => {
    setPlayerAwards([
      ...playerAwards,
      { awardType: '', playerName: '', teamName: '' }
    ]);
  };

  const updatePlayerAward = (index: number, field: keyof PlayerAward, value: string) => {
    const updated = [...playerAwards];
    updated[index] = { ...updated[index], [field]: value };
    setPlayerAwards(updated);
  };

  const removePlayerAward = (index: number) => {
    setPlayerAwards(playerAwards.filter((_, i) => i !== index));
  };

  const updateTeamPosition = (teamId: string, position: number | undefined) => {
    setParticipatingTeams(prev => 
      prev.map(team => 
        team.teamId === teamId 
          ? { ...team, finalPosition: position }
          : team
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const matchResults = matches
        .filter(match => match.homeScore !== undefined && match.awayScore !== undefined)
        .map(match => ({
          matchId: match.id,
          homeTeam: match.homeTeam.teamName,
          awayTeam: match.awayTeam.teamName,
          homeScore: match.homeScore!,
          awayScore: match.awayScore!,
          round: match.round,
        }));

      const data = {
        status,
        winnerTeamId: winnerTeamId || null,
        runnerUpTeamId: runnerUpTeamId || null,
        thirdPlaceTeamId: thirdPlaceTeamId || null,
        participatingTeams: participatingTeams.length > 0 ? participatingTeams : null,
        matchResults: matchResults.length > 0 ? matchResults : null,
        playerAwards: playerAwards.filter(award => award.playerName && award.awardType).length > 0 
          ? playerAwards.filter(award => award.playerName && award.awardType)
          : null,
        amenitiesProvided: amenitiesProvided || null,
        eventHighlights: eventHighlights || null,
        summary: summary || null,
      };

      const response = await fetch(`/api/events/${eventId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save report');
      }

      toast.success(
        status === 'PUBLISHED' 
          ? 'Event report published successfully!' 
          : 'Event report saved as draft!'
      );
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Report Status</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="DRAFT"
              checked={status === 'DRAFT'}
              onChange={(e) => setStatus(e.target.value as 'DRAFT')}
            />
            <span>Save as Draft</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="PUBLISHED"
              checked={status === 'PUBLISHED'}
              onChange={(e) => setStatus(e.target.value as 'PUBLISHED')}
            />
            <span>Publish Report</span>
          </label>
        </div>
      </div>

      {/* Tournament Results (for tournaments only) */}
      {eventType === 'Tournament' && teams.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Tournament Results</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Winner</label>
              <select
                value={winnerTeamId}
                onChange={(e) => setWinnerTeamId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select winner...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.teamName} ({team.club.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Runner-up</label>
              <select
                value={runnerUpTeamId}
                onChange={(e) => setRunnerUpTeamId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select runner-up...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.teamName} ({team.club.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Third Place</label>
              <select
                value={thirdPlaceTeamId}
                onChange={(e) => setThirdPlaceTeamId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select third place...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.teamName} ({team.club.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Final Positions */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Final Positions</h4>
            <div className="space-y-2">
              {participatingTeams.map(team => (
                <div key={team.teamId} className="flex items-center gap-4">
                  <span className="flex-1">{team.teamName} ({team.clubName})</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Position"
                    value={team.finalPosition || ''}
                    onChange={(e) => updateTeamPosition(
                      team.teamId, 
                      e.target.value ? parseInt(e.target.value) : undefined
                    )}
                    className="w-24 p-2 border rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Awards */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Player Awards (Optional)</h3>
          <button
            type="button"
            onClick={addPlayerAward}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Add Award
          </button>
        </div>

        {playerAwards.length > 0 && (
          <div className="space-y-3">
            {playerAwards.map((award, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  placeholder="Award type (e.g., MVP, Top Scorer)"
                  value={award.awardType}
                  onChange={(e) => updatePlayerAward(index, 'awardType', e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Player name"
                  value={award.playerName}
                  onChange={(e) => updatePlayerAward(index, 'playerName', e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Team name"
                  value={award.teamName}
                  onChange={(e) => updatePlayerAward(index, 'teamName', e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removePlayerAward(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Event Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amenities Provided
            </label>
            <textarea
              value={amenitiesProvided}
              onChange={(e) => setAmenitiesProvided(e.target.value)}
              placeholder="Example: Lunch and refreshments were provided for all teams. Post-tournament dinner at the clubhouse with presentations. Water stations available throughout the day."
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Event Highlights
            </label>
            <textarea
              value={eventHighlights}
              onChange={(e) => setEventHighlights(e.target.value)}
              placeholder="Key moments, exciting matches, notable performances..."
              rows={4}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Overall Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide an overall summary of the event..."
              rows={5}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={() => setStatus('DRAFT')}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Save as Draft
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : status === 'PUBLISHED' ? 'Publish Report' : 'Save Draft'}
        </button>
      </div>
    </form>
  );
}