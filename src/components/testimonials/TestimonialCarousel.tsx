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

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start mb-6">
          <Quote className="w-10 h-10 text-white/80 flex-shrink-0 mt-2" />
          <h2 className="text-2xl font-bold text-white ml-3">
            What People Say About This Club
          </h2>
        </div>

        <div className="relative">
          {testimonials.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          <div className="rounded-lg p-6 min-h-[200px]">
            <div className="space-y-4">
              <p className="text-white text-lg leading-relaxed italic">
                &ldquo;{currentTestimonial.content}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div>
                  <p className="font-medium text-white">
                    {currentTestimonial.user.name ||
                      currentTestimonial.user.username}
                  </p>
                  <p className="text-sm text-white/80">
                    {new Date(
                      currentTestimonial.submittedAt
                    ).toLocaleDateString("en-IE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {testimonials.length > 1 && (
                  <div className="text-sm text-white/80">
                    {currentIndex + 1} of {testimonials.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {testimonials.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
