"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FriendClub } from "@/types";

interface TwinClub {
  id: string;
  name: string;
  imageUrl?: string | null;
  location?: string | null;
}

interface ClubFriendsSectionProps {
  clubId: string;
  clubName: string;
  twinClub?: TwinClub | null;
}

export default function ClubFriendsSection({
  clubId,
  clubName,
  twinClub,
}: ClubFriendsSectionProps) {
  const [friends, setFriends] = useState<FriendClub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const response = await fetch(`/api/clubs/${clubId}/friends`);
        if (response.ok) {
          const data = await response.json();
          setFriends(data.friends);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, [clubId]);

  if (loading) {
    return (
      <section id="friends" className="scroll-mt-24">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch">
            <div className="lg:col-span-2 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="friends" className="scroll-mt-24">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch">
          {/* Friends Section */}
          <div className="lg:col-span-2 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
                <span className="truncate">International Friends</span>
              </h2>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
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
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No international friends yet
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  When {clubName} travels abroad for tournaments, the clubs they
                  visit will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {friends.map((friend) => (
                  <Link
                    key={friend.id}
                    href={`/clubs/${friend.id}`}
                    className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-3 sm:p-4 text-center transition-colors"
                  >
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2">
                      <Image
                        src={
                          friend.imageUrl ||
                          "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                        }
                        alt={friend.name}
                        fill
                        className="rounded-full object-contain"
                        unoptimized
                      />
                      {friend.visitCount > 1 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                          {friend.visitCount}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors text-xs sm:text-sm truncate">
                      {friend.name}
                    </h3>
                    {friend.location && (
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {friend.location}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Twin Club Section */}
          <div
            id="twin-club"
            className="lg:col-span-1 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-200 scroll-mt-24"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
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
              Twin Club
            </h3>

            {twinClub ? (
              <Link
                href={`/clubs/${twinClub.id}`}
                className="block text-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3">
                  <Image
                    src={
                      twinClub.imageUrl ||
                      "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                    }
                    alt={twinClub.name}
                    fill
                    className="rounded-full object-contain"
                    unoptimized
                  />
                </div>
                <h4 className="font-semibold text-gray-900 hover:text-primary text-sm sm:text-base">
                  {twinClub.name}
                </h4>
                {twinClub.location && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {twinClub.location}
                  </p>
                )}
                <span className="inline-block mt-2 text-[10px] sm:text-xs text-green-600">
                  GAA Twinning Initiative
                </span>
              </Link>
            ) : (
              <div className="text-center py-3 sm:py-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
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
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  No Twin Club Yet
                </h4>
                <p className="text-xs text-gray-500">
                  Not yet twinned with an Irish or British club.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
