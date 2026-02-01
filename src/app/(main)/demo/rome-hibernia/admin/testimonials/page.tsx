"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Testimonial {
  id: string;
  email: string;
  name: string | null;
  memberClubName: string | null;
  content: string | null;
  status: string;
  displayOrder: number;
  createdAt: string;
  submittedAt: string | null;
}

const CLUB_ID = "rome-hibernia";

export default function TestimonialsAdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [clubPasswordAuth, setClubPasswordAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check for club password auth in sessionStorage on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem(`${CLUB_ID}-admin-auth`);
    if (storedAuth === "true") {
      setClubPasswordAuth(true);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch(`/api/club-testimonials?clubId=${CLUB_ID}`);
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

  async function handleRequestTestimonial(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/club-testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: CLUB_ID, email: requestEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to send" });
        return;
      }

      setMessage({ type: "success", text: "Invitation sent successfully!" });
      setRequestEmail("");
      setShowRequestModal(false);
      fetchTestimonials();
    } catch {
      setMessage({ type: "error", text: "Failed to send invitation" });
    } finally {
      setSending(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/club-testimonials/${id}/approve`, {
        method: "POST",
      });

      if (res.ok) {
        fetchTestimonials();
        setMessage({ type: "success", text: "Testimonial approved!" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to approve" });
    }
  }

  async function handleReject(id: string) {
    try {
      const res = await fetch(`/api/club-testimonials/${id}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        fetchTestimonials();
        setMessage({ type: "success", text: "Testimonial rejected" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to reject" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const res = await fetch(`/api/club-testimonials/${id}/delete`, {
        method: "POST",
      });

      if (res.ok) {
        fetchTestimonials();
        setMessage({ type: "success", text: "Request deleted" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  }

  async function moveTestimonial(id: string, direction: "up" | "down") {
    const approved = testimonials.filter((t) => t.status === "APPROVED");
    const currentIndex = approved.findIndex((t) => t.id === id);

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === approved.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newApproved = [...approved];
    [newApproved[currentIndex], newApproved[newIndex]] = [
      newApproved[newIndex],
      newApproved[currentIndex],
    ];

    const orderedIds = newApproved.map((t) => t.id);

    try {
      await fetch("/api/club-testimonials/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: CLUB_ID, orderedIds }),
      });

      fetchTestimonials();
    } catch {
      setMessage({ type: "error", text: "Failed to reorder" });
    }
  }

  if (sessionStatus === "loading" || loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c41e3a] border-t-transparent" />
      </div>
    );
  }

  // Allow access if logged in via NextAuth OR via club password
  if (!session && !clubPasswordAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Sign in Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to manage testimonials.
          </p>
          <Link
            href="/demo/rome-hibernia/admin"
            className="text-[#c41e3a] font-medium hover:underline"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const pending = testimonials.filter((t) => t.status === "PENDING");
  const submitted = testimonials.filter((t) => t.status === "SUBMITTED");
  const approved = testimonials.filter((t) => t.status === "APPROVED");
  const rejected = testimonials.filter((t) => t.status === "REJECTED");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Testimonials</h1>
            <Link
              href="/demo/rome-hibernia/admin"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
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
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Request Button */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="bg-[#c41e3a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a01830] transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Request Testimonial
          </button>
        </div>

        {/* Awaiting Response */}
        {pending.length > 0 && (
          <Section title="Awaiting Response" count={pending.length}>
            {pending.map((t) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                showDelete
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </Section>
        )}

        {/* Needs Approval */}
        {submitted.length > 0 && (
          <Section title="Needs Approval" count={submitted.length}>
            {submitted.map((t) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                showActions
                showDelete
                onApprove={() => handleApprove(t.id)}
                onReject={() => handleReject(t.id)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </Section>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <Section title="Approved (Visible on Site)" count={approved.length}>
            {approved.map((t, index) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                showReorder
                showDelete
                onMoveUp={
                  index > 0 ? () => moveTestimonial(t.id, "up") : undefined
                }
                onMoveDown={
                  index < approved.length - 1
                    ? () => moveTestimonial(t.id, "down")
                    : undefined
                }
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </Section>
        )}

        {/* Rejected */}
        {rejected.length > 0 && (
          <Section title="Rejected" count={rejected.length}>
            {rejected.map((t) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                showActions
                showDelete
                onApprove={() => handleApprove(t.id)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </Section>
        )}

        {/* Empty State */}
        {testimonials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No testimonials yet
            </h3>
            <p className="text-gray-600">
              Click &quot;Request Testimonial&quot; to invite someone to share
              their experience.
            </p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Request Testimonial
            </h2>
            <p className="text-gray-600 mb-4">
              Enter the email address of the person you&apos;d like to invite.
              They&apos;ll receive a link to submit their testimonial.
            </p>
            <form onSubmit={handleRequestTestimonial}>
              <input
                type="email"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a472a] focus:border-transparent mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestEmail("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-[#c41e3a] text-white rounded-lg font-medium hover:bg-[#a01830] disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {title}{" "}
        <span className="text-gray-500 font-normal text-sm">({count})</span>
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  showActions,
  showReorder,
  showDelete,
  onApprove,
  onReject,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  testimonial: Testimonial;
  showActions?: boolean;
  showReorder?: boolean;
  showDelete?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {testimonial.name && (
            <h3 className="font-medium text-gray-900">
              {testimonial.name}
              {testimonial.memberClubName && (
                <span className="text-gray-500 font-normal">
                  {" "}
                  - {testimonial.memberClubName}
                </span>
              )}
            </h3>
          )}
          <p className="text-sm text-gray-500">{testimonial.email}</p>
          {testimonial.content && (
            <p className="mt-2 text-gray-700">
              &quot;{testimonial.content}&quot;
            </p>
          )}
          {testimonial.status === "PENDING" && (
            <p className="mt-2 text-sm text-amber-600 italic">
              Waiting for response...
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {testimonial.submittedAt
              ? `Submitted ${new Date(testimonial.submittedAt).toLocaleDateString()}`
              : `Invited ${new Date(testimonial.createdAt).toLocaleDateString()}`}
          </p>
        </div>

        {showReorder && (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!onMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!onMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        {showDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete request"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}

        {showActions && (
          <div className="flex gap-2">
            {onApprove && (
              <button
                type="button"
                onClick={onApprove}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
              >
                Approve
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={onReject}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
