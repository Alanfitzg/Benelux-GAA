"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";

interface TokenData {
  valid: boolean;
  clubId: string;
  email: string;
}

export default function TestimonialSubmitPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [clubName, setClubName] = useState("");
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const NAME_LIMIT = 100;
  const CLUB_NAME_LIMIT = 100;
  const CONTENT_LIMIT = 300;

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/club-testimonials/submit/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Invalid link");
          return;
        }

        setTokenData(data);
      } catch {
        setError("Failed to validate link");
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/club-testimonials/submit/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, clubName, content, honeypot }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Failed to submit testimonial");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600">
            This link may have expired or already been used. Please contact Rome
            Hibernia for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">
            Your testimonial has been submitted and is awaiting approval. We
            appreciate you taking the time to share your experience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Image
            src="/club-crests/rome-hibernia-NEW.png"
            alt="Rome Hibernia"
            width={80}
            height={80}
            className="mx-auto mb-4"
            unoptimized
          />
          <h1 className="text-2xl font-bold text-white mb-2">
            Share Your Experience
          </h1>
          <p className="text-gray-300">
            Tell us about your time with Rome Hibernia GAA
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl"
        >
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            className="absolute -left-[9999px]"
            aria-hidden="true"
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, NAME_LIMIT))}
              placeholder="How would you like to be credited?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent transition-colors"
              required
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              <span className={name.length >= NAME_LIMIT ? "text-red-500" : ""}>
                {name.length}
              </span>
              /{NAME_LIMIT}
            </div>
          </div>

          {/* Club Name Field */}
          <div className="mb-5">
            <label
              htmlFor="clubName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Club
            </label>
            <input
              type="text"
              id="clubName"
              value={clubName}
              onChange={(e) =>
                setClubName(e.target.value.slice(0, CLUB_NAME_LIMIT))
              }
              placeholder="e.g. Dublin GAA, London GAA"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent transition-colors"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              <span
                className={
                  clubName.length >= CLUB_NAME_LIMIT ? "text-red-500" : ""
                }
              >
                {clubName.length}
              </span>
              /{CLUB_NAME_LIMIT}
            </div>
          </div>

          {/* Testimonial Field */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Testimonial
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) =>
                setContent(e.target.value.slice(0, CONTENT_LIMIT))
              }
              placeholder="Share your experience with Rome Hibernia..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent transition-colors resize-none"
              required
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              <span
                className={
                  content.length >= CONTENT_LIMIT ? "text-red-500" : ""
                }
              >
                {content.length}
              </span>
              /{CONTENT_LIMIT}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="w-full bg-[#c41e3a] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Testimonial"}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Your testimonial will be reviewed before being published.
          </p>
        </form>
      </div>
    </div>
  );
}
