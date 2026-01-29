"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Shield,
  X,
  ArrowLeft,
  Ban,
} from "lucide-react";

type GAAFixture = {
  id: string;
  date: string;
  endDate: string | null;
  title: string;
  description: string | null;
  impact: "MEDIUM" | "HIGH" | "CRITICAL";
  year: number;
  sportCode?: string | null;
  createdAt: string;
  updatedAt: string;
};

const IMPACT_COLORS = {
  MEDIUM: "bg-amber-500/10 border-amber-500/30",
  HIGH: "bg-orange-500/10 border-orange-500/30",
  CRITICAL: "bg-red-500/10 border-red-500/30",
};

const IMPACT_BADGES = {
  MEDIUM: "bg-amber-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

const SPORT_CODES = [
  { value: "", label: "All Sports (GAA-wide)" },
  { value: "G4MO", label: "Gaelic4Mothers&Others" },
  { value: "LGFA", label: "Ladies Gaelic Football" },
  { value: "CAMOGIE", label: "Camogie" },
  { value: "HURLING", label: "Hurling" },
  { value: "FOOTBALL", label: "Men's Football" },
  { value: "YOUTH", label: "Youth Events" },
];

export default function GAAFixturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fixtures, setFixtures] = useState<GAAFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<"fixture" | "blackout">(
    "fixture"
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [newFixture, setNewFixture] = useState({
    date: "",
    endDate: "",
    title: "",
    description: "",
    impact: "HIGH" as "MEDIUM" | "HIGH" | "CRITICAL",
    sportCode: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }
    fetchFixtures();
  }, [session, status, router, selectedYear]);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/gaa-fixtures?year=${selectedYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setFixtures(data.fixtures || []);
      }
    } catch (error) {
      console.error("Error fetching fixtures:", error);
      toast.error("Failed to load fixtures");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/gaa-fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFixture,
          year: selectedYear,
          endDate: newFixture.endDate || null,
          sportCode: newFixture.sportCode || null,
        }),
      });

      if (response.ok) {
        toast.success(
          addModalType === "blackout" ? "Blackout date added" : "Fixture added"
        );
        setShowAddModal(false);
        setNewFixture({
          date: "",
          endDate: "",
          title: "",
          description: "",
          impact: "HIGH",
          sportCode: "",
        });
        fetchFixtures();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add");
      }
    } catch (error) {
      console.error("Error adding fixture:", error);
      toast.error("Failed to add");
    }
  };

  const handleDeleteFixture = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/gaa-fixtures?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Deleted successfully");
        setDeleteConfirm(null);
        fetchFixtures();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast.error("Failed to delete");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const openAddModal = (type: "fixture" | "blackout") => {
    setAddModalType(type);
    setNewFixture({
      date: "",
      endDate: "",
      title: "",
      description: "",
      impact: "HIGH",
      sportCode: type === "blackout" ? "" : "",
    });
    setShowAddModal(true);
  };

  // Separate GAA-wide fixtures from sport-specific blackouts
  const gaaFixtures = fixtures.filter((f) => !f.sportCode);
  const sportBlackouts = fixtures.filter((f) => f.sportCode);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const years = [2025, 2026, 2027, 2028];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8 max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                GAA Fixtures & Blackout Dates
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage major GAA fixture dates that affect Irish team travel
                availability
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-5 bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-gray-900">GAA Fixtures</strong> warn
              European clubs when they create events that clash with major Irish
              fixtures.
              <strong className="text-gray-900">
                {" "}
                Sport-specific blackouts
              </strong>{" "}
              allow officers to block dates for their code (e.g., LGFA can block
              dates for G4MO tournaments when scheduling conflicts occur).
            </p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium text-gray-700">Year:</span>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedYear === year
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border border-gray-100">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {fixtures.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border border-gray-100">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {fixtures.filter((f) => f.impact === "CRITICAL").length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Critical</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border border-gray-100">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {gaaFixtures.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">GAA Fixtures</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border border-gray-100">
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
              {sportBlackouts.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Sport Blackouts</p>
          </div>
        </div>

        {/* GAA Fixtures Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-green-50 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              GAA Fixtures ({gaaFixtures.length})
            </h2>
            <button
              type="button"
              onClick={() => openAddModal("fixture")}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Fixture
            </button>
          </div>

          {gaaFixtures.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No GAA fixtures for {selectedYear}</p>
              <button
                type="button"
                onClick={() => openAddModal("fixture")}
                className="mt-3 text-green-600 hover:underline text-sm font-medium"
              >
                Add the first fixture
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {gaaFixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className={`p-4 sm:p-5 hover:bg-gray-50 transition-colors border-l-4 ${IMPACT_COLORS[fixture.impact]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                          {fixture.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white rounded-full ${IMPACT_BADGES[fixture.impact]}`}
                        >
                          {fixture.impact}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {formatDate(fixture.date)}
                        {fixture.endDate &&
                          fixture.endDate !== fixture.date &&
                          ` - ${formatDate(fixture.endDate)}`}
                      </p>
                      {fixture.description && (
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {fixture.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {deleteConfirm === fixture.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteFixture(fixture.id)}
                            className="px-2.5 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2.5 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(fixture.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete fixture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sport-Specific Blackouts Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-purple-50 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Ban className="w-5 h-5 text-purple-600" />
                Sport-Specific Blackouts ({sportBlackouts.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Dates blocked for specific sport codes only
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAddModal("blackout")}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Blackout
            </button>
          </div>

          {sportBlackouts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Ban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">
                No sport-specific blackouts for {selectedYear}
              </p>
              <p className="text-sm mt-1 text-gray-400">
                Officers can add dates specific to their sport code
              </p>
              <button
                type="button"
                onClick={() => openAddModal("blackout")}
                className="mt-3 text-purple-600 hover:underline text-sm font-medium"
              >
                Add the first blackout
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sportBlackouts.map((fixture) => (
                <div
                  key={fixture.id}
                  className={`p-4 sm:p-5 hover:bg-gray-50 transition-colors border-l-4 border-purple-400`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                          {fixture.title}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white bg-purple-500 rounded-full">
                          {fixture.sportCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white rounded-full ${IMPACT_BADGES[fixture.impact]}`}
                        >
                          {fixture.impact}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        {formatDate(fixture.date)}
                        {fixture.endDate &&
                          fixture.endDate !== fixture.date &&
                          ` - ${formatDate(fixture.endDate)}`}
                      </p>
                      {fixture.description && (
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {fixture.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {deleteConfirm === fixture.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteFixture(fixture.id)}
                            className="px-2.5 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2.5 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(fixture.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete blackout"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Legend */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-600" />
            Impact Levels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></span>
              <div>
                <p className="text-sm font-medium text-gray-900">Critical</p>
                <p className="text-xs text-gray-600">
                  All teams unavailable (Finals)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
              <div>
                <p className="text-sm font-medium text-gray-900">High</p>
                <p className="text-xs text-gray-600">
                  Most teams unavailable (Semis)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0"></span>
              <div>
                <p className="text-sm font-medium text-gray-900">Medium</p>
                <p className="text-xs text-gray-600">
                  Some impact (League rounds)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      addModalType === "blackout"
                        ? "bg-purple-100"
                        : "bg-green-100"
                    }`}
                  >
                    {addModalType === "blackout" ? (
                      <Ban className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Calendar className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {addModalType === "blackout"
                      ? "Add Sport Blackout"
                      : "Add GAA Fixture"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFixture} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFixture.title}
                    onChange={(e) =>
                      setNewFixture({ ...newFixture, title: e.target.value })
                    }
                    placeholder={
                      addModalType === "blackout"
                        ? "e.g., G4MO National Blitz Weekend"
                        : "e.g., All-Ireland Football Final"
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {addModalType === "blackout" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sport Code *
                    </label>
                    <select
                      required
                      value={newFixture.sportCode}
                      onChange={(e) =>
                        setNewFixture({
                          ...newFixture,
                          sportCode: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a sport...</option>
                      {SPORT_CODES.filter((s) => s.value).map((sport) => (
                        <option key={sport.value} value={sport.value}>
                          {sport.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      This blackout will only apply to events of this sport type
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newFixture.date}
                      onChange={(e) =>
                        setNewFixture({ ...newFixture, date: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newFixture.endDate}
                      onChange={(e) =>
                        setNewFixture({
                          ...newFixture,
                          endDate: e.target.value,
                        })
                      }
                      min={newFixture.date}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impact Level *
                  </label>
                  <select
                    value={newFixture.impact}
                    onChange={(e) =>
                      setNewFixture({
                        ...newFixture,
                        impact: e.target.value as
                          | "MEDIUM"
                          | "HIGH"
                          | "CRITICAL",
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="MEDIUM">
                      Medium - Some impact on scheduling
                    </option>
                    <option value="HIGH">
                      High - Most teams/events affected
                    </option>
                    <option value="CRITICAL">
                      Critical - Complete blackout
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newFixture.description}
                    onChange={(e) =>
                      setNewFixture({
                        ...newFixture,
                        description: e.target.value,
                      })
                    }
                    placeholder="Additional details..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors text-sm font-medium shadow-md ${
                      addModalType === "blackout"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {addModalType === "blackout"
                      ? "Add Blackout"
                      : "Add Fixture"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
