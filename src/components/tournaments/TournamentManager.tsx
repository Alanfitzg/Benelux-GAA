"use client";

import React, { useState } from "react";
import { Event, TournamentTeam, Match } from "@/types";
import TeamRegistration from "./TeamRegistration";
import BracketVisualization from "./BracketVisualization";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface TournamentManagerProps {
  event: Event;
  teams: TournamentTeam[];
  matches: Match[];
  isAdmin: boolean;
  onTeamUpdate: () => void;
}

type TabType = "teams" | "bracket" | "matches" | "settings";

export default function TournamentManager({
  event,
  teams,
  matches,
  isAdmin,
  onTeamUpdate,
}: TournamentManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("teams");
  const [isGeneratingBracket, setIsGeneratingBracket] = useState(false);
  const router = useRouter();

  const handleGenerateBracket = async () => {
    if (teams.length < 2) {
      toast.error("Need at least 2 teams to generate a bracket");
      return;
    }

    if (
      event.bracketType &&
      !confirm(
        "This will regenerate the bracket. Existing bracket data will be lost. Continue?"
      )
    ) {
      return;
    }

    setIsGeneratingBracket(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/bracket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bracketType: "SINGLE_ELIMINATION",
        }),
      });

      if (response.ok) {
        toast.success("Bracket generated successfully!", {
          icon: "🏆",
          duration: 4000,
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

  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "teams",
      label: "Teams",
      icon: "👥",
      description: "Manage registered teams",
    },
    {
      id: "bracket",
      label: "Bracket",
      icon: "🏆",
      description: "View and generate tournament brackets",
    },
    {
      id: "matches",
      label: "Matches",
      icon: "⚽",
      description: "Schedule and manage matches",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      description: "Tournament configuration",
    },
  ];

  const getTeamStats = () => {
    const byDivision: { [key: string]: number } = {};
    const byTeamType: { [key: string]: number } = {};

    teams.forEach((team) => {
      const division = team.division || "Open";
      const teamType = team.teamType;

      byDivision[division] = (byDivision[division] || 0) + 1;
      byTeamType[teamType] = (byTeamType[teamType] || 0) + 1;
    });

    return { byDivision, byTeamType };
  };

  const stats = getTeamStats();

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xl font-bold">Tournament Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          {teams.length} teams registered{" "}
          {event.maxTeams && `/ ${event.maxTeams} max`}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex space-x-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? "text-primary border-primary bg-white"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "teams" && (
          <div className="space-y-6">
            {/* Team Registration (Admin Only) */}
            {isAdmin && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Add Teams</h3>
                <TeamRegistration
                  event={event}
                  onTeamAdded={onTeamUpdate}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* Team Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Team Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    By Division
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(stats.byDivision).map(
                      ([division, count]) => (
                        <div
                          key={division}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{division}</span>
                          <span className="font-medium">{count} teams</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    By Sport Type
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(stats.byTeamType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-600">{type}</span>
                        <span className="font-medium">{count} teams</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Teams List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Registered Teams</h3>
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="bg-gray-50 rounded-lg p-3 hover:shadow-md hover:bg-white transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{team.teamName}</p>
                          <p className="text-xs text-gray-600">
                            {team.club?.name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            team.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800"
                              : team.status === "WITHDRAWN"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {team.status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {team.teamType}
                        </span>
                        {team.division && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {team.division}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No teams registered yet</p>
                  {isAdmin && (
                    <p className="text-sm text-gray-400 mt-2">
                      Use the form above to add teams to the tournament
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "bracket" && (
          <div className="space-y-6">
            {/* Bracket Generation Controls (Admin Only) */}
            {isAdmin && (
              <div className="bg-blue-50/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">
                      Bracket Generation
                    </h3>
                    <p className="text-xs text-blue-700 mt-1">
                      {event.bracketType
                        ? `Current: ${event.bracketType.replace(/_/g, " ")}`
                        : "No bracket generated yet"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateBracket}
                    disabled={isGeneratingBracket || teams.length < 2}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 text-sm font-medium"
                  >
                    {isGeneratingBracket
                      ? "Generating..."
                      : event.bracketType
                        ? "Regenerate"
                        : "Generate"}{" "}
                    Bracket
                  </button>
                </div>
              </div>
            )}

            {/* Bracket Visualization */}
            {matches.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Tournament Bracket
                </h3>
                <BracketVisualization
                  matches={matches}
                  teams={teams}
                  bracketType={event.bracketType}
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No bracket generated yet</p>
                {isAdmin && teams.length >= 2 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Click &quot;Generate Bracket&quot; above to create the
                    tournament bracket
                  </p>
                )}
                {teams.length < 2 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Need at least 2 teams to generate a bracket
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Match Schedule</h3>
            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-primary">
                        {match.round}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          match.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : match.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {match.homeTeam?.teamName || "TBD"}
                      </span>
                      <span className="text-xs text-gray-500">vs</span>
                      <span className="text-sm">
                        {match.awayTeam?.teamName || "TBD"}
                      </span>
                    </div>
                    {(match.venue || match.matchDate) && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                        {match.venue && <span>📍 {match.venue}</span>}
                        {match.matchDate && (
                          <span className="ml-4">
                            📅 {new Date(match.matchDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No matches scheduled yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Generate a bracket first to create matches
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Tournament Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Tournament Type
                </h4>
                <p className="text-sm text-gray-600">
                  {event.bracketType || "Not set"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Team Limits
                </h4>
                <p className="text-sm text-gray-600">
                  Min: {event.minTeams || "None"} / Max:{" "}
                  {event.maxTeams || "Unlimited"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Divisions
                </h4>
                <div className="flex flex-wrap gap-1">
                  {event.divisions?.map((div) => (
                    <span
                      key={div}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {div}
                    </span>
                  )) || (
                    <span className="text-sm text-gray-600">
                      No divisions set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Accepted Team Types
                </h4>
                <div className="flex flex-wrap gap-1">
                  {event.acceptedTeamTypes?.map((type) => (
                    <span
                      key={type}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {type}
                    </span>
                  )) || (
                    <span className="text-sm text-gray-600">
                      All types accepted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                >
                  Edit Tournament Settings
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
