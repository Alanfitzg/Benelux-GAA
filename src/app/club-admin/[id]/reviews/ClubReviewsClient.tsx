"use client";

import { useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  complaint: string | null;
  improvementSuggestion: string | null;
  status: string;
  isConflict: boolean;
  submittedAt: Date | string;
  event: {
    id: string;
    title: string;
    location: string;
    startDate: Date | string;
  };
  reviewerClub: {
    id: string;
    name: string;
  };
  conflict: {
    id: string;
    status: string;
  } | null;
}

interface ClubReviewsClientProps {
  reviews: Review[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUPER_ADMIN_APPROVED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-gray-100 text-gray-800",
  CONFLICT_OPEN: "bg-red-100 text-red-800",
  CONFLICT_RESOLVED: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending Review",
  SUPER_ADMIN_APPROVED: "Awaiting Your Approval",
  APPROVED: "Published",
  REJECTED: "Rejected",
  CONFLICT_OPEN: "Under Investigation",
  CONFLICT_RESOLVED: "Conflict Resolved",
};

export function ClubReviewsClient({ reviews }: ClubReviewsClientProps) {
  const [filter, setFilter] = useState<
    "all" | "positive" | "negative" | "neutral"
  >("all");

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "positive") return review.rating >= 4;
    if (filter === "negative") return review.rating <= 2;
    if (filter === "neutral") return review.rating === 3;
    return true;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "N/A";

  const ratingBreakdown = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{reviews.length}</div>
          <div className="text-sm text-gray-400">Total Reviews</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">
            {averageRating}
          </div>
          <div className="text-sm text-gray-400">Average Rating</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">
            {reviews.filter((r) => r.rating >= 4).length}
          </div>
          <div className="text-sm text-gray-400">Positive (4-5 ★)</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">
            {reviews.filter((r) => r.rating <= 2).length}
          </div>
          <div className="text-sm text-gray-400">Needs Attention (1-2 ★)</div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          Rating Breakdown
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-4">{rating}</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    rating >= 4
                      ? "bg-green-500"
                      : rating === 3
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width:
                      reviews.length > 0
                        ? `${(ratingBreakdown[rating as keyof typeof ratingBreakdown] / reviews.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8">
                {ratingBreakdown[rating as keyof typeof ratingBreakdown]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "All Reviews" },
          { value: "positive", label: "Positive (4-5 ★)" },
          { value: "neutral", label: "Neutral (3 ★)" },
          { value: "negative", label: "Negative (1-2 ★)" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                filter === f.value
                  ? "bg-primary text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {filter === "all"
              ? "After teams visit your club for an event, they can leave feedback about their experience. Reviews help build trust and attract more travelling teams to your club."
              : "No reviews match your filter criteria."}
          </p>
          {filter === "all" && (
            <div className="mt-6 text-left max-w-md mx-auto bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">
                How reviews work:
              </h4>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Teams attend your events or book day passes</li>
                <li>After the event, they receive a review request</li>
                <li>Reviews go through a dual-approval process</li>
                <li>Published reviews appear on your club profile</li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/5 rounded-xl p-5 border border-white/10"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[review.status]}`}
                    >
                      {statusLabels[review.status]}
                    </span>
                    {review.isConflict && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-300">
                        Conflict Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    From{" "}
                    <span className="text-white font-medium">
                      {review.reviewerClub.name}
                    </span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
              </div>

              {/* Event Info */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-white">
                  {review.event.title}
                </p>
                <p className="text-xs text-gray-400">
                  {review.event.location} • {formatDate(review.event.startDate)}
                </p>
              </div>

              {/* Review Content */}
              {review.content && (
                <div className="mb-3">
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">
                    &ldquo;{review.content}&rdquo;
                  </p>
                </div>
              )}

              {review.improvementSuggestion && (
                <div className="bg-yellow-500/10 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-yellow-400 mb-1">
                    Improvement Suggestion
                  </p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">
                    {review.improvementSuggestion}
                  </p>
                </div>
              )}

              {review.complaint && !review.isConflict && (
                <div className="bg-red-500/10 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-red-400 mb-1">
                    Concerns Raised
                  </p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">
                    {review.complaint}
                  </p>
                </div>
              )}

              {review.isConflict && (
                <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                  <p className="text-sm text-red-300">
                    This review has been flagged for conflict resolution. Our
                    team is reviewing the concerns raised.
                  </p>
                  {review.conflict && (
                    <p className="text-xs text-gray-400 mt-2">
                      Status: {review.conflict.status.replace("_", " ")}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                Submitted {formatDate(review.submittedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
