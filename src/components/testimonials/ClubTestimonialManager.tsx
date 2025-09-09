'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, GripVertical, AlertCircle } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Testimonial {
  id: string;
  content: string;
  status: string;
  displayOrder: number;
  submittedAt: string;
  superAdminApprovedAt?: string | null;
  user: {
    id: string;
    name: string | null;
    username: string;
  };
}

interface ClubTestimonialManagerProps {
  clubId: string;
  testimonials: Testimonial[];
  canManage: boolean;
}

function SortableTestimonial({ testimonial, onApprove, onReject, disabled }: {
  testimonial: Testimonial;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isApproved = testimonial.status === 'APPROVED';
  const canApprove = testimonial.status === 'SUPER_ADMIN_APPROVED';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border p-4 ${
        isDragging ? 'opacity-50' : ''
      } ${isApproved ? 'border-green-200' : 'border-gray-200'}`}
    >
      <div className="flex items-start gap-3">
        {isApproved && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 cursor-move text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium text-sm">
                {testimonial.user.name || testimonial.user.username}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(testimonial.submittedAt).toLocaleDateString('en-IE')}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              isApproved 
                ? 'bg-green-100 text-green-700' 
                : canApprove
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isApproved ? 'Approved' : canApprove ? 'Awaiting Your Approval' : testimonial.status}
            </span>
          </div>
          
          <p className="text-gray-700 text-sm italic mb-3">&ldquo;{testimonial.content}&rdquo;</p>
          
          {canApprove && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(testimonial.id)}
                disabled={disabled}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => onReject(testimonial.id)}
                disabled={disabled}
                className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClubTestimonialManager({
  clubId,
  testimonials,
  canManage,
}: ClubTestimonialManagerProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [sortedTestimonials, setSortedTestimonials] = useState(testimonials);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const approvedTestimonials = sortedTestimonials.filter(t => t.status === 'APPROVED');
  const pendingApproval = sortedTestimonials.filter(t => t.status === 'SUPER_ADMIN_APPROVED');
  const otherTestimonials = sortedTestimonials.filter(
    t => t.status !== 'APPROVED' && t.status !== 'SUPER_ADMIN_APPROVED'
  );

  const handleApprove = async (testimonialId: string) => {
    setProcessingId(testimonialId);
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve testimonial');
      }

      router.refresh();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve testimonial');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to reject this testimonial?')) return;
    
    setProcessingId(testimonialId);
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject testimonial');
      }

      router.refresh();
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject testimonial');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = approvedTestimonials.findIndex((t) => t.id === active.id);
    const newIndex = approvedTestimonials.findIndex((t) => t.id === over.id);

    const newApprovedOrder = arrayMove(approvedTestimonials, oldIndex, newIndex);
    
    setSortedTestimonials([
      ...newApprovedOrder,
      ...pendingApproval,
      ...otherTestimonials,
    ]);

    setIsSaving(true);
    try {
      const response = await fetch('/api/testimonials/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId,
          testimonialIds: newApprovedOrder.map(t => t.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      router.refresh();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save the new order. Please try again.');
      setSortedTestimonials(testimonials);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          You don&apos;t have permission to manage testimonials for this club.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingApproval.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-orange-700">
            Awaiting Your Approval ({pendingApproval.length})
          </h3>
          <div className="space-y-3">
            {pendingApproval.map((testimonial) => (
              <SortableTestimonial
                key={testimonial.id}
                testimonial={testimonial}
                onApprove={handleApprove}
                onReject={handleReject}
                disabled={processingId === testimonial.id || isSaving}
              />
            ))}
          </div>
        </div>
      )}

      {approvedTestimonials.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-700">
            Approved Testimonials ({approvedTestimonials.length})
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Drag to reorder how testimonials appear on your club page
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={approvedTestimonials.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {approvedTestimonials.map((testimonial) => (
                  <SortableTestimonial
                    key={testimonial.id}
                    testimonial={testimonial}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    disabled={processingId === testimonial.id || isSaving}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {isSaving && (
            <p className="text-sm text-gray-600 mt-2">Saving order...</p>
          )}
        </div>
      )}

      {otherTestimonials.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Other Testimonials ({otherTestimonials.length})
          </h3>
          <div className="space-y-3">
            {otherTestimonials.map((testimonial) => (
              <SortableTestimonial
                key={testimonial.id}
                testimonial={testimonial}
                onApprove={handleApprove}
                onReject={handleReject}
                disabled={processingId === testimonial.id || isSaving}
              />
            ))}
          </div>
        </div>
      )}

      {testimonials.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No testimonials for this club yet</p>
        </div>
      )}
    </div>
  );
}