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
        color: "bg-purple-100 text-purple-800",
      },
      CLUB_ADMIN: { label: "Club Admin", color: "bg-blue-100 text-blue-800" },
      GUEST_ADMIN: {
        label: "Guest Admin",
        color: "bg-green-100 text-green-800",
      },
      USER: { label: "Regular GAA Member", color: "bg-gray-100 text-gray-800" },
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
              {/* Avatar only shown for elevated roles (admins) */}
              {user.role !== "USER" && (
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
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
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                      Member
                    </span>
                    {clubs.some((club) => club.role === "admin") && (
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                )}
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
          className="mt-8 bg-white rounded-xl shadow-lg p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
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
              <p className="text-gray-500 text-sm mt-0.5">
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
                          onClick={() => router.push(`/club-admin/${club.id}`)}
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
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {club.role === "member" && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/clubs/${club.id}?requestAdmin=true`)
                          }
                          className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors hidden sm:block"
                        >
                          Apply
                        </button>
                      )}
                      <Link
                        href={`/clubs/${club.id}`}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompletedTripsSection compact />
          <WatchlistSection compact />
        </div>

        {/* Travel Preferences Section - hidden for European club admins */}
        {!isEuropeanClubAdmin && <PreferencesSection />}
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
