"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Mail,
} from "lucide-react";
import Image from "next/image";

interface AdminRequest {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    createdAt: string;
  };
  club: {
    id: string;
    name: string;
    location: string;
    imageUrl?: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ClubAdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/club-admin-requests?status=${selectedStatus}`
      );
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReviewRequest = async (
    requestId: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) => {
    setReviewingRequest(requestId);

    try {
      const response = await fetch("/api/admin/club-admin-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action,
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the requests list
        fetchRequests();
      } else {
        alert("Failed to review request: " + data.error);
      }
    } catch (error) {
      console.error("Failed to review request:", error);
      alert("An error occurred while reviewing the request");
    } finally {
      setReviewingRequest(null);
    }
  };

  const handleResendEmail = async (requestId: string) => {
    setSendingEmail(requestId);

    try {
      const response = await fetch(
        "/api/admin/club-admin-requests/resend-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Welcome email sent successfully!");
      } else {
        alert("Failed to send email: " + data.error);
      }
    } catch (error) {
      console.error("Failed to resend email:", error);
      alert("An error occurred while sending the email");
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-50 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Club Admin Requests
                  </h1>
                  <p className="text-gray-600">
                    Manage requests for club administrative access
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex gap-2">
              {["PENDING", "APPROVED", "REJECTED", "ALL"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No requests found
                </h3>
                <p className="text-gray-600">
                  {selectedStatus === "PENDING"
                    ? "No pending club admin requests at this time."
                    : `No ${selectedStatus.toLowerCase()} requests found.`}
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Club Image */}
                        <Image
                          src={
                            request.club.imageUrl ||
                            "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                          }
                          alt={request.club.name}
                          width={48}
                          height={48}
                          className="rounded-full object-contain bg-gray-50"
                        />

                        {/* Club Info */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.club.name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{request.club.location}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="text-sm font-medium">
                            {request.status}
                          </span>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-900">
                            {request.user.name || request.user.username}
                          </span>
                          <span className="text-gray-600 ml-2">
                            ({request.user.email})
                          </span>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Request Reason:
                        </h4>
                        <p className="text-gray-700">{request.reason}</p>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Requested:{" "}
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {request.reviewedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Reviewed:{" "}
                              {new Date(
                                request.reviewedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rejection Reason */}
                      {request.status === "REJECTED" &&
                        request.rejectionReason && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-1">
                              Rejection Reason:
                            </h4>
                            <p className="text-red-800">
                              {request.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    {request.status === "PENDING" && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() =>
                            handleReviewRequest(request.id, "approve")
                          }
                          disabled={reviewingRequest === request.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt(
                              "Enter rejection reason (optional):"
                            );
                            if (reason !== null) {
                              handleReviewRequest(request.id, "reject", reason);
                            }
                          }}
                          disabled={reviewingRequest === request.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                    {request.status === "APPROVED" && (
                      <div className="ml-4">
                        <button
                          type="button"
                          onClick={() => handleResendEmail(request.id)}
                          disabled={sendingEmail === request.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Mail className="w-4 h-4" />
                          {sendingEmail === request.id
                            ? "Sending..."
                            : "Resend Welcome Email"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
