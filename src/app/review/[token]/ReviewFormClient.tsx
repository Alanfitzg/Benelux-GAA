"use client";

import { useState, useEffect } from "react";
import { StarRating } from "@/components/reviews/StarRating";
import Image from "next/image";

interface TokenData {
  valid: boolean;
  tokenId: string;
  event: {
    id: string;
    title: string;
    eventType: string;
    location: string;
    startDate: string;
    endDate: string | null;
  };
  reviewerClub: {
    id: string;
    name: string;
  };
  targetClub: {
    id: string;
    name: string;
  };
  expiresAt: string;
}

interface ReviewFormClientProps {
  token: string;
}

export function ReviewFormClient({ token }: ReviewFormClientProps) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [complaint, setComplaint] = useState("");
  const [improvementSuggestion, setImprovementSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    async function validateToken() {
      try {
        const response = await fetch(`/api/reviews/token/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error);
          setErrorCode(data.code);
          return;
        }

        setTokenData(data);
      } catch {
        setError("Failed to validate review link");
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          content: rating >= 4 ? content : undefined,
          complaint: rating <= 2 ? complaint : undefined,
          improvementSuggestion:
            rating === 3 ? improvementSuggestion : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSubmitted(true);
      setSubmitMessage(data.message);
    } catch {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            {errorCode === "EXPIRED" ? (
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : errorCode === "ALREADY_USED" ? (
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {errorCode === "EXPIRED" && "Link Expired"}
            {errorCode === "ALREADY_USED" && "Already Submitted"}
            {errorCode === "INVALID_TOKEN" && "Invalid Link"}
            {!errorCode && "Something Went Wrong"}
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">{submitMessage}</p>
        </div>
      </div>
    );
  }

  if (!tokenData) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 py-8 md:py-12">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/images/playaway-logo.png"
              alt="PlayAway"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-semibold text-lg">PlayAway</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Share Your Experience</h1>
          <p className="opacity-90">
            Your feedback helps us improve the platform for everyone
          </p>
        </div>

        {/* Event Info */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {tokenData.event.title}
              </h3>
              <p className="text-sm text-gray-600">
                {tokenData.event.location}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(tokenData.event.startDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Review Context */}
        <div className="p-4 border-b bg-blue-50">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{tokenData.reviewerClub.name}</span>{" "}
            reviewing{" "}
            <span className="font-medium">{tokenData.targetClub.name}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              How would you rate your experience?
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          {/* Conditional Fields */}
          {rating > 0 && (
            <div className="space-y-4 pt-4 border-t">
              {/* 1-2 Stars: Complaint */}
              {rating <= 2 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    We&apos;re sorry to hear that. Please tell us what went
                    wrong:
                  </label>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Please describe your concerns in detail..."
                    rows={5}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-red-600 mt-2">
                    Your feedback will be reviewed by our team and we will
                    follow up with you.
                  </p>
                </div>
              )}

              {/* 3 Stars: Improvement Suggestion */}
              {rating === 3 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-yellow-800 mb-2">
                    What could be improved?
                  </label>
                  <textarea
                    value={improvementSuggestion}
                    onChange={(e) => setImprovementSuggestion(e.target.value)}
                    placeholder="Share your suggestions for improvement..."
                    rows={4}
                    className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
              )}

              {/* 4-5 Stars: Testimonial */}
              {rating >= 4 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Share your experience:
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us about your great experience..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-green-600">
                      Your testimonial may be displayed on the club&apos;s
                      profile (after approval).
                    </p>
                    <span className="text-xs text-gray-500">
                      {content.length}/500
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white
              transition-all duration-200
              ${
                rating === 0 || submitting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 active:scale-[0.98]"
              }
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center">
          <p className="text-xs text-gray-500">
            This review link expires on {formatDate(tokenData.expiresAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
