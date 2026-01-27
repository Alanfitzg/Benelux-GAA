"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  updatedAt: string;
  review: {
    id: string;
    rating: number;
    complaint: string | null;
    content: string | null;
    improvementSuggestion: string | null;
    submittedAt: string;
    status: string;
  };
  event: {
    id: string;
    title: string;
    eventType: string;
    location: string;
    startDate: string;
    endDate: string | null;
  };
  complainantClub: {
    id: string;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  respondentClub: {
    id: string;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  resolver: {
    id: string;
    name: string | null;
    username: string;
    email: string;
  } | null;
}

const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "AWAITING_RESPONSE", label: "Awaiting Response" },
];

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const resolutionTypes = [
  { value: "MEDIATED", label: "Mediated Agreement" },
  { value: "REFUND_ISSUED", label: "Refund Issued" },
  { value: "APOLOGY_ISSUED", label: "Apology Issued" },
  { value: "NO_ACTION", label: "No Action Required" },
  { value: "WARNING_ISSUED", label: "Warning Issued" },
  { value: "DISMISSED", label: "Dismissed" },
];

const statusColors: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  AWAITING_RESPONSE: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  DISMISSED: "bg-gray-100 text-gray-800",
};

interface ConflictDetailClientProps {
  conflictId: string;
}

export function ConflictDetailClient({
  conflictId,
}: ConflictDetailClientProps) {
  const router = useRouter();
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const [resolving, setResolving] = useState(false);
  const [resolutionType, setResolutionType] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);

  useEffect(() => {
    fetchConflict();
  }, [conflictId]);

  async function fetchConflict() {
    try {
      const response = await fetch(`/api/conflicts/${conflictId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setConflict(data.conflict);
      setStatus(data.conflict.status);
      setPriority(data.conflict.priority);
      setAdminNotes(data.conflict.adminNotes || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conflict");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    setUpdating(true);
    try {
      const response = await fetch(`/api/conflicts/${conflictId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, adminNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setConflict({ ...conflict!, ...data.conflict });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update conflict"
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleResolve() {
    if (!resolutionType || !resolutionNotes) {
      setError("Please select a resolution type and provide notes");
      return;
    }

    setResolving(true);
    try {
      const response = await fetch(`/api/conflicts/${conflictId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionType, resolutionNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      router.push("/admin/conflicts");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve conflict"
      );
    } finally {
      setResolving(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isResolved =
    conflict?.status === "RESOLVED" || conflict?.status === "DISMISSED";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !conflict) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (!conflict) return null;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/conflicts"
        className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Conflicts
      </Link>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[conflict.status]}`}
          >
            {conflict.status.replace("_", " ")}
          </span>
          <span className="text-sm text-gray-400">
            Created {formatDate(conflict.createdAt)}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {conflict.event.title}
        </h1>
        <p className="text-gray-400">
          {conflict.event.location} • {formatDate(conflict.event.startDate)}
        </p>
      </div>

      {/* Parties */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Complainant
          </h3>
          <p className="text-lg font-semibold text-white">
            {conflict.complainantClub.name}
          </p>
          {conflict.complainantClub.contactEmail && (
            <a
              href={`mailto:${conflict.complainantClub.contactEmail}`}
              className="text-sm text-primary hover:underline"
            >
              {conflict.complainantClub.contactEmail}
            </a>
          )}
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Respondent</h3>
          <p className="text-lg font-semibold text-white">
            {conflict.respondentClub.name}
          </p>
          {conflict.respondentClub.contactEmail && (
            <a
              href={`mailto:${conflict.respondentClub.contactEmail}`}
              className="text-sm text-primary hover:underline"
            >
              {conflict.respondentClub.contactEmail}
            </a>
          )}
        </div>
      </div>

      {/* Review Details */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">
          Review Details
        </h2>

        <div className="mb-4">
          <span className="text-sm text-gray-400">Rating</span>
          <div className="mt-1">
            <StarRating rating={conflict.review.rating} readonly size="md" />
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-400">Complaint</span>
          <div className="mt-2 bg-red-500/10 rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-200 whitespace-pre-wrap">
              {conflict.review.complaint}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Submitted {formatDate(conflict.review.submittedAt)}
          </p>
        </div>
      </div>

      {/* Management Section */}
      {!isResolved && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Manage Conflict
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {statusOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-slate-800"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {priorityOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-slate-800"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this conflict..."
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={updating}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Resolve Section */}
      {!isResolved && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Resolve Conflict
            </h2>
            <button
              onClick={() => setShowResolveForm(!showResolveForm)}
              className="text-sm text-primary hover:underline"
            >
              {showResolveForm ? "Cancel" : "Resolve Now"}
            </button>
          </div>

          {showResolveForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution Type
                </label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="" className="bg-slate-800">
                    Select resolution type...
                  </option>
                  {resolutionTypes.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-slate-800"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how this conflict was resolved..."
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
                  required
                />
              </div>

              <button
                onClick={handleResolve}
                disabled={resolving || !resolutionType || !resolutionNotes}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {resolving ? "Resolving..." : "Mark as Resolved"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resolution Details (if resolved) */}
      {isResolved && conflict.resolutionNotes && (
        <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
          <h2 className="text-lg font-semibold text-green-400 mb-4">
            Resolution
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-400">Type</span>
              <p className="text-white">
                {resolutionTypes.find(
                  (t) => t.value === conflict.resolutionType
                )?.label || conflict.resolutionType}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Notes</span>
              <p className="text-gray-200 whitespace-pre-wrap">
                {conflict.resolutionNotes}
              </p>
            </div>
            {conflict.resolvedAt && (
              <p className="text-xs text-gray-500">
                Resolved on {formatDate(conflict.resolvedAt)}
                {conflict.resolver &&
                  ` by ${conflict.resolver.name || conflict.resolver.username}`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
