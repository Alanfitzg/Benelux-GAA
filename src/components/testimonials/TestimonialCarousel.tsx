"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  content: string;
  user: {
    id: string;
    name: string | null;
    username: string;
  };
  submittedAt: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialCarousel({
  testimonials,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          What Visitors Say
        </h3>
      </div>

      <div className="relative">
        <div className="min-h-[100px] sm:min-h-[120px]">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">
            &ldquo;{currentTestimonial.content}&rdquo;
          </p>

          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                {currentTestimonial.user.name ||
                  currentTestimonial.user.username}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {new Date(currentTestimonial.submittedAt).toLocaleDateString(
                  "en-IE",
                  {
                    year: "numeric",
                    month: "short",
                  }
                )}
              </p>
            </div>

            {testimonials.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-xs text-gray-400">
                  {currentIndex + 1}/{testimonials.length}
                </span>
                <button
                  type="button"
                  onClick={goToNext}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
