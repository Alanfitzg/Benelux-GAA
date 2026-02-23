"use client";

import { useState, useEffect } from "react";
import {
  Landmark,
  Check,
  X,
  Trash2,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";

interface HistorySubmission {
  id: string;
  title: string;
  year: string;
  month?: string;
  description: string;
  sourceUrl?: string;
  sourceName?: string;
  submitterName: string;
  submitterEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export default function HistorySubmissions() {
  const [submissions, setSubmissions] = useState<HistorySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      const res = await fetch("/api/benelux-history-submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setUpdating(id);
    try {
      const res = await fetch("/api/benelux-history-submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
      }
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setUpdating(null);
    }
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Delete this submission?")) return;

    setUpdating(id);
    try {
      const res = await fetch(`/api/benelux-history-submissions?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Landmark size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              History Submissions
            </h3>
            {pendingCount > 0 && (
              <p className="text-xs text-amber-600">
                {pendingCount} pending review
              </p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
          <Landmark size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No submissions yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Submissions from the Museum page will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={`bg-white rounded-lg border p-4 ${
                submission.status === "pending"
                  ? "border-amber-200"
                  : submission.status === "approved"
                    ? "border-green-200"
                    : "border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {submission.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({submission.year}
                      {submission.month ? `, ${submission.month}` : ""})
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        submission.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : submission.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {submission.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>
                      From: {submission.submitterName} (
                      {submission.submitterEmail})
                    </span>
                    {submission.sourceUrl && (
                      <a
                        href={submission.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#2B9EB3] hover:underline"
                      >
                        <ExternalLink size={10} />
                        {submission.sourceName || "Source"}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {submission.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateStatus(submission.id, "approved")}
                        disabled={updating === submission.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        {updating === submission.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(submission.id, "rejected")}
                        disabled={updating === submission.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteSubmission(submission.id)}
                    disabled={updating === submission.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
