"use client";

import React, { useState, useEffect } from "react";
import { Event, Club } from "@/types";
import toast from "react-hot-toast";
import { 
  tournamentTemplates, 
  TournamentTemplate, 
  generateTeamCombinations, 
  calculateTotalTeamsFromTemplate,
  validateTemplateCapacity 
} from "@/lib/tournament-templates";

interface BulkTeamRegistrationProps {
  event: Event;
  onComplete: (teamsCreated: number) => void;
  onCancel: () => void;
}

interface ClubSelection {
  id: string;
  name: string;
  location?: string;
  selected: boolean;
  customConfig?: {
    sports: string[];
    divisions: string[];
  };
}

export default function BulkTeamRegistration({
  event,
  onComplete,
  onCancel
}: BulkTeamRegistrationProps) {
  const [step, setStep] = useState<'template' | 'clubs' | 'review'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<TournamentTemplate | null>(null);
  const [clubs, setClubs] = useState<ClubSelection[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");

  useEffect(() => {
    if (step === 'clubs') {
      fetchClubs();
    }
  }, [step]);

  const fetchClubs = async () => {
    setLoadingClubs(true);
    try {
      const response = await fetch("/api/clubs/simple");
      if (response.ok) {
        const data = await response.json();
        setClubs(data.map((club: Club) => ({
          id: club.id,
          name: club.name,
          location: club.location,
          selected: false
        })));
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast.error("Failed to load clubs");
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleTemplateSelect = (template: TournamentTemplate) => {
    setSelectedTemplate(template);
    if (template.id === 'custom') {
      toast("Custom configuration selected - you'll set up teams manually", { icon: '⚙️' });
    }
    setStep('clubs');
  };

  const toggleClubSelection = (clubId: string) => {
    setClubs(clubs.map(club => 
      club.id === clubId ? { ...club, selected: !club.selected } : club
    ));
  };

  const toggleAllClubs = () => {
    const allSelected = filteredClubs.every(c => c.selected);
    setClubs(clubs.map(club => {
      if (filteredClubs.find(fc => fc.id === club.id)) {
        return { ...club, selected: !allSelected };
      }
      return club;
    }));
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = searchQuery === "" || 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.location && club.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRegion = filterRegion === "all" || 
      (club.location && club.location.toLowerCase().includes(filterRegion.toLowerCase()));
    
    return matchesSearch && matchesRegion;
  });

  const selectedClubs = clubs.filter(c => c.selected);
  const totalTeamsToCreate = selectedTemplate 
    ? calculateTotalTeamsFromTemplate(selectedTemplate, selectedClubs.length)
    : 0;

  const getTeamPreview = () => {
    if (!selectedTemplate || selectedClubs.length === 0) return [];
    
    const preview: Array<{ clubName: string; teams: Array<{ name: string; sport: string; division: string }> }> = [];
    
    selectedClubs.slice(0, 3).forEach(club => {
      preview.push({
        clubName: club.name,
        teams: generateTeamCombinations({ id: club.id, name: club.name }, selectedTemplate)
      });
    });
    
    return preview;
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || selectedClubs.length === 0) return;
    
    const validation = validateTemplateCapacity(selectedTemplate, selectedClubs.length, event.maxTeams);
    if (!validation.isValid) {
      toast.error(validation.errors[0] || "Invalid configuration");
      return;
    }
    
    setIsSubmitting(true);
    const teams: Array<{ clubId: string; teamName: string; teamType: string; division?: string }> = [];
    
    selectedClubs.forEach(club => {
      const clubTeams = generateTeamCombinations({ id: club.id, name: club.name }, selectedTemplate);
      clubTeams.forEach(team => {
        teams.push({
          clubId: club.id,
          teamName: team.name,
          teamType: team.sport,
          division: team.division !== 'Open' ? team.division : undefined
        });
      });
    });
    
    try {
      const response = await fetch(`/api/tournaments/${event.id}/teams/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully created ${result.created} teams!`, {
          icon: "🎉",
          duration: 4000,
        });
        onComplete(result.created);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create teams");
      }
    } catch (error) {
      console.error("Error creating teams:", error);
      toast.error("Failed to create teams");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUniqueRegions = () => {
    const regions = new Set<string>();
    clubs.forEach(club => {
      if (club.location) {
        const parts = club.location.split(',');
        if (parts.length > 1) {
          regions.add(parts[parts.length - 1].trim());
        }
      }
    });
    return Array.from(regions).sort();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Bulk Team Registration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {step === 'template' ? 1 : step === 'clubs' ? 2 : 3} of 3
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: step === 'template' ? '33%' : step === 'clubs' ? '66%' : '100%' }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'template' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Choose Tournament Template</h3>
                <p className="text-gray-600">
                  Select a template to quickly set up your tournament structure
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournamentTemplates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="text-left border-2 rounded-lg p-4 hover:border-primary hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-primary">
                        {template.name}
                      </h4>
                      {template.id === 'standard-gaa' && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="space-y-2">
                      {template.sports.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Sports:</span>
                          <div className="flex flex-wrap gap-1">
                            {template.sports.map(sport => (
                              <span key={sport} className="px-2 py-0.5 bg-gray-100 rounded">
                                {sport}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {template.divisions.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Divisions:</span>
                          <div className="flex flex-wrap gap-1">
                            {template.divisions.map(div => (
                              <span key={div} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {div}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                        <span>📅 {template.estimatedDuration}</span>
                        <span>📋 {template.requiredFacilities.length} facilities</span>
                        <span>👥 {template.teamsPerDivision.min}-{template.teamsPerDivision.max} teams/div</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'clubs' && selectedTemplate && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Select Participating Clubs</h3>
                <p className="text-gray-600">
                  Choose clubs to register for {selectedTemplate.name}
                </p>
                {selectedTemplate.id !== 'custom' && (
                  <p className="text-sm text-primary mt-2">
                    Each club will get {selectedTemplate.sports.length} × {selectedTemplate.divisions.length} = {selectedTemplate.sports.length * selectedTemplate.divisions.length} teams
                  </p>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Regions</option>
                  {getUniqueRegions().map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={toggleAllClubs}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {filteredClubs.every(c => c.selected) ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Club List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <p className="text-sm text-gray-600">
                    {selectedClubs.length} of {filteredClubs.length} clubs selected
                    {selectedClubs.length > 0 && ` • ${totalTeamsToCreate} teams will be created`}
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loadingClubs ? (
                    <div className="p-8 text-center text-gray-500">Loading clubs...</div>
                  ) : filteredClubs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No clubs found</div>
                  ) : (
                    <div className="divide-y">
                      {filteredClubs.map(club => (
                        <label
                          key={club.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={club.selected}
                            onChange={() => toggleClubSelection(club.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{club.name}</p>
                            {club.location && (
                              <p className="text-xs text-gray-500">{club.location}</p>
                            )}
                          </div>
                          {club.selected && selectedTemplate.id !== 'custom' && (
                            <span className="text-xs text-primary">
                              +{selectedTemplate.sports.length * selectedTemplate.divisions.length} teams
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'review' && selectedTemplate && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Review & Confirm</h3>
                <p className="text-gray-600">
                  Review the teams that will be created
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedClubs.length}</p>
                  <p className="text-sm text-gray-600">Clubs</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{totalTeamsToCreate}</p>
                  <p className="text-sm text-gray-600">Teams</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedTemplate.sports.length * selectedTemplate.divisions.length}
                  </p>
                  <p className="text-sm text-gray-600">Per Club</p>
                </div>
              </div>

              {/* Team Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <p className="text-sm font-medium">Team Preview</p>
                </div>
                <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                  {getTeamPreview().map((clubPreview, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-0">
                      <p className="font-medium text-sm mb-2">{clubPreview.clubName}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {clubPreview.teams.map((team, teamIdx) => (
                          <div key={teamIdx} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">→</span>
                            <span className="flex-1">{team.name}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded">{team.sport}</span>
                            {team.division !== 'Open' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {team.division}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {selectedClubs.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      ... and {selectedClubs.length - 3} more clubs
                    </p>
                  )}
                </div>
              </div>

              {/* Validation Messages */}
              {(() => {
                const validation = validateTemplateCapacity(selectedTemplate, selectedClubs.length, event.maxTeams);
                return !validation.isValid ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{validation.errors[0]}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 'clubs') setStep('template');
              else if (step === 'review') setStep('clubs');
            }}
            disabled={step === 'template'}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            
            {step === 'clubs' && (
              <button
                type="button"
                onClick={() => setStep('review')}
                disabled={selectedClubs.length === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue ({selectedClubs.length} clubs)
              </button>
            )}
            
            {step === 'review' && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !validateTemplateCapacity(selectedTemplate!, selectedClubs.length, event.maxTeams).isValid}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating {totalTeamsToCreate} teams...
                  </>
                ) : (
                  <>Create {totalTeamsToCreate} Teams</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}