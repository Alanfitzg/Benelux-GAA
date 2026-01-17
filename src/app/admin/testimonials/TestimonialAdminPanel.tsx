"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, AlertCircle, Plane, Home, Star } from "lucide-react";

// Legacy testimonial type (existing system)
interface LegacyTestimonial {
  id: string;
  content: string;
  status: string;
  deleteRequested?: boolean;
  deleteRequestedAt?: string | null;
  submittedAt: string;
  user: {
    id: string;
    name: string | null;
    username: string;
    email: string;
  };
  club: {
    id: string;
    name: string;
  };
}

// New guest testimonial type (travelling clubs reviewing hosts)
interface GuestTestimonial {
  id: string;
  content: string;
  rating: number | null;
  status: string;
  deleteRequested?: boolean;
  deleteRequestedAt?: string | null;
  deleteRequestedBy?: string | null;
  submittedAt: string;
  approvedAt?: string | null;
  guestClub: {
    id: string;
    name: string;
    location: string | null;
  };
  hostClub: {
    id: string;
    name: string;
    location: string | null;
  };
  guestUser: {
    id: string;
    name: string | null;
    username: string;
    email: string;
  };
  event?: {
    id: string;
    title: string;
  } | null;
}

// New host testimonial type (hosts reviewing travelling clubs)
interface HostTestimonial {
  id: string;
  content: string;
  rating: number | null;
  status: string;
  deleteRequested?: boolean;
  deleteRequestedAt?: string | null;
  deleteRequestedBy?: string | null;
  submittedAt: string;
  approvedAt?: string | null;
  hostClub: {
    id: string;
    name: string;
    location: string | null;
  };
  guestClub: {
    id: string;
    name: string;
    location: string | null;
  };
  hostUser: {
    id: string;
    name: string | null;
    username: string;
    email: string;
  };
  event?: {
    id: string;
    title: string;
  } | null;
}

type TabType = "guest" | "host" | "legacy" | "deletions";

interface TestimonialAdminPanelProps {
  legacyTestimonials: LegacyTestimonial[];
  legacyDeletionRequests: LegacyTestimonial[];
  guestTestimonials: GuestTestimonial[];
  guestDeletionRequests: GuestTestimonial[];
  hostTestimonials: HostTestimonial[];
  hostDeletionRequests: HostTestimonial[];
}

