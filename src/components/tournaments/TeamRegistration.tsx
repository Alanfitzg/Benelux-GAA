"use client";

import React, { useState, useEffect } from "react";
import { Event, Club } from "@/types";
import toast from "react-hot-toast";

interface TeamRegistrationProps {
  event: Event;
  onTeamAdded: () => void;
  isAdmin: boolean;
}

export default function TeamRegistration({
  event,
  onTeamAdded,
  isAdmin,
}: TeamRegistrationProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [teamType, setTeamType] = useState("");
  const [division, setDivision] = useState("");
  const [bulkSelections, setBulkSelections] = useState<{teamType: string; division?: string}[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  useEffect(() => {
    if (showForm || showBulkForm) {
      fetchClubs();
    }
  }, [showForm, showBulkForm]);

  const fetchClubs = async () => {
    setLoadingClubs(true);
    try {
      const response = await fetch("/api/clubs/simple");
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoadingClubs(false);
    }
  };


  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedClubs.length === 0) {
      toast.error("Please select at least one club");
      return;
    }

    if (bulkSelections.length === 0) {
      toast.error("Please select at least one sport/division combination");
      return;
    }

    setIsRegistering(true);
    let successCount = 0;
    const failed: string[] = [];

    // Register each club for each selected sport/division combination
    for (const clubId of selectedClubs) {
      const selectedClub = clubs.find(c => c.id === clubId);
      
      for (const selection of bulkSelections) {
        const teamName = `${selectedClub?.name || 'Unknown'} ${selection.division || selection.teamType}`;

        try {
          const response = await fetch(`/api/tournaments/${event.id}/teams`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clubId,
              teamName,
              teamType: selection.teamType,
              division: selection.division,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failed.push(`${selectedClub?.name} - ${selection.division || selection.teamType}`);
          }
        } catch (error) {
          console.error(`Error registering team for club ${clubId}:`, error);
          failed.push(`${selectedClub?.name} - ${selection.division || selection.teamType}`);
        }
      }
    }

    setIsRegistering(false);
    
    if (successCount > 0) {
      toast.success(`Successfully registered ${successCount} team${successCount > 1 ? 's' : ''}!`, {
        icon: "🎉",
        duration: 4000,
      });
      setShowBulkForm(false);
      setSelectedClubs([]);
      setBulkSelections([]);
      onTeamAdded();
    }
    
    if (failed.length > 0) {
      toast.error(`Failed to register: ${failed.slice(0, 3).join(', ')}${failed.length > 3 ? ` and ${failed.length - 3} more` : ''}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClubId || !teamType) {
      toast.error("Please fill in all fields");
      return;
    }

    if (event.divisions && event.divisions.length > 0 && !division) {
      toast.error("Please select a division");
      return;
    }

    // Generate team name from club and team type/division
    const selectedClub = clubs.find(c => c.id === selectedClubId);
    const teamName = `${selectedClub?.name || 'Unknown'} ${division || teamType}`;

    setIsRegistering(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId: selectedClubId,
          teamName,
          teamType,
          division: event.divisions && event.divisions.length > 0 ? division : undefined,
        }),
      });

      if (response.ok) {
        toast.success("Team registered successfully!", {
          icon: "🎉",
          duration: 4000,
        });
        setShowForm(false);
        setSelectedClubId("");
        setTeamType("");
        setDivision("");
        onTeamAdded();
      } else {
        const error = await response.json();
        toast.error(`Failed to register team: ${error.error}`);
      }
    } catch (error) {
      console.error("Error registering team:", error);
      toast.error("Failed to register team");
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const canAddMoreTeams = !event.maxTeams || (event.teams?.length || 0) < event.maxTeams;

  if (!canAddMoreTeams) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          Maximum number of teams ({event.maxTeams}) has been reached for this tournament.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      {!showForm && !showBulkForm ? (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-900">Admin Team Registration</p>
            <p className="text-xs text-blue-700 mt-1">
              {event.teams?.length || 0} / {event.maxTeams || "∞"} teams registered
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add Team
            </button>
            <button
              type="button"
              onClick={() => setShowBulkForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Add Multiple Teams
            </button>
          </div>
        </div>
      ) : showBulkForm ? (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-blue-900">Register Multiple Teams</h3>
            <button
              type="button"
              onClick={() => {
                setShowBulkForm(false);
                setSelectedClubs([]);
                setBulkSelections([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Clubs ({selectedClubs.length} selected)
            </label>
            <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
              {loadingClubs ? (
                <p className="text-sm text-gray-500 p-2">Loading clubs...</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 p-2 border-b">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectedClubs.length === clubs.length && clubs.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClubs(clubs.map(c => c.id));
                        } else {
                          setSelectedClubs([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                      Select All
                    </label>
                  </div>
                  {clubs.map((club) => (
                    <div key={club.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`club-${club.id}`}
                        value={club.id}
                        checked={selectedClubs.includes(club.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClubs([...selectedClubs, club.id]);
                          } else {
                            setSelectedClubs(selectedClubs.filter(id => id !== club.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`club-${club.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                        {club.name} {club.location ? `- ${club.location}` : ""}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Sport/Division Combinations ({bulkSelections.length} selected)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 space-y-2">
              {event.acceptedTeamTypes && event.acceptedTeamTypes.length > 0 ? (
                event.acceptedTeamTypes.map((type) => (
                  <div key={type} className="space-y-1">
                    <div className="font-medium text-sm text-gray-700">{type}</div>
                    {event.divisions && event.divisions.length > 0 ? (
                      event.divisions.map((div) => (
                        <div key={`${type}-${div}`} className="flex items-center gap-2 pl-4">
                          <input
                            type="checkbox"
                            id={`bulk-${type}-${div}`}
                            checked={bulkSelections.some(s => s.teamType === type && s.division === div)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelections([...bulkSelections, { teamType: type, division: div }]);
                              } else {
                                setBulkSelections(bulkSelections.filter(s => !(s.teamType === type && s.division === div)));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`bulk-${type}-${div}`} className="text-sm text-gray-600 cursor-pointer">
                            {div}
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 pl-4">
                        <input
                          type="checkbox"
                          id={`bulk-${type}`}
                          checked={bulkSelections.some(s => s.teamType === type && !s.division)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkSelections([...bulkSelections, { teamType: type }]);
                            } else {
                              setBulkSelections(bulkSelections.filter(s => !(s.teamType === type && !s.division)));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`bulk-${type}`} className="text-sm text-gray-600 cursor-pointer">
                          Default Division
                        </label>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <>
                  {["Senior Men", "Senior Women", "Junior Boys", "Junior Girls", "Mixed"].map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`bulk-${type}`}
                        checked={bulkSelections.some(s => s.teamType === type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelections([...bulkSelections, { teamType: type }]);
                          } else {
                            setBulkSelections(bulkSelections.filter(s => s.teamType !== type));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`bulk-${type}`} className="text-sm text-gray-700 cursor-pointer">
                        {type}
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>
            {bulkSelections.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                This will create {selectedClubs.length} × {bulkSelections.length} = {selectedClubs.length * bulkSelections.length} teams total
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isRegistering || selectedClubs.length === 0 || bulkSelections.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isRegistering ? `Registering ${selectedClubs.length * bulkSelections.length} teams...` : `Register ${selectedClubs.length * bulkSelections.length} Teams`}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBulkForm(false);
                setSelectedClubs([]);
                setBulkSelections([]);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-blue-900">Register New Team</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label htmlFor="club" className="block text-sm font-medium text-gray-700 mb-1">
              Select Club
            </label>
            <select
              id="club"
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              disabled={loadingClubs}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">
                {loadingClubs ? "Loading clubs..." : "Select a club"}
              </option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} {club.location ? `- ${club.location}` : ""}
                </option>
              ))}
            </select>
          </div>


          {event.divisions && event.divisions.length > 0 && (
            <div>
              <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">
                Division
              </label>
              <select
                id="division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select division</option>
                {event.divisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="teamType" className="block text-sm font-medium text-gray-700 mb-1">
              Team Type
            </label>
            <select
              id="teamType"
              value={teamType}
              onChange={(e) => setTeamType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select team type</option>
              {event.acceptedTeamTypes && event.acceptedTeamTypes.length > 0 ? (
                event.acceptedTeamTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))
              ) : (
                <>
                  <option value="Senior Men">Senior Men</option>
                  <option value="Senior Women">Senior Women</option>
                  <option value="Junior Boys">Junior Boys</option>
                  <option value="Junior Girls">Junior Girls</option>
                  <option value="Mixed">Mixed</option>
                </>
              )}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isRegistering}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isRegistering ? "Registering..." : "Register Team"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}