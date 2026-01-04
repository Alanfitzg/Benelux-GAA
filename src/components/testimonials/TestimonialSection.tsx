"use client";

import { useState } from "react";
import TestimonialCarousel from "./TestimonialCarousel";
import TestimonialForm from "./TestimonialForm";
import { MessageSquarePlus, X } from "lucide-react";

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

interface TestimonialSectionProps {
  clubId: string;
  clubName: string;
  approvedTestimonials: Testimonial[];
  userTestimonial?: {
    id: string;
    content: string;
  };
  isAuthenticated: boolean;
}

export default function TestimonialSection({
  clubId,
  clubName,
  approvedTestimonials,
  userTestimonial,
  isAuthenticated,
}: TestimonialSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const placeholderTestimonial: Testimonial = {
    id: "placeholder",
    content: `Playing with ${clubName} was an unforgettable experience. The hospitality and competitive spirit made our trip truly special.`,
    user: {
      id: "placeholder",
      name: "PlayAway Traveller",
      username: "playaway",
    },
    submittedAt: new Date().toISOString(),
  };

  const testimonialsToDisplay =
    approvedTestimonials.length > 0
      ? approvedTestimonials
      : [placeholderTestimonial];

  return (
    <div className="space-y-6">
      {/* Testimonials Carousel - Always visible */}
      <TestimonialCarousel testimonials={testimonialsToDisplay} />

      {/* Add Testimonial Button and Form */}
      {isAuthenticated && (
        <div>
          {!showForm ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4" />
                {userTestimonial
                  ? "Edit Your Testimonial"
                  : "Share Your Experience"}
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                aria-label="Close form"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <TestimonialForm
                clubId={clubId}
                clubName={clubName}
                existingTestimonial={userTestimonial}
                onSuccess={() => {
                  setShowForm(false);
                  window.location.reload();
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
