'use client';

interface TestimonialDebugInfoProps {
  testimonials: Array<{
    id: string;
    status: string;
    content: string;
  }>;
  approvedCount: number;
}

export default function TestimonialDebugInfo({ testimonials, approvedCount }: TestimonialDebugInfoProps) {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="bg-yellow-100 border border-yellow-300 rounded p-4 mb-4">
      <h4 className="font-bold text-yellow-800">Debug Info (Dev Only)</h4>
      <p>Total testimonials: {testimonials.length}</p>
      <p>Approved testimonials: {approvedCount}</p>
      {testimonials.map(t => (
        <div key={t.id} className="text-sm">
          <strong>Status:</strong> {t.status} | <strong>Content:</strong> {t.content.substring(0, 50)}...
        </div>
      ))}
    </div>
  );
}