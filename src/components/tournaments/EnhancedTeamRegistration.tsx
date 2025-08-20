"use client";

import React, { useState, useEffect } from "react";
import { Event, Club } from "@/types";
import toast from "react-hot-toast";
import {
  tournamentTemplates,
  TournamentTemplate,
  TeamRegistrationMatrix,
  generateTeamMatrix,
  calculateTotalTeams,
  getTeamsByDivision
} from "@/lib/tournament-templates";

interface EnhancedTeamRegistrationProps {
  event: Event;
  onTeamsAdded: (count: number) => void;
  isAdmin: boolean;
}

export default function EnhancedTeamRegistration({
  event,
  onTeamsAdded,
  isAdmin
}: EnhancedTeamRegistrationProps) {
  const [step, setStep] = useState<'template' | 'clubs' | 'matrix' | 'review'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<TournamentTemplate | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [teamMatrix, setTeamMatrix] = useState<TeamRegistrationMatrix[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (step === 'clubs') {
      fetchClubs();
    }
  }, [step]);

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/clubs/simple");
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast.error("Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: TournamentTemplate) => {
    setSelectedTemplate(template);
    if (template.id === 'custom') {
      toast("Custom configuration selected - you'll define sports and divisions manually");
    }
    setStep('clubs');
  };

  const handleClubSelection = () => {
    if (selectedClubs.length === 0) {
      toast.error("Please select at least one club");
      return;
    }

    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    const selectedClubsData = clubs.filter(c => selectedClubs.includes(c.id));
    const matrix = generateTeamMatrix(selectedTemplate, selectedClubsData);
    setTeamMatrix(matrix);
    setStep('matrix');
  };

  const toggleTeamParticipation = (clubIndex: number, participationIndex: number) => {
    const newMatrix = [...teamMatrix];
    newMatrix[clubIndex].participations[participationIndex].registered = 
      !newMatrix[clubIndex].participations[participationIndex].registered;
    setTeamMatrix(newMatrix);
  };

  const toggleAllForClub = (clubIndex: number, register: boolean) => {
    const newMatrix = [...teamMatrix];
    newMatrix[clubIndex].participations.forEach(p => p.registered = register);
    setTeamMatrix(newMatrix);
  };

  // const toggleAllForDivision = (sport: string, division: string, register: boolean) => {
  //   const newMatrix = [...teamMatrix];
  //   newMatrix.forEach(club => {
  //     club.participations.forEach(p => {
  //       if (p.sport === sport && p.division === division) {
  //         p.registered = register;
  //       }
  //     });
  //   });
  //   setTeamMatrix(newMatrix);
  // };

  const handleBulkRegister = async () => {
    const teamsToRegister: Array<{
      clubId: string;
      teamName: string;
      teamType: string;
      division: string;
    }> = [];
    
    teamMatrix.forEach(club => {
      club.participations.filter(p => p.registered).forEach(participation => {
        teamsToRegister.push({
          clubId: club.clubId,
          teamName: participation.teamName || `${club.clubName} ${participation.division} ${participation.sport}`,
          teamType: participation.sport,
          division: participation.division
        });
      });
    });

    if (teamsToRegister.length === 0) {
      toast.error("No teams selected for registration");
      return;
    }

    setIsRegistering(true);
    let successCount = 0;
    const failed = [];

    for (const team of teamsToRegister) {
      try {
        const response = await fetch(`/api/tournaments/${event.id}/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(team)
        });

        if (response.ok) {
          successCount++;
        } else {
          failed.push(team.teamName);
        }
      } catch (error) {
        console.error(`Error registering team ${team.teamName}:`, error);
        failed.push(team.teamName);
      }
    }

    setIsRegistering(false);

    if (successCount > 0) {
      toast.success(`Successfully registered ${successCount} team${successCount > 1 ? 's' : ''}!`, {
        icon: "🎉",
        duration: 4000
      });
      onTeamsAdded(successCount);
      resetForm();
    }

    if (failed.length > 0) {
      toast.error(`Failed to register ${failed.length} team(s)`);
    }
  };

  const resetForm = () => {
    setStep('template');
    setSelectedTemplate(null);
    setSelectedClubs([]);
    setTeamMatrix([]);
  };

  if (!isAdmin) {
    return null;
  }

  const totalTeams = calculateTotalTeams(teamMatrix);
  const divisionBreakdown = getTeamsByDivision(teamMatrix);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Smart Team Registration</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded ${step === 'template' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            1. Template
          </span>
          <span className="text-gray-400">→</span>
          <span className={`px-2 py-1 rounded ${step === 'clubs' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            2. Clubs
          </span>
          <span className="text-gray-400">→</span>
          <span className={`px-2 py-1 rounded ${step === 'matrix' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            3. Teams
          </span>
          <span className="text-gray-400">→</span>
          <span className={`px-2 py-1 rounded ${step === 'review' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            4. Review
          </span>
        </div>
      </div>

      {step === 'template' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Select Tournament Template</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournamentTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <h5 className="font-semibold text-primary">{template.name}</h5>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                {template.sports.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Sports:</span> {template.sports.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Divisions:</span> {template.divisions.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Duration:</span> {template.estimatedDuration}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'clubs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-lg">Select Participating Clubs</h4>
            <button
              type="button"
              onClick={() => setStep('template')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>

          {selectedTemplate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Template:</span> {selectedTemplate.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Each club can register up to {selectedTemplate.sports.length * selectedTemplate.divisions.length} teams
              </p>
            </div>
          )}

          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Loading clubs...</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                  <input
                    type="checkbox"
                    id="select-all-clubs"
                    checked={selectedClubs.length === clubs.length && clubs.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClubs(clubs.map(c => c.id));
                      } else {
                        setSelectedClubs([]);
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="select-all-clubs" className="font-medium text-sm">
                    Select All ({clubs.length} clubs)
                  </label>
                </div>
                {clubs.map(club => (
                  <div key={club.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`club-select-${club.id}`}
                      checked={selectedClubs.includes(club.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClubs([...selectedClubs, club.id]);
                        } else {
                          setSelectedClubs(selectedClubs.filter(id => id !== club.id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`club-select-${club.id}`} className="flex-1 cursor-pointer">
                      <span className="text-sm font-medium">{club.name}</span>
                      {club.location && (
                        <span className="text-xs text-gray-500 ml-2">{club.location}</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600">
              {selectedClubs.length} club{selectedClubs.length !== 1 ? 's' : ''} selected
            </p>
            <button
              type="button"
              onClick={handleClubSelection}
              disabled={selectedClubs.length === 0}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Team Selection
            </button>
          </div>
        </div>
      )}

      {step === 'matrix' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-lg">Configure Team Participation</h4>
            <button
              type="button"
              onClick={() => setStep('clubs')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              <span className="font-medium">{totalTeams} teams</span> selected for registration
            </p>
            {divisionBreakdown.size > 0 && (
              <div className="mt-2 text-xs text-green-700">
                {Array.from(divisionBreakdown.entries()).map(([division, count]) => (
                  <span key={division} className="inline-block mr-3">
                    {division}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Club</th>
                  {selectedTemplate?.sports.map(sport => (
                    <th key={sport} colSpan={selectedTemplate.divisions.length} className="text-center p-3 text-sm font-medium border-l">
                      {sport}
                    </th>
                  ))}
                  <th className="text-center p-3 text-sm font-medium border-l">Actions</th>
                </tr>
                <tr className="border-t">
                  <th className="p-2"></th>
                  {selectedTemplate?.sports.flatMap(sport =>
                    selectedTemplate.divisions.map(division => (
                      <th key={`${sport}-${division}`} className="text-center p-2 text-xs text-gray-600 border-l">
                        {division}
                      </th>
                    ))
                  )}
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {teamMatrix.map((club, clubIndex) => (
                  <tr key={club.clubId} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium">{club.clubName}</td>
                    {club.participations.map((participation, pIndex) => (
                      <td key={pIndex} className="text-center p-2 border-l">
                        <input
                          type="checkbox"
                          checked={participation.registered}
                          onChange={() => toggleTeamParticipation(clubIndex, pIndex)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                    ))}
                    <td className="text-center p-2 border-l">
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => toggleAllForClub(clubIndex, true)}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAllForClub(clubIndex, false)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          None
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              <p>{totalTeams} teams ready for registration</p>
              {event.maxTeams && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed: {event.maxTeams} teams
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('review')}
                disabled={totalTeams === 0 || (typeof event.maxTeams === 'number' && totalTeams > event.maxTeams)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review & Register
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-lg">Review & Confirm Registration</h4>
            <button
              type="button"
              onClick={() => setStep('matrix')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-3">Registration Summary</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Total Teams:</p>
                <p className="font-semibold text-xl text-blue-900">{totalTeams}</p>
              </div>
              <div>
                <p className="text-blue-700">Participating Clubs:</p>
                <p className="font-semibold text-xl text-blue-900">{selectedClubs.length}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-3">Teams by Division:</h5>
            <div className="space-y-2">
              {Array.from(divisionBreakdown.entries()).map(([division, count]) => (
                <div key={division} className="flex justify-between text-sm">
                  <span className="text-gray-600">{division}</span>
                  <span className="font-medium">{count} teams</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
            <h5 className="font-medium mb-3">Teams to Register:</h5>
            <div className="space-y-1">
              {teamMatrix.map(club =>
                club.participations
                  .filter(p => p.registered)
                  .map((p, idx) => (
                    <div key={`${club.clubId}-${idx}`} className="text-sm text-gray-600">
                      • {p.teamName || `${club.clubName} ${p.division} ${p.sport}`}
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              This action will register {totalTeams} teams to the tournament
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('matrix')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleBulkRegister}
                disabled={isRegistering}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? `Registering ${totalTeams} teams...` : `Register ${totalTeams} Teams`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}