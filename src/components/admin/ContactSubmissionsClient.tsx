"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Eye,
  Trash2,
  CheckCircle,
  Archive,
  AlertTriangle,
  Inbox,
} from "lucide-react";

type ContactStatus = "NEW" | "READ" | "RESPONDED" | "ARCHIVED";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  respondedAt: string | null;
  respondedBy: string | null;
  response: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  byStatus: { status: ContactStatus; _count: { status: number } }[];
  recentCount: number;
}

interface ContactSubmissionsClientProps {
  submissions: ContactSubmission[];
  stats: Stats;
}

const STATUS_COLORS: Record<ContactStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  READ: "bg-yellow-100 text-yellow-800",
  RESPONDED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  NEW: "New",
  READ: "Read",
  RESPONDED: "Responded",
  ARCHIVED: "Archived",
};

export default function ContactSubmissionsClient({
  submissions: initialSubmissions,
  stats,
}: ContactSubmissionsClientProps) {
  const [submissions, setSubmissions] =
    useState<ContactSubmission[]>(initialSubmissions);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<ContactStatus | "ALL">("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredSubmissions =
    filter === "ALL"
      ? submissions
      : submissions.filter((s) => s.status === filter);

  const selectedSubmission =
    selectedIndex !== null ? filteredSubmissions[selectedIndex] : null;

  const openModal = (index: number) => {
    setSelectedIndex(index);
    const submission = filteredSubmissions[index];
    if (submission.status === "NEW") {
      updateStatus(submission.id, "READ");
    }
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (
      selectedIndex !== null &&
      selectedIndex < filteredSubmissions.length - 1
    ) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    }
  };

  const updateStatus = async (id: string, status: ContactStatus) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setUpdating(null);
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selectedIndex !== null) {
          closeModal();
        }
      }
    } catch (error) {
      console.error("Failed to delete submission:", error);
    }
    setDeleting(null);
  };

  const getStatusCount = (status: ContactStatus) => {
    return stats.byStatus.find((s) => s.status === status)?._count.status || 0;
  };

  const isSpamLikely = (submission: ContactSubmission) => {
    const spamPatterns = [
      /^[a-z]{15,}$/i,
      /[A-Z]{5,}[a-z]{5,}[A-Z]{5,}/,
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    ];
    const hasRandomName = spamPatterns.some((p) => p.test(submission.name));
    const hasRandomSubject =
      submission.subject.length > 50 && !/\s/.test(submission.subject);
    return hasRandomName || hasRandomSubject;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800"
      onKeyDown={selectedIndex !== null ? handleKeyDown : undefined}
      tabIndex={-1}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Inbox className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Contact Submissions
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage contact form messages from the website
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              Total
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
              {stats.total}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              New (Unread)
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {getStatusCount("NEW")}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              This Week
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {stats.recentCount}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              Archived
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-gray-600">
              {getStatusCount("ARCHIVED")}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({stats.total})
            </button>
            {(["NEW", "READ", "RESPONDED", "ARCHIVED"] as ContactStatus[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {STATUS_LABELS[status]} ({getStatusCount(status)})
                </button>
              )
            )}
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Mobile Cards View */}
          <div className="sm:hidden divide-y divide-gray-100">
            {filteredSubmissions.map((submission, index) => (
              <div key={submission.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {submission.name}
                      </span>
                      {isSpamLikely(submission) && (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {submission.email}
                    </div>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[submission.status]
                    }`}
                  >
                    {STATUS_LABELS[submission.status]}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {submission.subject}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(index)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubmission(submission.id)}
                    disabled={deleting === submission.id}
                    className="py-2.5 px-3 bg-red-100 text-red-600 text-sm font-medium rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission, index) => (
                  <tr
                    key={submission.id}
                    className={`hover:bg-gray-50 ${
                      isSpamLikely(submission) ? "bg-amber-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {submission.name}
                            {isSpamLikely(submission) && (
                              <span
                                className="text-amber-500"
                                title="Possible spam"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {submission.subject}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {submission.message.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[submission.status]
                        }`}
                      >
                        {STATUS_LABELS[submission.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(submission.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(index)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubmission(submission.id)}
                          disabled={deleting === submission.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No submissions
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === "ALL"
                  ? "Contact form submissions will appear here."
                  : `No ${STATUS_LABELS[filter].toLowerCase()} submissions found.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  Contact Message
                </h3>
                <span className="text-sm text-white/70">
                  {selectedIndex! + 1} of {filteredSubmissions.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={selectedIndex === filteredSubmissions.length - 1}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Spam Warning */}
                {isSpamLikely(selectedSubmission) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">
                        Possible Spam Detected
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        This submission has characteristics commonly associated
                        with bot spam (random-looking name or subject).
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {selectedSubmission.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${selectedSubmission.email}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {selectedSubmission.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(
                          selectedSubmission.createdAt
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          selectedSubmission.createdAt
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[selectedSubmission.status]
                        }`}
                      >
                        {STATUS_LABELS[selectedSubmission.status]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Subject</h4>
                  <p className="text-gray-700">{selectedSubmission.subject}</p>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Message
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedSubmission.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedSubmission.id, "RESPONDED")
                  }
                  disabled={
                    updating === selectedSubmission.id ||
                    selectedSubmission.status === "RESPONDED"
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Responded
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedSubmission.id, "ARCHIVED")
                  }
                  disabled={
                    updating === selectedSubmission.id ||
                    selectedSubmission.status === "ARCHIVED"
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              </div>
              <button
                type="button"
                onClick={() => deleteSubmission(selectedSubmission.id)}
                disabled={deleting === selectedSubmission.id}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
