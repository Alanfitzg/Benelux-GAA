"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

interface CompetitionSection {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subtitle: string;
  status: "upcoming" | "in_progress" | "complete";
  nextFixture?: string;
  pools?: { name: string; teams: string[] }[];
  teams?: string[];
}

interface StandingsManagerProps {
  standings: CompetitionSection[];
  onSave: (standings: CompetitionSection[]) => Promise<void>;
}

export default function StandingsManager({
  standings: initialStandings,
  onSave,
}: StandingsManagerProps) {
  const [standings, setStandings] =
    useState<CompetitionSection[]>(initialStandings);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newTeamInputs, setNewTeamInputs] = useState<Record<string, string>>(
    {}
  );
  const [newPoolTeamInputs, setNewPoolTeamInputs] = useState<
    Record<string, string>
  >({});
  const [newPoolNameInputs, setNewPoolNameInputs] = useState<
    Record<string, string>
  >({});

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const updateCompetition = (
    id: string,
    updates: Partial<CompetitionSection>
  ) => {
    setStandings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const addCompetition = () => {
    const newId = `comp-${Date.now()}`;
    const newComp: CompetitionSection = {
      id: newId,
      name: "New Competition",
      shortName: "New",
      color: "text-gray-700",
      bgColor: "bg-gray-600",
      borderColor: "border-gray-600",
      subtitle: "",
      status: "upcoming",
    };
    setStandings((prev) => [...prev, newComp]);
    setExpandedId(newId);
  };

  const deleteCompetition = (id: string) => {
    if (!confirm("Delete this competition?")) return;
    setStandings((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addTeam = (compId: string) => {
    const team = (newTeamInputs[compId] || "").trim();
    if (!team) return;
    setStandings((prev) =>
      prev.map((s) =>
        s.id === compId ? { ...s, teams: [...(s.teams || []), team] } : s
      )
    );
    setNewTeamInputs((prev) => ({ ...prev, [compId]: "" }));
  };

  const removeTeam = (compId: string, teamIndex: number) => {
    setStandings((prev) =>
      prev.map((s) =>
        s.id === compId
          ? { ...s, teams: (s.teams || []).filter((_, i) => i !== teamIndex) }
          : s
      )
    );
  };

  const addPool = (compId: string) => {
    const poolName = (newPoolNameInputs[compId] || "").trim();
    if (!poolName) return;
    setStandings((prev) =>
      prev.map((s) =>
        s.id === compId
          ? {
              ...s,
              pools: [...(s.pools || []), { name: poolName, teams: [] }],
            }
          : s
      )
    );
    setNewPoolNameInputs((prev) => ({ ...prev, [compId]: "" }));
  };

  const removePool = (compId: string, poolIndex: number) => {
    setStandings((prev) =>
      prev.map((s) =>
        s.id === compId
          ? {
              ...s,
              pools: (s.pools || []).filter((_, i) => i !== poolIndex),
            }
          : s
      )
    );
  };

  const addPoolTeam = (compId: string, poolIndex: number) => {
    const key = `${compId}-${poolIndex}`;
    const team = (newPoolTeamInputs[key] || "").trim();
    if (!team) return;
    setStandings((prev) =>
      prev.map((s) => {
        if (s.id !== compId || !s.pools) return s;
        const updatedPools = s.pools.map((p, i) =>
          i === poolIndex ? { ...p, teams: [...p.teams, team] } : p
        );
        return { ...s, pools: updatedPools };
      })
    );
    setNewPoolTeamInputs((prev) => ({ ...prev, [key]: "" }));
  };

  const removePoolTeam = (
    compId: string,
    poolIndex: number,
    teamIndex: number
  ) => {
    setStandings((prev) =>
      prev.map((s) => {
        if (s.id !== compId || !s.pools) return s;
        const updatedPools = s.pools.map((p, i) =>
          i === poolIndex
            ? { ...p, teams: p.teams.filter((_, ti) => ti !== teamIndex) }
            : p
        );
        return { ...s, pools: updatedPools };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(standings);
    } catch {
      alert("Failed to save standings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#1a3a4a]">
          Standings Manager
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addCompetition}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#2B9EB3] text-white rounded-lg hover:bg-[#248a9d] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Competition
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#1a3a4a] text-white rounded-lg hover:bg-[#15303d] disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {standings.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No competitions yet. Add one to get started.
          </p>
        </div>
      )}

      {standings.map((comp) => (
        <div
          key={comp.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <button
              type="button"
              onClick={() => toggleExpanded(comp.id)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              {expandedId === comp.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-[#1a3a4a] text-sm sm:text-base truncate">
                  {comp.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {comp.status === "upcoming" && "Upcoming"}
                  {comp.status === "in_progress" && "In Progress"}
                  {comp.status === "complete" && "Complete"}
                  {comp.teams && ` · ${comp.teams.length} teams`}
                  {comp.pools && ` · ${comp.pools.length} pools`}
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => deleteCompetition(comp.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {expandedId === comp.id && (
            <div className="p-4 sm:p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) =>
                      updateCompetition(comp.id, { name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Short Name
                  </label>
                  <input
                    type="text"
                    value={comp.shortName}
                    onChange={(e) =>
                      updateCompetition(comp.id, { shortName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={comp.subtitle}
                    onChange={(e) =>
                      updateCompetition(comp.id, { subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={comp.status}
                    onChange={(e) =>
                      updateCompetition(comp.id, {
                        status: e.target.value as CompetitionSection["status"],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In Progress</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Next Fixture
                </label>
                <input
                  type="text"
                  value={comp.nextFixture || ""}
                  onChange={(e) =>
                    updateCompetition(comp.id, {
                      nextFixture: e.target.value || undefined,
                    })
                  }
                  placeholder="e.g. Round 1 - March 21, 2026 (Maastricht)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={comp.color}
                    onChange={(e) =>
                      updateCompetition(comp.id, { color: e.target.value })
                    }
                    placeholder="text-green-700"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="text"
                    value={comp.bgColor}
                    onChange={(e) =>
                      updateCompetition(comp.id, { bgColor: e.target.value })
                    }
                    placeholder="bg-green-600"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Border Color
                  </label>
                  <input
                    type="text"
                    value={comp.borderColor}
                    onChange={(e) =>
                      updateCompetition(comp.id, {
                        borderColor: e.target.value,
                      })
                    }
                    placeholder="border-green-600"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#2B9EB3]" />
                  <h4 className="font-semibold text-sm text-[#1a3a4a]">
                    Teams
                  </h4>
                </div>

                {comp.teams && comp.teams.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {comp.teams.map((team, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm text-gray-700">{team}</span>
                        <button
                          type="button"
                          onClick={() => removeTeam(comp.id, idx)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeamInputs[comp.id] || ""}
                    onChange={(e) =>
                      setNewTeamInputs((prev) => ({
                        ...prev,
                        [comp.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTeam(comp.id);
                      }
                    }}
                    placeholder="Team name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTeam(comp.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-[#2B9EB3] text-white rounded-lg hover:bg-[#248a9d] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#2B9EB3]" />
                  <h4 className="font-semibold text-sm text-[#1a3a4a]">
                    Pools
                  </h4>
                </div>

                {comp.pools && comp.pools.length > 0 && (
                  <div className="space-y-4 mb-3">
                    {comp.pools.map((pool, poolIdx) => (
                      <div
                        key={poolIdx}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-[#1a3a4a]">
                            {pool.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePool(comp.id, poolIdx)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {pool.teams.length > 0 && (
                          <div className="space-y-1.5 mb-2">
                            {pool.teams.map((team, teamIdx) => (
                              <div
                                key={teamIdx}
                                className="flex items-center justify-between bg-white rounded px-3 py-1.5"
                              >
                                <span className="text-sm text-gray-700">
                                  {team}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePoolTeam(comp.id, poolIdx, teamIdx)
                                  }
                                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={
                              newPoolTeamInputs[`${comp.id}-${poolIdx}`] || ""
                            }
                            onChange={(e) =>
                              setNewPoolTeamInputs((prev) => ({
                                ...prev,
                                [`${comp.id}-${poolIdx}`]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addPoolTeam(comp.id, poolIdx);
                              }
                            }}
                            placeholder="Team name"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => addPoolTeam(comp.id, poolIdx)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#2B9EB3] text-white rounded-lg hover:bg-[#248a9d] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPoolNameInputs[comp.id] || ""}
                    onChange={(e) =>
                      setNewPoolNameInputs((prev) => ({
                        ...prev,
                        [comp.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPool(comp.id);
                      }
                    }}
                    placeholder="Pool name (e.g. Pool A)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addPool(comp.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-[#2B9EB3] text-white rounded-lg hover:bg-[#248a9d] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Pool
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
