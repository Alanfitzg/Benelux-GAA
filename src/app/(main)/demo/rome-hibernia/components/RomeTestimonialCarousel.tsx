"use client";

import { useState, useEffect, useCallback } from "react";

interface Testimonial {
  id: string;
  name: string | null;
  memberClubName?: string | null;
  clubName?: string | null;
  clubCrest?: string | null;
  content: string | null;
}

const sampleTestimonials: Testimonial[] = [
  {
    id: "sample-1",
    name: "Ciaran Harkin",
    clubName: "Annaghdown GAA, Galway",
    clubCrest: "/club-crests/galway/annaghdown-football-official.gif",
    content: "Rome were class. Great hosts, we had a blast.",
  },
];

interface RomeTestimonialCarouselProps {
  clubId: string;
  darkMode?: boolean;
}

export default function RomeTestimonialCarousel({
  clubId,
  darkMode = false,
}: RomeTestimonialCarouselProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch(
          `/api/club-testimonials?clubId=${clubId}&status=APPROVED`
        );
        const data = await res.json();
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, [clubId]);

  const goToNext = useCallback(() => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  }, [testimonials.length]);

  const goToPrev = useCallback(() => {
    if (testimonials.length > 0) {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
    }
  }, [testimonials.length]);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;

    const interval = setInterval(goToNext, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length, isPaused, goToNext]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div
          className={`animate-pulse rounded-xl h-40 w-full max-w-2xl ${darkMode ? "bg-white/10" : "bg-gray-200"}`}
        />
      </div>
    );
  }

  // Use sample testimonials if none from API
  const displayTestimonials =
    testimonials.length > 0 ? testimonials : sampleTestimonials;
  const current =
    displayTestimonials[currentIndex % displayTestimonials.length];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Testimonial Card - White background for contrast */}
      <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Large quote mark - inside card top left */}
        <span className="absolute top-3 left-5 text-5xl sm:text-6xl font-serif leading-none select-none text-[#c41e3a]/40">
          &ldquo;
        </span>

        {/* Testimonial Text */}
        <p className="relative text-base sm:text-lg leading-relaxed mb-5 pt-8 text-gray-700">
          {current.content}
        </p>

        {/* Author */}
        <div className="flex items-center gap-3">
          {current.clubCrest ? (
            <img
              src={current.clubCrest}
              alt={current.clubName || "Club crest"}
              className="w-14 h-14 object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-[#c41e3a]">
              {current.name?.charAt(0) || "?"}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {current.name}
            </p>
            {(current.memberClubName || current.clubName) && (
              <p className="text-xs text-gray-500">
                {current.memberClubName || current.clubName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation - dots and arrows together */}
      {displayTestimonials.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            type="button"
            onClick={goToPrev}
            className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex gap-1.5">
            {displayTestimonials.map((_, index) => (
              <button
                key={displayTestimonials[index].id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-[#c41e3a] w-4"
                    : "bg-gray-600 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Next testimonial"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
