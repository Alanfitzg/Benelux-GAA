"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ClubAdminRequestButtonProps {
  clubId: string;
  clubName: string;
  existingRequest?: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedAt: string;
    rejectionReason?: string;
  };
  isCurrentAdmin: boolean;
  compact?: boolean;
  mobileStyle?: boolean;
}

export default function ClubAdminRequestButton({
  clubId,
  clubName,
  existingRequest: initialRequest,
  isCurrentAdmin,
  compact = false,
  mobileStyle = false,
}: ClubAdminRequestButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (
      searchParams.get("requestAdmin") === "true" &&
      session &&
      !isCurrentAdmin &&
      !initialRequest
    ) {
      setIsModalOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, session, isCurrentAdmin, initialRequest]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [existingRequest, setExistingRequest] = useState(initialRequest);

  // Don't show if user is not signed in or is already an admin
  if (!session || isCurrentAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for your request");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/clubs/admin-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSuccess(true);
      // Update the local state with the new request
      setExistingRequest({
        id: data.request.id,
        status: "PENDING",
        requestedAt: data.request.requestedAt || new Date().toISOString(),
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setReason("");
        // Refresh the router to update server components without losing session
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    if (!existingRequest) return null;

    if (mobileStyle) {
      switch (existingRequest.status) {
        case "PENDING":
          return (
            <div className="flex items-center justify-center gap-1.5 text-yellow-300 w-full">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">Admin request pending</span>
            </div>
          );
        case "APPROVED":
          return (
            <div className="flex items-center justify-center gap-1.5 text-green-300 w-full">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Admin request approved</span>
            </div>
          );
        case "REJECTED":
          return (
            <div className="flex items-center justify-center gap-1.5 text-red-300 w-full">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Admin request rejected</span>
            </div>
          );
      }
    }

    if (compact) {
      switch (existingRequest.status) {
        case "PENDING":
          return (
            <div className="flex items-center gap-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Pending</span>
            </div>
          );
        case "APPROVED":
          return (
            <div className="flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Approved</span>
            </div>
          );
        case "REJECTED":
          return (
            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Rejected</span>
            </div>
          );
      }
    }

    switch (existingRequest.status) {
      case "PENDING":
        return (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Admin request pending review
            </span>
          </div>
        );
      case "APPROVED":
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Admin request approved</span>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Admin request rejected</span>
          </div>
        );
    }
  };

  // Show status if there's an existing request
  if (existingRequest) {
    if (mobileStyle) {
      return (
        <div className="text-center w-full">
          {getStatusDisplay()}
          {existingRequest.status === "REJECTED" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-white/50 hover:text-white mt-1"
            >
              Request again
            </button>
          )}
        </div>
      );
    }
    if (compact) {
      return (
        <div className="text-center">
          {getStatusDisplay()}
          {existingRequest.status === "REJECTED" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-primary hover:text-primary-dark mt-1"
            >
              Request again
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {getStatusDisplay()}
        {existingRequest.status === "REJECTED" &&
          existingRequest.rejectionReason && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Reason:</strong> {existingRequest.rejectionReason}
            </div>
          )}
        {existingRequest.status === "REJECTED" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Request again
          </button>
        )}
      </div>
    );
  }

  const buttonClassName = mobileStyle
    ? "flex items-center justify-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors w-full"
    : compact
      ? "flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 border border-primary/30 bg-white/80 px-3 py-1.5 rounded-lg transition-colors"
      : "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors";

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className={buttonClassName}>
        <Shield
          className={compact || mobileStyle ? "w-3.5 h-3.5" : "w-4 h-4"}
        />
        {compact || mobileStyle ? "Request Admin" : "Request Admin Access"}
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Request Admin Access
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Request administrative access for <strong>{clubName}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Your request to become an admin for this club will be
                  reviewed.
                </p>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-green-600 mb-2">
                    Request Submitted!
                  </h4>
                  <p className="text-gray-600">
                    Your request has been sent to the administrators for review.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Request <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please explain why you should be granted admin access to this club..."
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      rows={4}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
