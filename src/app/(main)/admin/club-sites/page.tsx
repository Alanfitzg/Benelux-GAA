"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Instagram,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  ExternalLink,
  Globe,
  Settings,
  MessageSquareQuote,
  Image,
} from "lucide-react";

interface InstagramRequest {
  id: string;
  clubId: string;
  clubName: string;
  instagramHandle: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  notes: string | null;
}

// Registered club sites
const CLUB_SITES = [
  {
    id: "rome-hibernia",
    name: "Rome Hibernia GAA",
    url: "/demo/rome-hibernia",
    adminUrl: "/demo/rome-hibernia/admin",
    instagramHandle: "@romehiberniagaa",
    crest: "/club-crests/rome-hibernia-NEW.png",
    location: "Rome, Italy",
  },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: PlayCircle,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
  },
  COMPLETED: {
    label: "Connected",
    icon: CheckCircle,
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-300",
  },
};

export default function ClubSitesAdmin() {
  const [requests, setRequests] = useState<InstagramRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/instagram-connection-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      } else if (res.status === 401) {
        setError("Unauthorized - you must be a super admin to view this page");
      }
    } catch {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (
    id: string,
    status: InstagramRequest["status"],
    notes?: string
  ) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/instagram-connection-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes }),
      });

      if (res.ok) {
        await fetchRequests();
      }
    } catch {
      // Handle error silently
    } finally {
      setUpdating(null);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setUpdating(id);
    try {
      const res = await fetch(`/api/instagram-connection-requests?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchRequests();
      }
    } catch {
      // Handle error silently
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Link
            href="/admin"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const inProgressRequests = requests.filter((r) => r.status === "IN_PROGRESS");
  const completedRequests = requests.filter((r) => r.status === "COMPLETED");
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Club Sites Management
            </h1>
            <p className="text-gray-600">
              Manage club websites and Instagram connections
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Registered Club Sites */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={20} />
              Club Sites ({CLUB_SITES.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {CLUB_SITES.map((site) => {
                const instagramStatus = requests.find(
                  (r) => r.clubId === site.id
                );
                return (
                  <div
                    key={site.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={site.crest}
                        alt={site.name}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {site.name}
                        </h3>
                        <p className="text-gray-500 text-sm">{site.location}</p>
                        {site.instagramHandle && (
                          <a
                            href={`https://instagram.com/${site.instagramHandle.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline text-sm flex items-center gap-1 mt-1"
                          >
                            <Instagram size={14} />
                            {site.instagramHandle}
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {instagramStatus && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${STATUS_CONFIG[instagramStatus.status].bgColor} ${STATUS_CONFIG[instagramStatus.status].textColor}`}
                          >
                            Instagram:{" "}
                            {STATUS_CONFIG[instagramStatus.status].label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={site.url}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Globe size={14} />
                        View Site
                      </Link>
                      <Link
                        href={site.adminUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Settings size={14} />
                        Admin
                      </Link>
                      <Link
                        href={`${site.adminUrl}/testimonials`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        <MessageSquareQuote size={14} />
                        Testimonials
                      </Link>
                      <Link
                        href={`${site.url}/gallery/admin`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Image size={14} />
                        Gallery
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Instagram Connection Requests */}
          {requests.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <Instagram size={20} />
                Instagram Connection Requests ({requests.length})
              </h2>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                    <Clock size={16} />
                    Pending ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        updating={updating === request.id}
                        onUpdateStatus={updateStatus}
                        onDelete={deleteRequest}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* In Progress Requests */}
              {inProgressRequests.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                    <PlayCircle size={16} />
                    In Progress ({inProgressRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {inProgressRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        updating={updating === request.id}
                        onUpdateStatus={updateStatus}
                        onDelete={deleteRequest}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Requests */}
              {completedRequests.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                    <CheckCircle size={16} />
                    Connected ({completedRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {completedRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        updating={updating === request.id}
                        onUpdateStatus={updateStatus}
                        onDelete={deleteRequest}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Requests */}
              {rejectedRequests.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                    <XCircle size={16} />
                    Rejected ({rejectedRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {rejectedRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        updating={updating === request.id}
                        onUpdateStatus={updateStatus}
                        onDelete={deleteRequest}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestCard({
  request,
  updating,
  onUpdateStatus,
  onDelete,
  formatDate,
}: {
  request: InstagramRequest;
  updating: boolean;
  onUpdateStatus: (
    id: string,
    status: InstagramRequest["status"],
    notes?: string
  ) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
}) {
  const config = STATUS_CONFIG[request.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`bg-white rounded-xl border ${config.borderColor} p-4 md:p-6 shadow-sm`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${config.bgColor} flex-shrink-0`}>
            <Instagram className={config.textColor} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{request.clubName}</h3>
            {request.instagramHandle && (
              <a
                href={`https://instagram.com/${request.instagramHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm flex items-center gap-1"
              >
                {request.instagramHandle}
                <ExternalLink size={12} />
              </a>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Requested: {formatDate(request.requestedAt)}
            </p>
            {request.notes && (
              <p className="text-gray-600 text-sm mt-2 bg-gray-50 p-2 rounded">
                Note: {request.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}
          >
            <StatusIcon size={14} />
            {config.label}
          </span>

          {updating ? (
            <Loader2 className="animate-spin text-gray-400" size={20} />
          ) : (
            <div className="flex gap-2">
              {request.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(request.id, "IN_PROGRESS")}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(request.id, "REJECTED")}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              {request.status === "IN_PROGRESS" && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(request.id, "COMPLETED")}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Connected
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(request.id, "PENDING")}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Pending
                  </button>
                </>
              )}
              {(request.status === "COMPLETED" ||
                request.status === "REJECTED") && (
                <button
                  type="button"
                  onClick={() => onDelete(request.id)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
