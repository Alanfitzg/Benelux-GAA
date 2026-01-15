"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, AlertCircle } from "lucide-react";

interface Testimonial {
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

interface TestimonialAdminPanelProps {
  pendingTestimonials: Testimonial[];
  deletionRequests: Testimonial[];
}

export default function TestimonialAdminPanel({
  pendingTestimonials,
  deletionRequests,
}: TestimonialAdminPanelProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "deletions">(
    "pending"
  );

  const handleApprove = async (testimonialId: string) => {
    setProcessingId(testimonialId);
    try {
      const response = await fetch(
        `/api/testimonials/${testimonialId}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve testimonial");
      }

      router.refresh();
    } catch (error) {
      console.error("Error approving testimonial:", error);
      alert(
        error instanceof Error ? error.message : "Failed to approve testimonial"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (testimonialId: string) => {
    if (!confirm("Are you sure you want to reject this testimonial?")) return;

    setProcessingId(testimonialId);
    try {
      const response = await fetch(
        `/api/testimonials/${testimonialId}/reject`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject testimonial");
      }

      router.refresh();
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      alert(
        error instanceof Error ? error.message : "Failed to reject testimonial"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this testimonial? This action cannot be undone."
      )
    )
      return;

    setProcessingId(testimonialId);
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete testimonial");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete testimonial"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const TestimonialCard = ({
    testimonial,
    showDeleteRequest = false,
  }: {
    testimonial: Testimonial;
    showDeleteRequest?: boolean;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-lg truncate">
            {testimonial.club.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">
            By {testimonial.user.name || testimonial.user.username}
          </p>
          <p className="hidden sm:block text-xs sm:text-sm text-gray-600">
            ({testimonial.user.email})
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Submitted:{" "}
            {new Date(testimonial.submittedAt).toLocaleDateString("en-IE")}
          </p>
          {showDeleteRequest && testimonial.deleteRequestedAt && (
            <p className="text-[10px] sm:text-xs text-red-600 mt-1">
              Deletion requested:{" "}
              {new Date(testimonial.deleteRequestedAt).toLocaleDateString(
                "en-IE"
              )}
            </p>
          )}
        </div>
        {showDeleteRequest && (
          <div className="ml-2 flex-shrink-0 bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
            <span className="hidden sm:inline">Deletion Requested</span>
            <span className="sm:hidden">Delete</span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded p-2 sm:p-4 mb-3 sm:mb-4">
        <p className="text-xs sm:text-base text-gray-700 italic">
          &ldquo;{testimonial.content}&rdquo;
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {!showDeleteRequest && (
          <>
            <button
              type="button"
              onClick={() => handleApprove(testimonial.id)}
              disabled={processingId === testimonial.id}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Approve</span>
              <span className="sm:hidden">OK</span>
            </button>
            <button
              type="button"
              onClick={() => handleReject(testimonial.id)}
              disabled={processingId === testimonial.id}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
              Reject
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => handleDelete(testimonial.id)}
          disabled={processingId === testimonial.id}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Delete Permanently</span>
          <span className="sm:hidden">Delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`pb-2 px-1 text-xs sm:text-base font-medium transition-colors ${
            activeTab === "pending"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="hidden sm:inline">Pending Review</span>
          <span className="sm:hidden">Pending</span> (
          {pendingTestimonials.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("deletions")}
          className={`pb-2 px-1 text-xs sm:text-base font-medium transition-colors ${
            activeTab === "deletions"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="hidden sm:inline">Deletion Requests</span>
          <span className="sm:hidden">Deletions</span> (
          {deletionRequests.length})
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="space-y-3 sm:space-y-4">
          {pendingTestimonials.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-600">
                No testimonials pending review
              </p>
            </div>
          ) : (
            pendingTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))
          )}
        </div>
      )}

      {activeTab === "deletions" && (
        <div className="space-y-3 sm:space-y-4">
          {deletionRequests.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-600">
                No deletion requests
              </p>
            </div>
          ) : (
            deletionRequests.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                showDeleteRequest
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
