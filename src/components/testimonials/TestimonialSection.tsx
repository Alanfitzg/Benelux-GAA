'use client';

import { useState } from 'react';
import TestimonialCarousel from './TestimonialCarousel';
import TestimonialForm from './TestimonialForm';
import { MessageSquarePlus, X } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Testimonials Carousel - Always visible if there are approved testimonials */}
      {approvedTestimonials.length > 0 && (
        <TestimonialCarousel testimonials={approvedTestimonials} />
      )}

      {/* Add Testimonial Button and Form */}
      {isAuthenticated && (
        <div>
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                <MessageSquarePlus className="w-5 h-5" />
                {userTestimonial ? 'Edit Your Testimonial' : 'Add a Testimonial'}
              </button>
              {approvedTestimonials.length === 0 && (
                <p className="text-sm text-gray-600 mt-3">
                  Be the first to share your experience with {clubName}!
                </p>
              )}
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

      {/* Message for non-authenticated users */}
      {!isAuthenticated && approvedTestimonials.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            No testimonials yet. Sign in to be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
}