export default function TestimonialAdminPanel({
  legacyTestimonials,
  legacyDeletionRequests,
  guestTestimonials,
  guestDeletionRequests,
  hostTestimonials,
  hostDeletionRequests,
}: TestimonialAdminPanelProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("guest");

  const totalPending =
    legacyTestimonials.length +
    guestTestimonials.length +
    hostTestimonials.length;
  const totalDeletions =
    legacyDeletionRequests.length +
    guestDeletionRequests.length +
    hostDeletionRequests.length;

  // API handlers for legacy testimonials
  const handleLegacyApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/testimonials/${id}/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to approve testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLegacyReject = async (id: string) => {
    if (!confirm("Reject this testimonial?")) return;
    setProcessingId(id);
    try {
      const response = await fetch(`/api/testimonials/${id}/reject`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reject");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to reject testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLegacyDelete = async (id: string) => {
    if (!confirm("Permanently delete this testimonial?")) return;
    setProcessingId(id);
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  // API handlers for guest testimonials
  const handleGuestApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/guest-testimonials/${id}/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to approve testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGuestReject = async (id: string) => {
    if (!confirm("Reject this testimonial?")) return;
    setProcessingId(id);
    try {
      const response = await fetch(`/api/guest-testimonials/${id}/reject`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reject");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to reject testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGuestDelete = async (id: string) => {
    if (!confirm("Permanently delete this testimonial?")) return;
    setProcessingId(id);
    try {
      const response = await fetch(`/api/guest-testimonials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  // API handlers for host testimonials
  const handleHostApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/host-testimonials/${id}/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to approve testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const handleHostReject = async (id: string) => {
    if (!confirm("Reject this testimonial?")) return;
    setProcessingId(id);
    try {
      const response = await fetch(`/api/host-testimonials/${id}/reject`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reject");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to reject testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const handleHostDelete = async (id: string) => {
    if (!confirm("Permanently delete this testimonial?")) return;
    setProcessingId(id);
    try {
      const response = await fetch(`/api/host-testimonials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
      <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
      <p className="text-sm sm:text-base text-gray-600">{message}</p>
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("guest")}
          className={`flex items-center gap-1.5 pb-2 px-1 text-xs sm:text-base font-medium transition-colors ${
            activeTab === "guest"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Plane className="w-4 h-4" />
          <span className="hidden sm:inline">Guest Reviews</span>
          <span className="sm:hidden">Guests</span>
          <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
            {guestTestimonials.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("host")}
          className={`flex items-center gap-1.5 pb-2 px-1 text-xs sm:text-base font-medium transition-colors ${
            activeTab === "host"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Host Reviews</span>
          <span className="sm:hidden">Hosts</span>
          <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
            {hostTestimonials.length}
          </span>
        </button>
        {legacyTestimonials.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("legacy")}
            className={`pb-2 px-1 text-xs sm:text-base font-medium transition-colors ${
              activeTab === "legacy"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="hidden sm:inline">Legacy</span>
            <span className="sm:hidden">Old</span>
            <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
              {legacyTestimonials.length}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("deletions")}
          className={`pb-2 px-1 text-xs sm:text-base font-medium transition-colors ${
            activeTab === "deletions"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="hidden sm:inline">Deletion Requests</span>
          <span className="sm:hidden">Deletions</span>
          {totalDeletions > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
              {totalDeletions}
            </span>
          )}
        </button>
      </div>

      {/* Guest Reviews Tab */}
      {activeTab === "guest" && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            Reviews from travelling clubs about their host experience
          </div>
          {guestTestimonials.length === 0 ? (
            <EmptyState message="No guest testimonials pending review" />
          ) : (
            guestTestimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Guest Review
                      </span>
                      {renderStars(t.rating)}
                    </div>
                    <h3 className="font-semibold text-sm sm:text-lg">
                      {t.guestClub.name}{" "}
                      <span className="text-gray-400">→</span> {t.hostClub.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      By {t.guestUser.name || t.guestUser.username} (
                      {t.guestUser.email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted:{" "}
                      {new Date(t.submittedAt).toLocaleDateString("en-IE")}
                    </p>
                    {t.event && (
                      <p className="text-xs text-indigo-600 mt-1">
                        Event: {t.event.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 sm:p-4 mb-4">
                  <p className="text-sm sm:text-base text-gray-700 italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleGuestApprove(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGuestReject(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGuestDelete(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Host Reviews Tab */}
      {activeTab === "host" && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            Reviews from host clubs about their visiting teams
          </div>
          {hostTestimonials.length === 0 ? (
            <EmptyState message="No host testimonials pending review" />
          ) : (
            hostTestimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Host Review
                      </span>
                      {renderStars(t.rating)}
                    </div>
                    <h3 className="font-semibold text-sm sm:text-lg">
                      {t.hostClub.name} <span className="text-gray-400">→</span>{" "}
                      {t.guestClub.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      By {t.hostUser.name || t.hostUser.username} (
                      {t.hostUser.email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted:{" "}
                      {new Date(t.submittedAt).toLocaleDateString("en-IE")}
                    </p>
                    {t.event && (
                      <p className="text-xs text-indigo-600 mt-1">
                        Event: {t.event.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 sm:p-4 mb-4">
                  <p className="text-sm sm:text-base text-gray-700 italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleHostApprove(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHostReject(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHostDelete(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Legacy Tab */}
      {activeTab === "legacy" && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            Testimonials from the previous system (single club testimonials)
          </div>
          {legacyTestimonials.length === 0 ? (
            <EmptyState message="No legacy testimonials pending review" />
          ) : (
            legacyTestimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium mb-2 inline-block">
                      Legacy
                    </span>
                    <h3 className="font-semibold text-sm sm:text-lg">
                      {t.club.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      By {t.user.name || t.user.username} ({t.user.email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted:{" "}
                      {new Date(t.submittedAt).toLocaleDateString("en-IE")}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 sm:p-4 mb-4">
                  <p className="text-sm sm:text-base text-gray-700 italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleLegacyApprove(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLegacyReject(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLegacyDelete(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Deletions Tab */}
      {activeTab === "deletions" && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            Testimonials where one of the clubs has requested removal
          </div>

          {totalDeletions === 0 ? (
            <EmptyState message="No deletion requests" />
          ) : (
            <>
              {/* Guest deletion requests */}
              {guestDeletionRequests.map((t) => (
                <div
                  key={`guest-${t.id}`}
                  className="bg-white rounded-lg shadow-sm border border-red-200 p-4 sm:p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          Guest Review
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Deletion Requested
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-lg">
                        {t.guestClub.name} → {t.hostClub.name}
                      </h3>
                      <p className="text-xs text-red-600 mt-1">
                        Requested:{" "}
                        {t.deleteRequestedAt
                          ? new Date(t.deleteRequestedAt).toLocaleDateString(
                              "en-IE"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm text-gray-700 italic">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGuestDelete(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                </div>
              ))}

              {/* Host deletion requests */}
              {hostDeletionRequests.map((t) => (
                <div
                  key={`host-${t.id}`}
                  className="bg-white rounded-lg shadow-sm border border-red-200 p-4 sm:p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Host Review
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Deletion Requested
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-lg">
                        {t.hostClub.name} → {t.guestClub.name}
                      </h3>
                      <p className="text-xs text-red-600 mt-1">
                        Requested:{" "}
                        {t.deleteRequestedAt
                          ? new Date(t.deleteRequestedAt).toLocaleDateString(
                              "en-IE"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm text-gray-700 italic">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHostDelete(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                </div>
              ))}

              {/* Legacy deletion requests */}
              {legacyDeletionRequests.map((t) => (
                <div
                  key={`legacy-${t.id}`}
                  className="bg-white rounded-lg shadow-sm border border-red-200 p-4 sm:p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          Legacy
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Deletion Requested
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-lg">
                        {t.club.name}
                      </h3>
                      <p className="text-xs text-red-600 mt-1">
                        Requested:{" "}
                        {t.deleteRequestedAt
                          ? new Date(t.deleteRequestedAt).toLocaleDateString(
                              "en-IE"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm text-gray-700 italic">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLegacyDelete(t.id)}
                    disabled={processingId === t.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
