"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Info,
  X,
  Link2,
  Unlink,
} from "lucide-react";

interface FriendClub {
  id: string;
  name: string;
  imageUrl?: string | null;
  location?: string | null;
  visitCount: number;
  lastVisitYear?: number | null;
  isManual: boolean;
}

interface TwinClub {
  id: string;
  name: string;
  imageUrl?: string | null;
  location?: string | null;
}

interface ClubFriendsManagementProps {
  clubId: string;
  clubName: string;
}

export default function ClubFriendsManagement({
  clubId,
  clubName,
}: ClubFriendsManagementProps) {
  const [friends, setFriends] = useState<FriendClub[]>([]);
  const [twinClub, setTwinClub] = useState<TwinClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTwinForm, setShowTwinForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unlinkingTwin, setUnlinkingTwin] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchTwinClub();
  }, [clubId]);

  const fetchFriends = async () => {
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
  };

  const fetchTwinClub = async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}`);
      if (response.ok) {
        const club = await response.json();
        if (club.twinClubId) {
          const twinResponse = await fetch(`/api/clubs/${club.twinClubId}`);
          if (twinResponse.ok) {
            const twin = await twinResponse.json();
            setTwinClub({
              id: twin.id,
              name: twin.name,
              imageUrl: twin.imageUrl,
              location: twin.location,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching twin club:", error);
    }
  };

  const handleUnlinkTwin = async () => {
    if (!confirm("Are you sure you want to unlink your twin club?")) {
      return;
    }

    setUnlinkingTwin(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinClubId: null }),
      });

      if (response.ok) {
        setTwinClub(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to unlink twin club");
      }
    } catch (error) {
      console.error("Error unlinking twin club:", error);
      alert("Failed to unlink twin club");
    } finally {
      setUnlinkingTwin(false);
    }
  };

  const handleDelete = async (friendClubId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this club from your friends list?"
      )
    ) {
      return;
    }

    setDeletingId(friendClubId);
    try {
      const response = await fetch(
        `/api/clubs/${clubId}/friends?friendClubId=${friendClubId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setFriends(friends.filter((f) => f.id !== friendClubId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Twin Club Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Twin Club</h3>
          </div>
          {!twinClub && !showTwinForm && (
            <button
              type="button"
              onClick={() => setShowTwinForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Set Twin Club
            </button>
          )}
          {showTwinForm && (
            <button
              type="button"
              onClick={() => setShowTwinForm(false)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        <p className="text-sm text-green-700 mb-4">
          The GAA Twinning Initiative connects clubs worldwide with Irish clubs
          for cultural exchange and friendship.
        </p>

        {showTwinForm && !twinClub && (
          <SetTwinClubForm
            clubId={clubId}
            onSet={(twin) => {
              setTwinClub(twin);
              setShowTwinForm(false);
            }}
            onCancel={() => setShowTwinForm(false)}
          />
        )}

        {twinClub ? (
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-green-200">
            <div className="relative w-14 h-14 flex-shrink-0">
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
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900">{twinClub.name}</h4>
              {twinClub.location && (
                <p className="text-sm text-gray-500">{twinClub.location}</p>
              )}
              <span className="inline-block mt-1 text-xs text-green-600 font-medium">
                GAA Twinning Initiative
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/clubs/${twinClub.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="View club page"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleUnlinkTwin}
                disabled={unlinkingTwin}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Unlink twin club"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          !showTwinForm && (
            <div className="text-center py-6 bg-white/50 rounded-lg border border-green-100">
              <Link2 className="w-10 h-10 text-green-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No twin club set yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Connect with an Irish or British club through the GAA Twinning
                Initiative
              </p>
            </div>
          )
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Header with Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Friends of {clubName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Clubs that have visited or played at your club appear here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Friend Club
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Friends Work</p>
            <ul className="text-blue-700 space-y-1">
              <li>
                • Clubs are automatically added when they register for your
                events
              </li>
              <li>
                • You can manually add clubs that have visited in the past
              </li>
              <li>• Friends are displayed on your public club page</li>
              <li>• Only manually added friends can be removed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Friend Form */}
      {showAddForm && (
        <AddFriendForm
          clubId={clubId}
          onAdded={(newFriend) => {
            setFriends([newFriend, ...friends]);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Friends List */}
      {friends.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No friends yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add clubs that have visited or played at your venue.
          </p>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Friend
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="relative w-12 h-12 flex-shrink-0">
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
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {friend.visitCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {friend.name}
                </h4>
                {friend.location && (
                  <p className="text-sm text-gray-500 truncate">
                    {friend.location}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {friend.lastVisitYear && (
                    <span className="text-xs text-gray-400">
                      Last visit: {friend.lastVisitYear}
                    </span>
                  )}
                  {friend.isManual ? (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Manual
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Auto
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/clubs/${friend.id}`}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="View club page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                {friend.isManual && (
                  <button
                    type="button"
                    onClick={() => handleDelete(friend.id)}
                    disabled={deletingId === friend.id}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Remove friend"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {friends.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {friends.length} club{friends.length !== 1 ? "s" : ""} in your
            network
          </p>
          <p className="text-sm text-gray-500">
            {friends.filter((f) => f.isManual).length} manual •{" "}
            {friends.filter((f) => !f.isManual).length} auto-added
          </p>
        </div>
      )}
    </div>
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
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-lg p-5 border border-gray-200"
    >
      <h4 className="font-medium text-gray-900 mb-4">Add a Friend Club</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search for a club
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type club name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{club.name}</span>
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
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Year (optional)
            </label>
            <input
              type="number"
              value={visitYear}
              onChange={(e) => setVisitYear(e.target.value)}
              placeholder={new Date().getFullYear().toString()}
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
              placeholder="e.g., Summer tournament 2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedClub || loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Adding..." : "Add Friend"}
          </button>
        </div>
      </div>
    </form>
  );
}

interface SetTwinClubFormProps {
  clubId: string;
  onSet: (twin: TwinClub) => void;
  onCancel: () => void;
}

function SetTwinClubForm({ clubId, onSet, onCancel }: SetTwinClubFormProps) {
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
    imageUrl?: string | null;
    location?: string | null;
  } | null>(null);
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
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinClubId: selectedClub.id }),
      });

      if (response.ok) {
        onSet({
          id: selectedClub.id,
          name: selectedClub.name,
          imageUrl: selectedClub.imageUrl,
          location: selectedClub.location,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to set twin club");
      }
    } catch (error) {
      console.error("Error setting twin club:", error);
      alert("Failed to set twin club");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-4 border border-green-200"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search for your twin club
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search Irish or British clubs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
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
                  className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{club.name}</span>
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
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
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
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedClub || loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Setting..." : "Set as Twin Club"}
          </button>
        </div>
      </div>
    </form>
  );
}
