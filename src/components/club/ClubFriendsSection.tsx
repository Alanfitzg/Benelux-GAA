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
  isAdmin?: boolean;
  twinClub?: TwinClub | null;
}

export default function ClubFriendsSection({
  clubId,
  clubName,
  isAdmin = false,
  twinClub,
}: ClubFriendsSectionProps) {
  const [friends, setFriends] = useState<FriendClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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
                <span className="truncate">Friends of {clubName}</span>
              </h2>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
                >
                  {showAddForm ? "Cancel" : "Add Friend"}
                </button>
              )}
            </div>

            {showAddForm && isAdmin && (
              <AddFriendForm
                clubId={clubId}
                onAdded={(newFriend) => {
                  setFriends([newFriend, ...friends]);
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
              />
            )}

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
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                  No visiting clubs yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
                  When clubs visit for tournaments, they&apos;ll appear here -
                  showcasing this club&apos;s global GAA friends network.
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
                <h4 className="font-medium text-gray-900 mb-1 text-xs sm:text-sm">
                  No Twin Club Yet
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-500">
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

interface AddFriendFormProps {
  clubId: string;
  onAdded: (friend: FriendClub) => void;
  onCancel: () => void;
}

function AddFriendForm({ clubId, onAdded, onCancel }: AddFriendFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      imageUrl?: string | null;
      location?: string | null;
    }>
  >([]);
  const [selectedClub, setSelectedClub] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [visitYear, setVisitYear] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `/api/clubs?search=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(
          data.clubs.filter((c: { id: string }) => c.id !== clubId)
        );
      }
    } catch (error) {
      console.error("Error searching clubs:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendClubId: selectedClub.id,
          visitYear: visitYear ? parseInt(visitYear) : null,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onAdded({
          id: data.friendClub.id,
          name: data.friendClub.name,
          imageUrl: data.friendClub.imageUrl,
          location: data.friendClub.location,
          visitCount: 1,
          lastVisitYear: visitYear ? parseInt(visitYear) : null,
          isManual: true,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Failed to add friend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search for a club
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type club name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {searchResults.length > 0 && !selectedClub && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => {
                    setSelectedClub(club);
                    setSearchQuery(club.name);
                    setSearchResults([]);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <span className="font-medium">{club.name}</span>
                  {club.location && (
                    <span className="text-sm text-gray-500">
                      {club.location}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {selectedClub && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">Selected:</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {selectedClub.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedClub(null);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Year (optional)
            </label>
            <input
              type="number"
              value={visitYear}
              onChange={(e) => setVisitYear(e.target.value)}
              placeholder="2024"
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Friendly match"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedClub || loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Friend"}
          </button>
        </div>
      </div>
    </form>
  );
}
