"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
}

export default function ClubAdminRequestButton({
  clubId,
  clubName,
  existingRequest,
  isCurrentAdmin,
}: ClubAdminRequestButtonProps) {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setReason("");
        // Refresh the page to show the new request status
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    if (!existingRequest) return null;

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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        <Shield className="w-4 h-4" />
        Request Admin Access
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
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
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
