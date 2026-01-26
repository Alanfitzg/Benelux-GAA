"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Club {
  id: string;
  name: string;
  imageUrl: string | null;
  location: string | null;
}

interface FriendRelationship {
  id: string;
  club: Club;
  friendClub: Club;
  visitYear: number | null;
  notes: string | null;
  createdAt: string;
}

interface TwinClubRelationship {
  club: Club;
  twinClub: Club | null;
}

interface MostConnectedClub {
  club: Club;
  count: number;
}

interface StrongestRelationship {
  clubs: [Club, Club];
  visits: number;
  years: number[];
}

interface FriendsNetworkData {
  friends: {
    total: number;
    uniqueClubs: number;
    relationships: FriendRelationship[];
  };
  twinClubs: {
    total: number;
    relationships: TwinClubRelationship[];
  };
  leaderboards?: {
    mostConnected: MostConnectedClub[];
    strongestRelationships: StrongestRelationship[];
  };
}

function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="group relative inline-flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

export default function FriendsNetworkPage() {
  const [data, setData] = useState<FriendsNetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "friends" | "twins" | "leaderboards"
  >("leaderboards");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/friends-network");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching friends network:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white/10 rounded-xl"></div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-white/70 hover:text-white mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            Back to Admin
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl md:text-2xl">🤝</span>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white">
                Friends Network
              </h1>
              <p className="text-xs md:text-sm text-white/60">
                Club connections, friendships & twinning relationships
              </p>
            </div>
          </div>

          {/* Context explanation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/20">
            <p className="text-sm md:text-base text-white/90 leading-relaxed">
              The Friends Network tracks the connections between GAA clubs
              worldwide. When clubs travel for tournaments or host visiting
              teams, these connections form lasting relationships that
              strengthen the global GAA community. This data is valuable for
              understanding club engagement, identifying active ambassadors, and
              potentially supporting future reward schemes for clubs that
              actively build international connections.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-white/70">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>
                  <strong className="text-white">Friends</strong> — Informal
                  connections from trips
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>
                  <strong className="text-white">Twin Clubs</strong> — Official
                  GAA partnerships
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Tooltip text="Informal connections made through trips and hosting">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 w-full cursor-help">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {data?.friends.total || 0}
              </div>
              <div className="text-xs md:text-sm text-white/70 flex items-center gap-1">
                Total Friendships
                <svg
                  className="w-3 h-3 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Tooltip>

          <Tooltip text="Unique clubs that have at least one friendship connection">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 w-full cursor-help">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {data?.friends.uniqueClubs || 0}
              </div>
              <div className="text-xs md:text-sm text-white/70 flex items-center gap-1">
                Connected Clubs
                <svg
                  className="w-3 h-3 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Tooltip>

          <Tooltip text="Official GAA Twinning Initiative partnerships">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 w-full cursor-help">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                {data?.twinClubs.total || 0}
              </div>
              <div className="text-xs md:text-sm text-white/70 flex items-center gap-1">
                Twin Clubs
                <svg
                  className="w-3 h-3 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Tooltip>

          <Tooltip text="Combined total of all friendships and twin club relationships">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 w-full cursor-help">
              <div className="text-2xl md:text-3xl font-bold text-secondary">
                {(data?.friends.total || 0) + (data?.twinClubs.total || 0)}
              </div>
              <div className="text-xs md:text-sm text-white/70 flex items-center gap-1">
                Total Relationships
                <svg
                  className="w-3 h-3 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Tooltip>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <Tooltip text="Clubs that have visited or hosted each other through PlayAway trips">
                <button
                  type="button"
                  onClick={() => setActiveTab("friends")}
                  className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm font-medium transition-colors ${
                    activeTab === "friends"
                      ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Friends</span> (
                    {data?.friends.total || 0})
                  </div>
                </button>
              </Tooltip>
              <Tooltip text="Formal partnerships under the GAA Twinning Initiative program">
                <button
                  type="button"
                  onClick={() => setActiveTab("twins")}
                  className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm font-medium transition-colors ${
                    activeTab === "twins"
                      ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="hidden sm:inline">Twin Clubs</span> (
                    {data?.twinClubs.total || 0})
                  </div>
                </button>
              </Tooltip>
              <Tooltip text="Top clubs by connections and strongest repeat relationships">
                <button
                  type="button"
                  onClick={() => setActiveTab("leaderboards")}
                  className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm font-medium transition-colors ${
                    activeTab === "leaderboards"
                      ? "text-amber-600 border-b-2 border-amber-600 bg-amber-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Leaderboards</span>
                  </div>
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Friends Tab */}
            {activeTab === "friends" && (
              <div>
                {/* Section explanation */}
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-green-800">
                      <span className="font-medium">Friends</span> are informal
                      connections formed when clubs travel abroad for
                      tournaments or host visiting teams. These relationships
                      are added by club admins to their profile.
                    </div>
                  </div>
                </div>

                {data?.friends.relationships &&
                data.friends.relationships.length > 0 ? (
                  <div className="space-y-3">
                    {data.friends.relationships.map((rel) => (
                      <div
                        key={rel.id}
                        className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        {/* Club 1 */}
                        <Link
                          href={`/clubs/${rel.club.id}`}
                          className="flex-1 flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity min-w-0"
                        >
                          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                            <Image
                              src={
                                rel.club.imageUrl ||
                                "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                              }
                              alt={rel.club.name}
                              fill
                              className="rounded-full object-contain"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm md:text-base">
                              {rel.club.name}
                            </div>
                            {rel.club.location && (
                              <div className="text-xs text-gray-500 truncate hidden sm:block">
                                {rel.club.location}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Connection Info */}
                        <div className="flex-shrink-0 px-2 md:px-4 text-center">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </div>
                          {rel.visitYear && (
                            <div className="text-xs text-gray-500 mt-1">
                              {rel.visitYear}
                            </div>
                          )}
                        </div>

                        {/* Club 2 */}
                        <Link
                          href={`/clubs/${rel.friendClub.id}`}
                          className="flex-1 flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity justify-end text-right min-w-0"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm md:text-base">
                              {rel.friendClub.name}
                            </div>
                            {rel.friendClub.location && (
                              <div className="text-xs text-gray-500 truncate hidden sm:block">
                                {rel.friendClub.location}
                              </div>
                            )}
                          </div>
                          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                            <Image
                              src={
                                rel.friendClub.imageUrl ||
                                "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                              }
                              alt={rel.friendClub.name}
                              fill
                              className="rounded-full object-contain"
                              unoptimized
                            />
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Friendships Yet
                    </h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      When clubs travel abroad for tournaments and build
                      connections, their friendships will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Twin Clubs Tab */}
            {activeTab === "twins" && (
              <div>
                {/* Section explanation */}
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-emerald-800">
                      <span className="font-medium">Twin Clubs</span> are formal
                      partnerships established through the official GAA Twinning
                      Initiative. These pairings connect Irish/UK clubs with
                      European clubs for ongoing cultural exchange and sporting
                      collaboration.
                    </div>
                  </div>
                </div>

                {data?.twinClubs.relationships &&
                data.twinClubs.relationships.length > 0 ? (
                  <div className="space-y-3">
                    {data.twinClubs.relationships.map((rel, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200"
                      >
                        {/* Club 1 */}
                        <Link
                          href={`/clubs/${rel.club.id}`}
                          className="flex-1 flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity min-w-0"
                        >
                          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                            <Image
                              src={
                                rel.club.imageUrl ||
                                "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                              }
                              alt={rel.club.name}
                              fill
                              className="rounded-full object-contain"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm md:text-base">
                              {rel.club.name}
                            </div>
                            {rel.club.location && (
                              <div className="text-xs text-gray-500 truncate hidden sm:block">
                                {rel.club.location}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Twin Icon */}
                        <div className="flex-shrink-0 px-2 md:px-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5 text-emerald-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Club 2 (Twin) */}
                        {rel.twinClub ? (
                          <Link
                            href={`/clubs/${rel.twinClub.id}`}
                            className="flex-1 flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity justify-end text-right min-w-0"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate text-sm md:text-base">
                                {rel.twinClub.name}
                              </div>
                              {rel.twinClub.location && (
                                <div className="text-xs text-gray-500 truncate hidden sm:block">
                                  {rel.twinClub.location}
                                </div>
                              )}
                            </div>
                            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                              <Image
                                src={
                                  rel.twinClub.imageUrl ||
                                  "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                                }
                                alt={rel.twinClub.name}
                                fill
                                className="rounded-full object-contain"
                                unoptimized
                              />
                            </div>
                          </Link>
                        ) : (
                          <div className="flex-1 text-right text-gray-400 text-sm">
                            No twin club linked
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Twin Clubs Yet
                    </h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      When clubs establish twinning relationships through the
                      GAA Twinning Initiative, they will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboards Tab */}
            {activeTab === "leaderboards" && (
              <div className="space-y-8">
                {/* Most Connected Clubs */}
                <div>
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm text-amber-800">
                        <span className="font-medium">
                          Most Connected Clubs
                        </span>{" "}
                        — Clubs ranked by their total number of friendship
                        connections. These are the most well-travelled or
                        hospitable clubs in the network.
                      </div>
                    </div>
                  </div>

                  {data?.leaderboards?.mostConnected &&
                  data.leaderboards.mostConnected.length > 0 ? (
                    <div className="space-y-2">
                      {data.leaderboards.mostConnected.map((item, index) => (
                        <Link
                          key={item.club.id}
                          href={`/clubs/${item.club.id}`}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-amber-400 text-amber-900"
                                : index === 1
                                  ? "bg-gray-300 text-gray-700"
                                  : index === 2
                                    ? "bg-amber-700 text-amber-100"
                                    : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={
                                item.club.imageUrl ||
                                "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                              }
                              alt={item.club.name}
                              fill
                              className="rounded-full object-contain"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {item.club.name}
                            </div>
                            {item.club.location && (
                              <div className="text-xs text-gray-500 truncate">
                                {item.club.location}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-600">
                              {item.count}
                            </div>
                            <div className="text-xs text-gray-500">
                              connection{item.count !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No connection data available yet
                    </div>
                  )}
                </div>

                {/* Strongest Relationships */}
                <div>
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <div className="text-sm text-purple-800">
                        <span className="font-medium">
                          Strongest Relationships
                        </span>{" "}
                        — Club pairs that have visited each other multiple
                        times. These represent deep, lasting friendships that
                        span years.
                      </div>
                    </div>
                  </div>

                  {data?.leaderboards?.strongestRelationships &&
                  data.leaderboards.strongestRelationships.length > 0 ? (
                    <div className="space-y-3">
                      {data.leaderboards.strongestRelationships.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-purple-50 rounded-xl border border-purple-200"
                          >
                            {/* Club 1 */}
                            <Link
                              href={`/clubs/${item.clubs[0].id}`}
                              className="flex-1 flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity min-w-0"
                            >
                              <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                                <Image
                                  src={
                                    item.clubs[0].imageUrl ||
                                    "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                                  }
                                  alt={item.clubs[0].name}
                                  fill
                                  className="rounded-full object-contain"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate text-sm md:text-base">
                                  {item.clubs[0].name}
                                </div>
                                {item.clubs[0].location && (
                                  <div className="text-xs text-gray-500 truncate hidden sm:block">
                                    {item.clubs[0].location}
                                  </div>
                                )}
                              </div>
                            </Link>

                            {/* Visit Count */}
                            <div className="flex-shrink-0 px-2 md:px-4 text-center">
                              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-200 rounded-full flex flex-col items-center justify-center">
                                <div className="text-lg md:text-xl font-bold text-purple-700">
                                  {item.visits}
                                </div>
                                <div className="text-[10px] text-purple-600">
                                  visits
                                </div>
                              </div>
                              {item.years.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.years.join(", ")}
                                </div>
                              )}
                            </div>

                            {/* Club 2 */}
                            <Link
                              href={`/clubs/${item.clubs[1].id}`}
                              className="flex-1 flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity justify-end text-right min-w-0"
                            >
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate text-sm md:text-base">
                                  {item.clubs[1].name}
                                </div>
                                {item.clubs[1].location && (
                                  <div className="text-xs text-gray-500 truncate hidden sm:block">
                                    {item.clubs[1].location}
                                  </div>
                                )}
                              </div>
                              <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                                <Image
                                  src={
                                    item.clubs[1].imageUrl ||
                                    "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                                  }
                                  alt={item.clubs[1].name}
                                  fill
                                  className="rounded-full object-contain"
                                  unoptimized
                                />
                              </div>
                            </Link>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No repeat visits recorded yet. Strongest relationships
                      appear when clubs visit each other multiple times.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
