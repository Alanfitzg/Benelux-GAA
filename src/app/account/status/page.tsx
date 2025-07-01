"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type AccountStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

interface StatusResponse {
  status: AccountStatus;
  rejectionReason?: string;
  createdAt?: string;
  approvedAt?: string;
}

export default function AccountStatusPage() {
  const [username, setUsername] = useState("");
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    setLoading(true);
    setError("");
    setStatusData(null);

    try {
      const response = await fetch(`/api/auth/account-status?username=${encodeURIComponent(username.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatusData(data);
      } else if (response.status === 404) {
        setError("Username not found. Please check your username and try again.");
      } else {
        setError("Failed to check account status. Please try again.");
      }
    } catch (error) {
      console.error("Status check error:", error);
      setError("Failed to check account status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: AccountStatus) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
          title: "Account Pending Approval",
          message: "Your account is currently being reviewed by our administrators. This usually takes 1-2 business days."
        };
      case "APPROVED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✅",
          title: "Account Approved",
          message: "Your account has been approved! You can now sign in and access all features."
        };
      case "REJECTED":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "❌",
          title: "Account Rejected",
          message: "Unfortunately, your account application was not approved."
        };
      case "SUSPENDED":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "⏸️",
          title: "Account Suspended",
          message: "Your account has been temporarily suspended. Please contact support for assistance."
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "❓",
          title: "Unknown Status",
          message: "Unable to determine account status."
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Check Your Account Status
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Enter your username to check the current status of your Gaelic Trips account application
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          
          {/* Status Check Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <form onSubmit={handleCheckStatus} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                  disabled={loading}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-light text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking Status...</span>
                  </span>
                ) : (
                  "Check Status"
                )}
              </button>
            </form>
          </motion.div>

          {/* Status Result */}
          {statusData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {(() => {
                const statusDisplay = getStatusDisplay(statusData.status);
                return (
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${statusDisplay.color} mb-6`}>
                      <span className="text-2xl">{statusDisplay.icon}</span>
                      <span className="font-semibold text-lg">{statusDisplay.title}</span>
                    </div>
                    
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                      {statusDisplay.message}
                    </p>

                    {statusData.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-red-800 mb-2">Rejection Reason:</h3>
                        <p className="text-red-700">{statusData.rejectionReason}</p>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                      <h3 className="font-semibold text-gray-800 mb-4">Account Timeline</h3>
                      <div className="space-y-3">
                        {statusData.createdAt && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">
                              Account created: {formatDate(statusData.createdAt)}
                            </span>
                          </div>
                        )}
                        {statusData.approvedAt && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">
                              Account approved: {formatDate(statusData.approvedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {statusData.status === "APPROVED" && (
                        <Link
                          href="/signin"
                          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Sign In Now
                        </Link>
                      )}
                      {statusData.status === "REJECTED" && (
                        <Link
                          href="/signup"
                          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Create New Account
                        </Link>
                      )}
                      <Link
                        href="/"
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-blue-50 rounded-2xl p-8 mt-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h2>
            <div className="space-y-3 text-gray-700">
              <p>• Account approval typically takes 1-2 business days</p>
              <p>• Make sure you registered with a valid GAA club association</p>
              <p>• If you have questions, you can contact us through our support channels</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                href="/signup"
                className="text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                Don't have an account? Sign up →
              </Link>
              <Link
                href="/signin"
                className="text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                Already approved? Sign in →
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}