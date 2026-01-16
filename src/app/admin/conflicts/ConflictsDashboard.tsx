"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StarRating } from "@/components/reviews/StarRating";

interface Conflict {
  id: string;
  status: string;
  priority: string;
  adminNotes: string | null;
  resolutionNotes: string | null;
  resolutionType: string | null;
  resolvedAt: string | null;
  createdAt: string;
  review: {
    id: string;
    rating: number;
    complaint: string | null;
    submittedAt: string;
  };
  event: {
    id: string;
    title: string;
    location: string;
    startDate: string;
  };
  complainantClub: {
    id: string;
    name: string;
  };
  respondentClub: {
    id: string;
    name: string;
  };
  resolver: {
    id: string;
    name: string | null;
    username: string;
  } | null;
}

const statusColors: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  AWAITING_RESPONSE: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  DISMISSED: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
};

export function ConflictsDashboard() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("active");

  useEffect(() => {
    fetchConflicts();
  }, [statusFilter]);

  async function fetchConflicts() {
    setLoading(true);
    try {
      let url = "/api/conflicts";
      if (statusFilter !== "all" && statusFilter !== "active") {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      let filtered = data.conflicts;
      if (statusFilter === "active") {
        filtered = data.conflicts.filter(
          (c: Conflict) => !["RESOLVED", "DISMISSED"].includes(c.status)
        );
      }

      setConflicts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conflicts");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeCount = conflicts.filter(
    (c) => !["RESOLVED", "DISMISSED"].includes(c.status)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 -mx-1 px-1 gap-1.5 md:gap-2 scrollbar-hide md:flex-wrap md:overflow-visible">
        {[
          { value: "active", label: "Active", count: activeCount },
          { value: "OPEN", label: "Open" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "AWAITING_RESPONSE", label: "Awaiting" },
          { value: "RESOLVED", label: "Resolved" },
          { value: "DISMISSED", label: "Dismissed" },
          { value: "all", label: "All" },
        ].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`
              px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0
              ${
                statusFilter === filter.value
                  ? "bg-primary text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }
            `}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className="ml-1.5 md:ml-2 bg-white/20 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conflicts List */}
      {conflicts.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No conflicts found
          </h3>
          <p className="text-gray-400">
            {statusFilter === "active"
              ? "Great news! There are no active conflicts to review."
              : "No conflicts match your filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict) => (
            <Link
              key={conflict.id}
              href={`/admin/conflicts/${conflict.id}`}
              className="block bg-white/5 hover:bg-white/10 rounded-xl p-5 transition-colors border border-white/10"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[conflict.status]}`}
                    >
                      {conflict.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[conflict.priority]}`}
                    >
                      {conflict.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(conflict.createdAt)}
                    </span>
                  </div>

                  {/* Event */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {conflict.event.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {conflict.event.location} •{" "}
                    {formatDate(conflict.event.startDate)}
                  </p>

                  {/* Parties */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-300">
                      {conflict.complainantClub.name}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="text-gray-300">
                      {conflict.respondentClub.name}
                    </span>
                  </div>

                  {/* Complaint Preview */}
                  {conflict.review.complaint && (
                    <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                      &ldquo;{conflict.review.complaint}&rdquo;
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="flex-shrink-0">
                  <StarRating
                    rating={conflict.review.rating}
                    readonly
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
