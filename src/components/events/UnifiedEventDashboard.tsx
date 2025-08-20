"use client";

import React, { useState } from "react";
import { Event, TournamentTeam, Match } from "@/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface UnifiedEventDashboardProps {
  event: Event;
  teams: TournamentTeam[];
  matches: Match[];
  isClubAdmin: boolean;
}

type EventStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED';

const statusFlow: EventStatus[] = ['UPCOMING', 'ACTIVE', 'CLOSED'];

const statusConfig = {
  UPCOMING: {
    label: 'Upcoming',
    color: 'bg-blue-100 text-blue-700',
    icon: '📅',
    description: 'Event is scheduled and accepting registrations'
  },
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    icon: '🔥',
    description: 'Event is live and in progress'
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-700',
    icon: '✅',
    description: 'Event completed with final results'
  }
} as const;

export default function UnifiedEventDashboard({
  event,
  teams,
  matches,
  isClubAdmin
}: UnifiedEventDashboardProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isGeneratingBracket, setIsGeneratingBracket] = useState(false);
  const [showResultsEditor, setShowResultsEditor] = useState(false);
  const router = useRouter();

  const currentStatus = (event.status as EventStatus) || 'UPCOMING';
  const currentStatusIndex = statusFlow.indexOf(currentStatus);
  const nextStatus = statusFlow[currentStatusIndex + 1];

  const handleStatusUpdate = async (newStatus: EventStatus) => {
    // Validation checks
    if (newStatus === 'ACTIVE' && teams.length < (event.minTeams || 2)) {
      toast.error(`Need at least ${event.minTeams || 2} teams to start the event`);
      return;
    }

    if (newStatus === 'CLOSED' && !event.report) {
      toast.error("Cannot close event without results. Please add results first.");
      return;
    }

    if (!confirm(`Are you sure you want to change the event status to ${newStatus}?`)) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/events/${event.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Event status updated to ${newStatus}`, {
          icon: statusConfig[newStatus].icon,
          duration: 4000
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(`Failed to update status: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update event status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (teams.length < 2) {
      toast.error("Need at least 2 teams to generate a bracket");
      return;
    }

    if (event.bracketType && !confirm("This will regenerate the bracket. Existing bracket data will be lost. Continue?")) {
      return;
    }

    setIsGeneratingBracket(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/bracket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bracketType: "SINGLE_ELIMINATION" })
      });

      if (response.ok) {
        toast.success("Bracket generated successfully!", {
          icon: "🏆",
          duration: 4000
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(`Failed to generate bracket: ${error.error}`);
      }
    } catch (error) {
      console.error("Error generating bracket:", error);
      toast.error("Failed to generate bracket");
    } finally {
      setIsGeneratingBracket(false);
    }
  };

  const getStatsData = () => {
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.status === 'COMPLETED').length;
    const nextMatch = matches
      .filter(m => m.status === 'SCHEDULED' && m.matchDate)
      .sort((a, b) => new Date(a.matchDate!).getTime() - new Date(b.matchDate!).getTime())[0];

    return {
      teams: { value: teams.length, max: event.maxTeams, label: 'Teams Registered' },
      matches: { value: `${completedMatches}/${totalMatches}`, progress: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0, label: 'Matches Complete' },
      status: { value: statusConfig[currentStatus].label, color: statusConfig[currentStatus].color, label: 'Current Status' },
      nextMatch: nextMatch ? {
        value: new Date(nextMatch.matchDate!).toLocaleString(),
        label: 'Next Match'
      } : null
    };
  };

  const stats = getStatsData();

  if (!isClubAdmin) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">{statusConfig[currentStatus].icon}</span>
            Event Control Center
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your event lifecycle and tournament operations
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Details
          </Link>
        </div>
      </div>

      {/* Status Flow */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h4 className="font-semibold mb-3 text-gray-900">Event Lifecycle</h4>
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => {
            const isCurrent = status === currentStatus;
            const isPassed = index < currentStatusIndex;
            
            return (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isCurrent ? statusConfig[status].color : 
                    isPassed ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {statusConfig[status].icon}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                      {statusConfig[status].label}
                    </p>
                  </div>
                </div>
                {index < statusFlow.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentStatusIndex ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {nextStatus && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={isUpdatingStatus}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {isUpdatingStatus ? 'Updating...' : `Advance to ${statusConfig[nextStatus].label}`}
            </button>
          </div>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{stats.teams.label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.teams.value}
            {stats.teams.max && <span className="text-lg text-gray-400">/{stats.teams.max}</span>}
          </p>
          {stats.teams.max && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(stats.teams.value / stats.teams.max) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{stats.matches.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.matches.value}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${stats.matches.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{stats.status.label}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stats.status.color}`}>
            {stats.status.value}
          </span>
        </div>

        {stats.nextMatch && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{stats.nextMatch.label}</p>
            <p className="text-sm font-medium text-gray-900">{stats.nextMatch.value}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Team Management */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Teams
          </h5>
          <p className="text-sm text-gray-600 mb-3">
            {teams.length} registered
            {event.maxTeams && ` / ${event.maxTeams} max`}
          </p>
          <button
            type="button"
            onClick={() => {
              const element = document.getElementById('team-management');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Manage Teams
          </button>
        </div>

        {/* Tournament Bracket */}
        {event.eventType === 'Tournament' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Bracket
            </h5>
            <p className="text-sm text-gray-600 mb-3">
              {event.bracketType ? `${event.bracketType.replace(/_/g, ' ')}` : 'Not generated'}
            </p>
            <button
              type="button"
              onClick={handleGenerateBracket}
              disabled={isGeneratingBracket || teams.length < 2}
              className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isGeneratingBracket ? 'Generating...' : event.bracketType ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        )}

        {/* Results & Report */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Results
          </h5>
          <p className="text-sm text-gray-600 mb-3">
            {event.report ? 'Report available' : 'No results yet'}
          </p>
          <button
            type="button"
            onClick={() => setShowResultsEditor(!showResultsEditor)}
            className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {event.report ? 'Update Results' : 'Add Results'}
          </button>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </h5>
          <p className="text-sm text-gray-600 mb-3">
            View detailed stats
          </p>
          <button
            type="button"
            onClick={() => toast("Analytics coming soon!")}
            className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Inline Results Editor */}
      {showResultsEditor && (
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-gray-900">Event Results</h5>
            <button
              type="button"
              onClick={() => setShowResultsEditor(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Inline results editor will be implemented here</p>
            <p className="text-sm mt-2">This will replace the separate report page</p>
            <Link
              href={`/events/${event.id}/report?edit=true`}
              className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Open Legacy Report Editor
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}