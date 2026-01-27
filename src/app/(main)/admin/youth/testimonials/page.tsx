"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface YouthTestimonial {
  id: string;
  eventName: string;
  clubName: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  imageUrl?: string;
}

export default function YouthTestimonialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<YouthTestimonial[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<YouthTestimonial | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" &&
        session.user.role !== "YOUTH_OFFICER")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "YOUTH_OFFICER")
  ) {
    return null;
  }

  const filteredTestimonials = testimonials.filter(
    (t) => filterStatus === "all" || t.status === filterStatus
  );

  const handleApprove = (id: string) => {
    setTestimonials(
      testimonials.map((t) =>
        t.id === id ? { ...t, status: "approved" as const } : t
      )
    );
    setSelectedTestimonial(null);
  };

  const handleReject = (id: string) => {
    setTestimonials(
      testimonials.map((t) =>
        t.id === id ? { ...t, status: "rejected" as const } : t
      )
    );
    setSelectedTestimonial(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-300";
      case "pending":
        return "bg-amber-500/20 text-amber-300";
      case "rejected":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-white/20"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/admin/youth"
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
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
            </Link>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Testimonials
              </h1>
              <p className="text-white/70 text-sm">
                Manage youth event reviews and feedback
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filterStatus === s
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {s} (
                {s === "all"
                  ? testimonials.length
                  : testimonials.filter((t) => t.status === s).length}
                )
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {testimonials.length}
            </div>
            <div className="text-sm text-white/60">Total</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">
              {testimonials.filter((t) => t.status === "pending").length}
            </div>
            <div className="text-sm text-white/60">Pending</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {testimonials.filter((t) => t.status === "approved").length}
            </div>
            <div className="text-sm text-white/60">Approved</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {(
                testimonials.reduce((acc, t) => acc + t.rating, 0) /
                testimonials.length
              ).toFixed(1)}
            </div>
            <div className="text-sm text-white/60">Avg Rating</div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedTestimonial && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-xl max-w-lg w-full border border-white/10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Review Details
                  </h2>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(selectedTestimonial.status)}`}
                  >
                    {selectedTestimonial.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-white">
                    {selectedTestimonial.eventName}
                  </h3>
                  <p className="text-sm text-white/60">
                    {selectedTestimonial.clubName}
                  </p>
                </div>
                <div className="mb-4">
                  {renderStars(selectedTestimonial.rating)}
                </div>
                <p className="text-white/80 mb-4">
                  &quot;{selectedTestimonial.content}&quot;
                </p>
                <div className="text-sm text-white/60">
                  <p>
                    — {selectedTestimonial.author}, {selectedTestimonial.role}
                  </p>
                  <p className="mt-1">
                    {new Date(
                      selectedTestimonial.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTestimonial(null)}
                  className="px-4 py-2 text-white/70 hover:text-white"
                >
                  Close
                </button>
                {selectedTestimonial.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedTestimonial.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedTestimonial.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {testimonials.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Testimonials Yet
            </h3>
            <p className="text-white/60 mb-6">
              Testimonials from youth events will appear here once submitted.
            </p>
          </div>
        )}

        {/* Testimonials List */}
        {filteredTestimonials.length > 0 && (
          <div className="space-y-4">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedTestimonial(testimonial)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">
                        {testimonial.eventName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusColor(testimonial.status)}`}
                      >
                        {testimonial.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">
                      {testimonial.clubName}
                    </p>
                    <p className="text-white/80 line-clamp-2 mb-3">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/50">
                        {testimonial.author} • {testimonial.role}
                      </span>
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <div className="text-sm text-white/40 ml-4">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
