"use client";

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  eventId: string;
  status: 'DRAFT' | 'PUBLISHED';
  winnerTeam?: {
    teamName: string;
    club: { name: string };
  };
  runnerUpTeam?: {
    teamName: string;
    club: { name: string };
  };
  thirdPlaceTeam?: {
    teamName: string;
    club: { name: string };
  };
  participatingTeams?: Array<{
    teamId: string;
    teamName: string;
    clubName: string;
    finalPosition?: number;
  }>;
  matchResults?: Array<{
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    round?: string;
  }>;
  playerAwards?: Array<{
    awardType: string;
    playerName: string;
    teamName: string;
  }>;
  amenitiesProvided?: string;
  eventHighlights?: string;
  summary?: string;
  publishedAt?: string;
  updatedAt: string;
  creator?: {
    name?: string;
    email: string;
  };
}

interface EventReportDisplayProps {
  eventId: string;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function EventReportDisplay({ 
  eventId, 
  isAdmin = false,
  onEdit 
}: EventReportDisplayProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/report`);
      
      if (response.status === 404) {
        setReport(null);
        setError(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setReport(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      // Only log actual errors, not expected 404s
      if (err instanceof Error && !err.message.includes('404')) {
        console.error('Error fetching report:', err);
      }
      setError('Failed to load event report');
      setReport(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (!report) {
    if (isAdmin) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No event report has been created yet.</p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Create Event Report
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  const participatingTeams = report.participatingTeams || [];
  const matchResults = report.matchResults || [];
  const playerAwards = report.playerAwards || [];

  return (
    <div className="space-y-8">
      {/* Header with Edit Button */}
      {isAdmin && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Event Report</h2>
            {report.status === 'DRAFT' && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Draft
              </span>
            )}
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Edit Report
            </button>
          )}
        </div>
      )}

      {/* Tournament Results */}
      {(report.winnerTeam || report.runnerUpTeam || report.thirdPlaceTeam) && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🏆 Tournament Results</h3>
          
          <div className="space-y-3">
            {report.winnerTeam && (
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥇</span>
                <div>
                  <div className="font-semibold text-lg">Champion</div>
                  <div className="text-gray-700">
                    {report.winnerTeam.teamName} ({report.winnerTeam.club.name})
                  </div>
                </div>
              </div>
            )}
            
            {report.runnerUpTeam && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥈</span>
                <div>
                  <div className="font-semibold">Runner-up</div>
                  <div className="text-gray-700">
                    {report.runnerUpTeam.teamName} ({report.runnerUpTeam.club.name})
                  </div>
                </div>
              </div>
            )}
            
            {report.thirdPlaceTeam && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥉</span>
                <div>
                  <div className="font-semibold">Third Place</div>
                  <div className="text-gray-700">
                    {report.thirdPlaceTeam.teamName} ({report.thirdPlaceTeam.club.name})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Summary */}
      {report.summary && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-3">Event Summary</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{report.summary}</p>
        </div>
      )}

      {/* Event Highlights */}
      {report.eventHighlights && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-3">Event Highlights</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{report.eventHighlights}</p>
        </div>
      )}

      {/* Participating Teams */}
      {participatingTeams.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">Participating Teams</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {participatingTeams
              .sort((a, b) => (a.finalPosition || 999) - (b.finalPosition || 999))
              .map((team) => (
                <div key={team.teamId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{team.teamName}</div>
                    <div className="text-sm text-gray-600">{team.clubName}</div>
                  </div>
                  {team.finalPosition && (
                    <div className="text-lg font-semibold text-gray-700">
                      #{team.finalPosition}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Match Results */}
      {matchResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">Match Results</h3>
          <div className="space-y-3">
            {matchResults.map((match, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-4 flex-1">
                  {match.round && (
                    <span className="text-sm font-medium text-gray-600 min-w-[80px]">
                      {match.round}
                    </span>
                  )}
                  <div className="flex items-center gap-3 flex-1">
                    <span className={match.homeScore > match.awayScore ? 'font-semibold' : ''}>
                      {match.homeTeam}
                    </span>
                    <span className="font-bold text-lg">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <span className={match.awayScore > match.homeScore ? 'font-semibold' : ''}>
                      {match.awayTeam}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Awards */}
      {playerAwards.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">🌟 Player Awards</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {playerAwards.map((award, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="font-semibold text-blue-900">{award.awardType}</div>
                <div className="text-lg font-medium mt-1">{award.playerName}</div>
                <div className="text-sm text-gray-600">{award.teamName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities Provided */}
      {report.amenitiesProvided && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-3">Event Amenities</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{report.amenitiesProvided}</p>
        </div>
      )}

      {/* Report Metadata */}
      <div className="text-sm text-gray-500 text-right">
        {report.publishedAt ? (
          <span>
            Published {formatDistanceToNow(new Date(report.publishedAt), { addSuffix: true })}
          </span>
        ) : (
          <span>
            Last updated {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
          </span>
        )}
        {report.creator && (
          <span className="ml-2">
            by {report.creator.name || report.creator.email}
          </span>
        )}
      </div>
    </div>
  );
}