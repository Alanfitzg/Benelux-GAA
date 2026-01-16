"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MailOpen,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Calendar,
  MessageSquare,
  User,
  Building,
  Check,
  Filter,
  Inbox,
} from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  clubName: string | null;
  message: string | null;
  type: string;
  isRead: boolean;
  isArchived: boolean;
  respondedAt: string | null;
  submittedAt: string;
}

interface Stats {
  unread: number;
  active: number;
  archived: number;
}

interface ClubInquiriesMailboxProps {
  clubId: string;
  clubName: string;
}

export default function ClubInquiriesMailbox({
  clubId,
  clubName,
}: ClubInquiriesMailboxProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<Stats>({
    unread: 0,
    active: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active");
  const [typeFilter, setTypeFilter] = useState<"all" | "interest" | "contact">(
    "all"
  );
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      const params = new URLSearchParams({ filter, type: typeFilter });
      const response = await fetch(`/api/clubs/${clubId}/inquiries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  }, [clubId, filter, typeFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateInquiry = async (
    inquiryId: string,
    updates: Partial<Inquiry>
  ) => {
    setUpdating(inquiryId);
    try {
      const response = await fetch(
        `/api/clubs/${clubId}/inquiries/${inquiryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiryId ? updated : i))
        );
        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry(updated);
        }
        // Refresh stats
        fetchInquiries();
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleSelect = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.isRead) {
      await updateInquiry(inquiry.id, { isRead: true });
    }
  };

  const handleMarkResponded = async (inquiry: Inquiry) => {
    await updateInquiry(inquiry.id, {
      respondedAt: inquiry.respondedAt ? null : new Date().toISOString(),
    });
  };

  const handleArchive = async (inquiry: Inquiry) => {
    await updateInquiry(inquiry.id, { isArchived: !inquiry.isArchived });
    if (inquiry.isArchived) {
      setSelectedInquiry(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-GB", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Inbox</h2>
            {stats.unread > 0 && (
              <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.unread} new
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 px-4 py-3 flex flex-wrap gap-2 sm:gap-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === "active"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setFilter("archived")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === "archived"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Archived ({stats.archived})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "all" | "interest" | "contact")
            }
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All types</option>
            <option value="interest">Visit Interest</option>
            <option value="contact">Contact</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row min-h-[400px]">
        {/* Inquiry List */}
        <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto max-h-[300px] lg:max-h-[500px]">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                {filter === "archived"
                  ? "No archived inquiries"
                  : "No inquiries yet"}
              </p>
              <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                {filter === "archived"
                  ? "Archived inquiries will appear here for your records"
                  : "When teams express interest in visiting your club or contact you through your profile, their messages will appear here."}
              </p>
              {filter === "active" && (
                <div className="mt-4 text-left bg-gray-50 rounded-lg p-3 max-w-xs mx-auto">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    How to get more inquiries:
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Complete your club profile with photos</li>
                    <li>• Set your day-pass price</li>
                    <li>• Host events to attract teams</li>
                    <li>• Add your available dates to the calendar</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  type="button"
                  onClick={() => handleSelect(inquiry)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedInquiry?.id === inquiry.id ? "bg-primary/5" : ""
                  } ${!inquiry.isRead ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {inquiry.isRead ? (
                        <MailOpen className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Mail className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm truncate ${
                            !inquiry.isRead
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {inquiry.name}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDate(inquiry.submittedAt)}
                        </span>
                      </div>
                      {inquiry.clubName && (
                        <p className="text-xs text-gray-500 truncate">
                          {inquiry.clubName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            inquiry.type === "interest"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {inquiry.type === "interest" ? "Visit" : "Contact"}
                        </span>
                        {inquiry.respondedAt && (
                          <span className="text-xs text-green-600 flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            Replied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Inquiry Detail */}
        <div className="lg:w-3/5 p-4 sm:p-6">
          {selectedInquiry ? (
            <div className="space-y-4">
              {/* Detail Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedInquiry.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedInquiry.submittedAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    selectedInquiry.type === "interest"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedInquiry.type === "interest"
                    ? "Visit Interest"
                    : "Contact Message"}
                </span>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">
                    {selectedInquiry.name}
                  </span>
                </div>
                {selectedInquiry.clubName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Club:</span>
                    <span className="font-medium text-gray-900">
                      {selectedInquiry.clubName}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
              </div>

              {/* Message */}
              {selectedInquiry.message && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Message
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedInquiry.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: Your interest in visiting ${clubName}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Reply via Email
                </a>
                <button
                  type="button"
                  onClick={() => handleMarkResponded(selectedInquiry)}
                  disabled={updating === selectedInquiry.id}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedInquiry.respondedAt
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {selectedInquiry.respondedAt
                    ? "Marked as Replied"
                    : "Mark as Replied"}
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(selectedInquiry)}
                  disabled={updating === selectedInquiry.id}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {selectedInquiry.isArchived ? (
                    <>
                      <ArchiveRestore className="w-4 h-4" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      Archive
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Select an inquiry to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
