"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { UserRole } from "@prisma/client";
import PreferencesSection from "@/components/profile/PreferencesSection";
import CompletedTripsSection from "@/components/profile/CompletedTripsSection";
import WatchlistSection from "@/components/profile/WatchlistSection";
import ClubSelectionModal from "@/components/profile/ClubSelectionModal";

const EUROPEAN_COUNTRIES = [
  "Austria",
  "Belgium",
  "Croatia",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Gibraltar",
  "Hungary",
  "Iceland",
  "Italy",
  "Luxembourg",
  "Netherlands",
  "The Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
];

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

  // Check if user is a club admin for a European club
  const isEuropeanClubAdmin =
    user.role === "CLUB_ADMIN" &&
    clubs.some(
      (club) =>
        club.role === "admin" &&
        club.location &&
        EUROPEAN_COUNTRIES.some((country) =>
          club.location!.toLowerCase().includes(country.toLowerCase())
        )
    );

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      SUPER_ADMIN: {
        label: "Super Admin",
        color: "bg-purple-100 text-purple-700",
      },
      CLUB_ADMIN: { label: "Club Admin", color: "bg-blue-100 text-blue-700" },
      GUEST_ADMIN: {
        label: "Guest Admin",
        color: "bg-green-100 text-green-700",
      },
      USER: { label: "GAA Member", color: "bg-[#264673]/10 text-[#264673]" },
    };

    const config = roleConfig[role];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#264673] to-[#1a3352]">
      <div className="container mx-auto px-4 py-6 pb-24 md:py-8 md:pb-32 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            My Profile
          </h1>

          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-6 p-4 rounded-xl ${
                message.includes("Error")
                  ? "bg-red-500/20 text-red-100 border border-red-400/30"
                  : "bg-green-500/20 text-green-100 border border-green-400/30"
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-5 md:p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user.isClubMember && primaryClub?.imageUrl ? (
                <Image
                  src={primaryClub.imageUrl}
                  alt={primaryClub.name}
                  width={80}
                  height={80}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-contain bg-gray-50 border-2 border-gray-100 flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#264673] to-[#1a3352] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {(user.name || user.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Name and Role */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {user.name || user.username}
                </h2>
                {user.name && (
                  <p className="text-gray-500 text-sm">@{user.username}</p>
                )}
                <div className="mt-2">{getRoleBadge(user.role)}</div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-5" />

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Club */}
              {(user.isClubMember || primaryClub) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#264673]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-[#264673]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Club</p>
                      {loadingPrimaryClub ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-[#264673] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-400">
                            Loading...
                          </span>
                        </div>
                      ) : primaryClub ? (
                        <Link
                          href={`/clubs/${primaryClub.id}`}
                          className="font-semibold text-gray-900 truncate block hover:text-[#264673] transition-colors"
                        >
                          {primaryClub.name}
                        </Link>
                      ) : (
                        <p className="font-medium text-gray-900">Club Member</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#264673]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-[#264673]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#264673]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-[#264673]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="font-semibold text-gray-900">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IE", {
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Clubs Section */}
          <motion.div
            id="associated-clubs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white rounded-xl shadow-lg p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
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
                  Associated Clubs
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                  Clubs you&apos;re connected with
                </p>
              </div>
            </div>

            {loadingClubs ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : clubs.length > 0 ? (
              <div className="space-y-3">
                {/* Host Dashboard - Prominent at top for admin clubs */}
                {user.role === "CLUB_ADMIN" &&
                  clubs.some((club) => club.role === "admin") && (
                    <div className="space-y-2">
                      {clubs
                        .filter((club) => club.role === "admin")
                        .map((club) => (
                          <button
                            key={`dashboard-${club.id}`}
                            type="button"
                            onClick={() =>
                              router.push(`/club-admin/${club.id}`)
                            }
                            className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-md hover:shadow-lg"
                          >
                            <span className="flex items-center justify-center gap-2">
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
                    </div>
                  )}

                {/* Club list - compact */}
                <div className="space-y-2 pt-2">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {club.imageUrl ? (
                          <Image
                            src={club.imageUrl}
                            alt={club.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-500 font-medium text-sm">
                              {club.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {club.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {club.location && (
                              <span className="text-xs text-gray-500 truncate">
                                {club.location}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                club.role === "admin"
                                  ? "bg-blue-100 text-blue-700"
                                  : club.role === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {club.role === "admin"
                                ? "Admin"
                                : club.role === "pending"
                                  ? "Pending"
                                  : "Member"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        {club.role === "member" && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/clubs/${club.id}?requestAdmin=true`)
                            }
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors hidden sm:block"
                          >
                            Apply to become a club admin
                          </button>
                        )}
                        <Link
                          href={`/clubs/${club.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-6 h-6"
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
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <svg
                  className="w-10 h-10 text-gray-300 mx-auto mb-3"
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
                <p className="text-gray-600 text-sm mb-1">
                  You&apos;re not associated with any clubs yet.
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Browse clubs to find your GAA community.
                </p>
                <button
                  type="button"
                  onClick={() => setShowClubSelectionModal(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Request Club Admin Access
                </button>
              </div>
            )}
          </motion.div>

          {/* Completed Trips & Watchlist Row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompletedTripsSection compact />
            <WatchlistSection compact />
          </div>

          {/* Travel Preferences Section - hidden for European club admins */}
          {!isEuropeanClubAdmin && <PreferencesSection compact />}
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
    </div>
  );
}
