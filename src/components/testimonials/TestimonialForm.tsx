'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TestimonialFormProps {
  clubId: string;
  clubName: string;
  existingTestimonial?: {
    id: string;
    content: string;
  };
  onSuccess?: () => void;
}

export default function TestimonialForm({
  clubId,
  clubName,
  existingTestimonial,
  onSuccess,
}: TestimonialFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(existingTestimonial?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(existingTestimonial?.content.length || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim().length === 0) {
      setError('Please enter your testimonial');
      return;
    }

    if (content.length > 500) {
      setError('Testimonial must be 500 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = existingTestimonial
        ? `/api/testimonials/${existingTestimonial.id}`
        : '/api/testimonials';
      
      const method = existingTestimonial ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit testimonial');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }

      setContent('');
      setCharCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= 500) {
      setContent(newContent);
      setCharCount(newContent.length);
      setError(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">
        {existingTestimonial ? 'Edit Your Testimonial' : `Leave a Testimonial for ${clubName}`}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700 mb-2">
            Your Testimonial
          </label>
          <textarea
            id="testimonial"
            value={content}
            onChange={handleContentChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Share your experience with this club..."
            disabled={isSubmitting}
          />
          <div className="mt-1 flex justify-between text-sm">
            <span className={charCount > 450 ? 'text-orange-600' : 'text-gray-500'}>
              {charCount}/500 characters
            </span>
            {existingTestimonial && (
              <span className="text-gray-500">
                Note: Editing will reset the approval status
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || charCount === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : existingTestimonial ? 'Update Testimonial' : 'Submit Testimonial'}
          </button>
          
          {existingTestimonial && (
            <button
              type="button"
              onClick={() => {
                setContent(existingTestimonial.content);
                setCharCount(existingTestimonial.content.length);
                setError(null);
              }}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}