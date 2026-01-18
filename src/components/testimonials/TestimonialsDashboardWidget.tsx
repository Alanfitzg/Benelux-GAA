"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Clock, AlertCircle, Check, X } from "lucide-react";

interface ApiTestimonial {
  id: string;
  status: string;
  content: string;
  user: {
    name: string | null;
    username: string;
  };
  submittedAt: string;
}

interface TestimonialSummary {
  pending: number;
  superAdminApproved: number;
  approved: number;
  total: number;
  recentTestimonials: Array<{
    id: string;
    content: string;
    status: string;
    user: {
      name: string | null;
      username: string;
    };
    submittedAt: string;
  }>;
}

interface TestimonialsDashboardWidgetProps {
  clubId: string;
  isMainlandEurope?: boolean;
}

export default function TestimonialsDashboardWidget({
  clubId,
  isMainlandEurope = true,
}: TestimonialsDashboardWidgetProps) {
  const [summary, setSummary] = useState<TestimonialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const buildSummaryFromTestimonials = (
    testimonials: ApiTestimonial[]
  ): TestimonialSummary => {
    return {
      pending: testimonials.filter((t) => t.status === "PENDING").length,
      superAdminApproved: testimonials.filter(
        (t) => t.status === "SUPER_ADMIN_APPROVED"
      ).length,
      approved: testimonials.filter((t) => t.status === "APPROVED").length,
      total: testimonials.length,
      recentTestimonials: testimonials
        .filter((t) => t.status === "SUPER_ADMIN_APPROVED")
        .slice(0, 3)
        .map((t) => ({
          id: t.id,
          content: t.content,
          status: t.status,
          user: t.user,
          submittedAt: t.submittedAt,
        })),
    };
  };

  useEffect(() => {
    const fetchTestimonialSummary = async () => {
      try {
        const response = await fetch(`/api/testimonials?clubId=${clubId}`);
        if (response.ok) {
          const testimonials: ApiTestimonial[] = await response.json();
          const summaryData = buildSummaryFromTestimonials(testimonials);
          setSummary(summaryData);
        }
      } catch (error) {
        console.error("Error fetching testimonial summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonialSummary();
  }, [clubId]);

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

      // Refresh the summary
      const summaryResponse = await fetch(`/api/testimonials?clubId=${clubId}`);
      if (summaryResponse.ok) {
        const testimonials: ApiTestimonial[] = await summaryResponse.json();
        const summaryData = buildSummaryFromTestimonials(testimonials);
        setSummary(summaryData);
      }
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

      // Refresh the summary
      const summaryResponse = await fetch(`/api/testimonials?clubId=${clubId}`);
      if (summaryResponse.ok) {
        const testimonials: ApiTestimonial[] = await summaryResponse.json();
        const summaryData = buildSummaryFromTestimonials(testimonials);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      alert(
        error instanceof Error ? error.message : "Failed to reject testimonial"
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const hasActionNeeded = summary.superAdminApproved > 0;

  // For Irish clubs (non-European), show only approved testimonials in view-only mode
  const approvedTestimonials = summary.recentTestimonials.filter(
    (t) => t.status === "APPROVED"
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            {isMainlandEurope ? "Club Testimonials" : "Host Reviews"}
          </h2>
          {isMainlandEurope && (
            <Link
              href={`/club-admin/${clubId}/testimonials`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage All →
            </Link>
          )}
        </div>

        {/* Stats Overview - Different for European vs Irish clubs */}
        {isMainlandEurope ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {summary.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {summary.approved}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.superAdminApproved}
              </div>
              <div className="text-sm text-gray-600">Awaiting Review</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {summary.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">
                {summary.total}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {summary.approved}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
          </div>
        )}

        {/* Action Needed Alert - Only for European clubs */}
        {isMainlandEurope && hasActionNeeded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">Action Needed</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have {summary.superAdminApproved} testimonial
                  {summary.superAdminApproved !== 1 ? "s" : ""} awaiting your
                  approval.
                </p>
                <Link
                  href={`/club-admin/${clubId}/testimonials`}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  Review Now →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Testimonials Awaiting Approval - Only for European clubs */}
        {isMainlandEurope && summary.recentTestimonials.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Recent Testimonials Awaiting Your Approval
            </h3>
            <div className="space-y-3">
              {summary.recentTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-900">
                          {testimonial.user.name || testimonial.user.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            testimonial.submittedAt
                          ).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          <Clock className="w-3 h-3" />
                          Awaiting Review
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(testimonial.id)}
                        disabled={processingId === testimonial.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-medium rounded transition-colors disabled:opacity-50"
                        title="Approve testimonial"
                      >
                        <Check className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(testimonial.id)}
                        disabled={processingId === testimonial.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium rounded transition-colors disabled:opacity-50"
                        title="Reject testimonial"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Reviews - View only for Irish clubs */}
        {!isMainlandEurope && summary.approved > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Published Reviews from Host Clubs
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Reviews are managed by PlayAway. Contact support if you have
              concerns about any review.
            </p>
            {approvedTestimonials.length > 0 ? (
              <div className="space-y-3">
                {approvedTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <p className="text-sm text-gray-700 line-clamp-2">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-gray-900">
                        {testimonial.user.name || testimonial.user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(testimonial.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        <Check className="w-3 h-3" />
                        Published
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Your published reviews will appear here.
              </p>
            )}
          </div>
        )}

        {/* Empty State */}
        {summary.total === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {isMainlandEurope ? "No testimonials yet" : "No reviews yet"}
            </h3>
            <p className="text-gray-600">
              {isMainlandEurope
                ? "Testimonials from visitors will appear here once submitted."
                : "Reviews from host clubs you've visited will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
