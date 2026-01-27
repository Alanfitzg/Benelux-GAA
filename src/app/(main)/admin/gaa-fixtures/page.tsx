"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

type GAAFixture = {
  id: string;
  date: string;
  endDate: string | null;
  title: string;
  description: string | null;
  impact: "MEDIUM" | "HIGH" | "CRITICAL";
  year: number;
  createdAt: string;
  updatedAt: string;
};

const IMPACT_COLORS = {
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

const IMPACT_BADGES = {
  MEDIUM: "bg-amber-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

export default function GAAFixturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fixtures, setFixtures] = useState<GAAFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state for adding new fixture
  const [newFixture, setNewFixture] = useState({
    date: "",
    endDate: "",
    title: "",
    description: "",
    impact: "HIGH" as "MEDIUM" | "HIGH" | "CRITICAL",
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
        }),
      });

      if (response.ok) {
        toast.success("Fixture added successfully");
        setShowAddModal(false);
        setNewFixture({
          date: "",
          endDate: "",
          title: "",
          description: "",
          impact: "HIGH",
        });
        fetchFixtures();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add fixture");
      }
    } catch (error) {
      console.error("Error adding fixture:", error);
      toast.error("Failed to add fixture");
    }
  };

  const handleDeleteFixture = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/gaa-fixtures?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Fixture deleted successfully");
        setDeleteConfirm(null);
        fetchFixtures();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete fixture");
      }
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast.error("Failed to delete fixture");
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

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const years = [2025, 2026, 2027, 2028];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              GAA Fixtures
            </h1>
            <p className="text-xs sm:text-base text-gray-600">
              Manage major GAA fixture dates that affect Irish team travel
              availability.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium flex items-center gap-2 self-start sm:self-auto"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Fixture
          </button>
        </div>
      </div>

      {/* Year Selector */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-sm font-medium text-gray-700">Year:</span>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedYear === year
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <p className="text-lg sm:text-2xl font-bold text-gray-900">
            {fixtures.length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Total Fixtures</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <p className="text-lg sm:text-2xl font-bold text-red-600">
            {fixtures.filter((f) => f.impact === "CRITICAL").length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Critical Dates</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <p className="text-lg sm:text-2xl font-bold text-orange-600">
            {fixtures.filter((f) => f.impact === "HIGH").length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">High Impact</p>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
            {selectedYear} Fixtures ({fixtures.length})
          </h2>
        </div>

        {fixtures.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No fixtures found for {selectedYear}</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary hover:underline text-sm"
            >
              Add the first fixture
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {fixtures.map((fixture) => (
              <div
                key={fixture.id}
                className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${IMPACT_COLORS[fixture.impact]} border-l-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
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
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(fixture.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete fixture"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h3 className="text-xs sm:text-base font-semibold text-blue-900 mb-1.5 sm:mb-2">
          How GAA fixtures affect event creation:
        </h3>
        <ul className="list-disc list-inside text-[10px] sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
          <li>
            When European clubs create events that clash with these dates, they
            receive a warning
          </li>
          <li>
            <strong>CRITICAL:</strong> All-Ireland Finals - Irish teams will not
            travel
          </li>
          <li>
            <strong>HIGH:</strong> Provincial finals, semi-finals - Most Irish
            teams unavailable
          </li>
          <li>
            <strong>MEDIUM:</strong> League finals, earlier rounds - Some impact
            on travel
          </li>
        </ul>
      </div>

      <div className="mt-4 sm:mt-6 text-center">
        <Link
          href="/admin"
          className="text-xs sm:text-base text-primary hover:underline"
        >
          Back to Admin Dashboard
        </Link>
      </div>

      {/* Add Fixture Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Add GAA Fixture
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
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
                    placeholder="e.g., All-Ireland Football Final"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="MEDIUM">
                      Medium - Some impact on travel
                    </option>
                    <option value="HIGH">
                      High - Most Irish teams unavailable
                    </option>
                    <option value="CRITICAL">
                      Critical - All Irish teams unavailable
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
                    placeholder="Additional details about the fixture..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    Add Fixture
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
