import { useState, useCallback } from 'react';
import { Event, TournamentTeam, Match } from '@/types';
import toast from 'react-hot-toast';

export interface EventManager {
  // State
  event: Event | null;
  teams: TournamentTeam[];
  matches: Match[];
  isLoading: boolean;
  
  // Actions
  updateEvent: (updates: Partial<Event>) => Promise<boolean>;
  addTeam: (team: Omit<TournamentTeam, 'id'>) => Promise<boolean>;
  removeTeam: (teamId: string) => Promise<boolean>;
  updateTeam: (teamId: string, updates: Partial<TournamentTeam>) => Promise<boolean>;
  generateBracket: (bracketType?: string) => Promise<boolean>;
  updateMatchResult: (matchId: string, homeScore: number, awayScore: number) => Promise<boolean>;
  updateEventStatus: (status: string) => Promise<boolean>;
  bulkAddTeams: (teams: Array<Omit<TournamentTeam, 'id'>>) => Promise<{success: number, failed: number}>;
  
  // Utilities
  getEventStats: () => {
    totalTeams: number;
    teamsByDivision: Map<string, number>;
    completedMatches: number;
    upcomingMatches: number;
    nextMatch: Match | null;
  };
}

export function useEventManager(
  initialEvent: Event | null,
  initialTeams: TournamentTeam[] = [],
  initialMatches: Match[] = []
): EventManager {
  const [event, setEvent] = useState<Event | null>(initialEvent);
  const [teams, setTeams] = useState<TournamentTeam[]>(initialTeams);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isLoading, setIsLoading] = useState(false);

  const updateEvent = useCallback(async (updates: Partial<Event>): Promise<boolean> => {
    if (!event) return false;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvent(updatedEvent);
        toast.success('Event updated successfully');
        return true;
      } else {
        toast.error('Failed to update event');
        return false;
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const addTeam = useCallback(async (team: Omit<TournamentTeam, 'id'>): Promise<boolean> => {
    if (!event) return false;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team)
      });

      if (response.ok) {
        const newTeam = await response.json();
        setTeams(prev => [...prev, newTeam]);
        toast.success('Team added successfully');
        return true;
      } else {
        toast.error('Failed to add team');
        return false;
      }
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Failed to add team');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const bulkAddTeams = useCallback(async (
    teamsToAdd: Array<Omit<TournamentTeam, 'id'>>
  ): Promise<{success: number, failed: number}> => {
    if (!event) return { success: 0, failed: teamsToAdd.length };
    
    setIsLoading(true);
    let success = 0;
    let failed = 0;
    const newTeams: TournamentTeam[] = [];

    try {
      for (const team of teamsToAdd) {
        try {
          const response = await fetch(`/api/tournaments/${event.id}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(team)
          });

          if (response.ok) {
            const newTeam = await response.json();
            newTeams.push(newTeam);
            success++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error('Error adding team:', team.teamName, error);
          failed++;
        }
      }

      if (newTeams.length > 0) {
        setTeams(prev => [...prev, ...newTeams]);
      }

      if (success > 0) {
        toast.success(`Successfully added ${success} team${success > 1 ? 's' : ''}`);
      }
      if (failed > 0) {
        toast.error(`Failed to add ${failed} team${failed > 1 ? 's' : ''}`);
      }

      return { success, failed };
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const removeTeam = useCallback(async (teamId: string): Promise<boolean> => {
    if (!event) return false;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/teams/${teamId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTeams(prev => prev.filter(team => team.id !== teamId));
        toast.success('Team removed successfully');
        return true;
      } else {
        toast.error('Failed to remove team');
        return false;
      }
    } catch (error) {
      console.error('Error removing team:', error);
      toast.error('Failed to remove team');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const updateTeam = useCallback(async (
    teamId: string, 
    updates: Partial<TournamentTeam>
  ): Promise<boolean> => {
    if (!event) return false;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeams(prev => prev.map(team => 
          team.id === teamId ? updatedTeam : team
        ));
        toast.success('Team updated successfully');
        return true;
      } else {
        toast.error('Failed to update team');
        return false;
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const generateBracket = useCallback(async (bracketType = 'SINGLE_ELIMINATION'): Promise<boolean> => {
    if (!event) return false;
    
    if (teams.length < 2) {
      toast.error('Need at least 2 teams to generate bracket');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/bracket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bracketType })
      });

      if (response.ok) {
        const { matches: newMatches, event: updatedEvent } = await response.json();
        setMatches(newMatches);
        setEvent(updatedEvent);
        toast.success('Bracket generated successfully!', { icon: '🏆' });
        return true;
      } else {
        toast.error('Failed to generate bracket');
        return false;
      }
    } catch (error) {
      console.error('Error generating bracket:', error);
      toast.error('Failed to generate bracket');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [event, teams.length]);

  const updateMatchResult = useCallback(async (
    matchId: string, 
    homeScore: number, 
    awayScore: number
  ): Promise<boolean> => {
    if (!event) return false;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          homeScore, 
          awayScore, 
          status: 'COMPLETED' 
        })
      });

      if (response.ok) {
        const updatedMatch = await response.json();
        setMatches(prev => prev.map(match => 
          match.id === matchId ? updatedMatch : match
        ));
        toast.success('Match result updated');
        return true;
      } else {
        toast.error('Failed to update match result');
        return false;
      }
    } catch (error) {
      console.error('Error updating match result:', error);
      toast.error('Failed to update match result');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const updateEventStatus = useCallback(async (status: string): Promise<boolean> => {
    if (!event) return false;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setEvent(prev => prev ? { ...prev, status: status as 'UPCOMING' | 'ACTIVE' | 'CLOSED' } : null);
        toast.success(`Event status updated to ${status}`);
        return true;
      } else {
        toast.error('Failed to update event status');
        return false;
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const getEventStats = useCallback(() => {
    const totalTeams = teams.length;
    const teamsByDivision = new Map<string, number>();
    
    teams.forEach(team => {
      const key = team.division || 'No Division';
      teamsByDivision.set(key, (teamsByDivision.get(key) || 0) + 1);
    });

    const completedMatches = matches.filter(m => m.status === 'COMPLETED').length;
    const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED').length;
    
    const nextMatch = matches
      .filter(m => m.status === 'SCHEDULED' && m.matchDate)
      .sort((a, b) => new Date(a.matchDate!).getTime() - new Date(b.matchDate!).getTime())[0] || null;

    return {
      totalTeams,
      teamsByDivision,
      completedMatches,
      upcomingMatches,
      nextMatch
    };
  }, [teams, matches]);

  return {
    event,
    teams,
    matches,
    isLoading,
    updateEvent,
    addTeam,
    removeTeam,
    updateTeam,
    generateBracket,
    updateMatchResult,
    updateEventStatus,
    bulkAddTeams,
    getEventStats
  };
}