"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Appeal {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: Date | string;
  rejectionReason: string | null;
  rejectionAppeal: string | null;
  appealedAt: Date | string | null;
  club: {
    id: string;
    name: string;
  } | null;
}

interface AppealsDashboardProps {
  appeals: Appeal[];
}

export function AppealsDashboard({
  appeals: initialAppeals,
}: AppealsDashboardProps) {
  const router = useRouter();
  const [appeals, setAppeals] = useState(initialAppeals);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState<string | null>(null);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleResolve = async (
    eventId: string,
    decision: "APPROVED" | "DENIED"
  ) => {
    setResolving(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/appeal/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          resolution: resolution.trim() || null,
        }),
      });

      if (response.ok) {
        setAppeals((prev) => prev.filter((a) => a.id !== eventId));
        setSelectedAppeal(null);
        setResolution("");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to resolve appeal");
      }
    } catch {
      alert("An error occurred resolving the appeal");
    } finally {
      setResolving(null);
    }
  };

  if (appeals.length === 0) {
    return (
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
          No Pending Appeals
        </h3>
        <p className="text-gray-400">
          All event rejection appeals have been resolved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-yellow-400">
            {appeals.length}
          </span>{" "}
          pending appeal{appeals.length !== 1 ? "s" : ""} requiring review
        </p>
      </div>

      {appeals.map((appeal) => (
        <div
          key={appeal.id}
          className="bg-white/5 rounded-xl p-5 border border-white/10"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300">
                  Appeal Pending
                </span>
                <span className="text-xs text-gray-500">
                  Appealed {formatDate(appeal.appealedAt)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {appeal.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {appeal.club?.name} • {appeal.location} •{" "}
                {formatDate(appeal.startDate)}
              </p>

              <div className="space-y-3">
                <div className="bg-red-500/10 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-400 mb-1">
                    Original Rejection Reason
                  </p>
                  <p className="text-sm text-gray-200">
                    {appeal.rejectionReason || "No reason provided"}
                  </p>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-400 mb-1">
                    Club&apos;s Appeal
                  </p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">
                    {appeal.rejectionAppeal}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {selectedAppeal === appeal.id ? (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="mb-4">
                <label
                  htmlFor={`resolution-${appeal.id}`}
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Resolution Notes (optional)
                </label>
                <textarea
                  id={`resolution-${appeal.id}`}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleResolve(appeal.id, "APPROVED")}
                  disabled={resolving === appeal.id}
                  className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {resolving === appeal.id ? "Processing..." : "Approve Appeal"}
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(appeal.id, "DENIED")}
                  disabled={resolving === appeal.id}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {resolving === appeal.id ? "Processing..." : "Deny Appeal"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppeal(null);
                    setResolution("");
                  }}
                  disabled={resolving === appeal.id}
                  className="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                <strong>Approve:</strong> Event returns to pending status for
                re-review. <strong>Deny:</strong> Original rejection stands.
              </p>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedAppeal(appeal.id)}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Review Appeal
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
