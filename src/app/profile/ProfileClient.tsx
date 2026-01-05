"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { UserRole } from "@prisma/client";
import PreferencesSection from "@/components/profile/PreferencesSection";
import ClubSelectionModal from "@/components/profile/ClubSelectionModal";

interface User {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  role: UserRole;
  clubId?: string | null;
  isClubMember?: boolean;
  createdAt?: Date;
}

interface ProfileClientProps {
  user: User;
}

interface AssociatedClub {
  id: string;
  name: string;
  location?: string | null;
  imageUrl?: string | null;
  role: "member" | "admin" | "pending";
  pendingRequest?: {
    id: string;
    status: string;
    requestedAt: string;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clubs, setClubs] = useState<AssociatedClub[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [primaryClub, setPrimaryClub] = useState<{
    id: string;
    name: string;
    location?: string | null;
    imageUrl?: string | null;
  } | null>(null);
  const [loadingPrimaryClub, setLoadingPrimaryClub] = useState(false);
  const [showClubSelectionModal, setShowClubSelectionModal] = useState(false);

  const fetchUserClubs = useCallback(async () => {
    try {
      const response = await fetch("/api/user/clubs");
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs);
      }
    } catch (error) {
      console.error("Error fetching user clubs:", error);
    } finally {
      setLoadingClubs(false);
    }
  }, []);

  const fetchPrimaryClub = useCallback(async () => {
    if (!user.clubId) return;

    setLoadingPrimaryClub(true);
    try {
      const response = await fetch(`/api/clubs/${user.clubId}`);
      if (response.ok) {
        const club = await response.json();
        setPrimaryClub({
          id: club.id,
          name: club.name,
          location: club.location,
          imageUrl: club.imageUrl,
        });
      }
    } catch (error) {
      console.error("Error fetching primary club:", error);
    } finally {
      setLoadingPrimaryClub(false);
    }
  }, [user.clubId]);

  useEffect(() => {
    fetchUserClubs();
    if (user.clubId && user.isClubMember) {
      fetchPrimaryClub();
    }
  }, [fetchUserClubs, fetchPrimaryClub, user.clubId, user.isClubMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch {
      setMessage("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      SUPER_ADMIN: {
        label: "Super Admin",
        color: "bg-purple-100 text-purple-800",
      },
      CLUB_ADMIN: { label: "Club Admin", color: "bg-blue-100 text-blue-800" },
      GUEST_ADMIN: {
        label: "Guest Admin",
        color: "bg-green-100 text-green-800",
      },
      USER: { label: "User", color: "bg-gray-100 text-gray-800" },
    };

    const config = roleConfig[role];
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-primary">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-white/80 mt-1">{user.email}</p>
                <div className="mt-3">{getRoleBadge(user.role)}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mb-6 p-4 rounded-lg ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-800"
                    : "bg-green-50 text-green-800"
                }`}
              >
                {message}
              </motion.div>
            )}

            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Username
                    </label>
                    <p className="text-gray-900 font-medium">{user.username}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Full Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {user.name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Member Since
                    </label>
                    <p className="text-gray-900 font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Club Membership
                    </label>
                    {loadingPrimaryClub ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Loading...</span>
                      </div>
                    ) : user.isClubMember && primaryClub ? (
                      <div className="flex items-center gap-3">
                        {primaryClub.imageUrl ? (
                          <Image
                            src={primaryClub.imageUrl}
                            alt={primaryClub.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            unoptimized
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-900 font-medium">
                            {primaryClub.name}
                          </p>
                          {primaryClub.location && (
                            <p className="text-xs text-gray-500">
                              {primaryClub.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : user.isClubMember ? (
                      <p className="text-gray-900 font-medium">Club Member</p>
                    ) : (
                      <p className="text-gray-500">Independent Member</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 space-x-3">
                  {user.role === "CLUB_ADMIN" &&
                    clubs.some((club) => club.role === "admin") && (
                      <div className="flex gap-2">
                        {clubs
                          .filter((club) => club.role === "admin")
                          .slice(0, 1) // Show only first club dashboard button in this section
                          .map((club) => (
                            <button
                              key={club.id}
                              onClick={() =>
                                router.push(`/club-admin/${club.id}`)
                              }
                              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                              <span>Host Dashboard</span>
                            </button>
                          ))}
                      </div>
                    )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Username (cannot be changed)
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: user.name || "", email: user.email });
                      setMessage("");
                    }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Associated Clubs Section */}
        <motion.div
          id="associated-clubs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Associated Clubs
          </h3>

          {loadingClubs ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : clubs.length > 0 ? (
            <div className="space-y-4">
              {clubs.map((club) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {club.imageUrl ? (
                      <Image
                        src={club.imageUrl}
                        alt={club.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {club.name}
                      </h4>
                      {club.location && (
                        <p className="text-sm text-gray-600">{club.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        club.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : club.role === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {club.role === "admin"
                        ? "Club Admin"
                        : club.role === "pending"
                          ? "Admin Request Pending"
                          : "Member"}
                    </span>
                    <Link
                      href={`/clubs/${club.id}`}
                      className="text-primary hover:text-primary-dark transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}

              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3 flex-wrap">
                {user.role === "CLUB_ADMIN" &&
                  clubs.some((club) => club.role === "admin") && (
                    <>
                      {clubs
                        .filter((club) => club.role === "admin")
                        .map((club) => (
                          <button
                            key={club.id}
                            onClick={() =>
                              router.push(`/club-admin/${club.id}`)
                            }
                            className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <span className="flex items-center space-x-2">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                              </svg>
                              <span>Host Dashboard - {club.name}</span>
                            </span>
                          </button>
                        ))}
                      <button
                        onClick={() => router.push("/admin/clubs")}
                        className="px-6 py-2.5 bg-secondary text-white font-medium rounded-xl hover:bg-secondary/90 transition-colors"
                      >
                        Manage My Clubs
                      </button>
                    </>
                  )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-600 mb-2">
                You&apos;re not associated with any clubs yet.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Browse clubs to find your GAA community and request admin
                access.
              </p>
              <button
                onClick={() => setShowClubSelectionModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Request Club Admin Access
              </button>
            </div>
          )}
        </motion.div>

        {/* Travel Preferences Section */}
        <PreferencesSection />
      </motion.div>

      {/* Club Selection Modal */}
      <ClubSelectionModal
        isOpen={showClubSelectionModal}
        onClose={() => setShowClubSelectionModal(false)}
        onRequestSubmit={() => {
          fetchUserClubs();
          setMessage("Club admin request submitted successfully!");
        }}
      />
    </div>
  );
}
