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
  Send,
  Mail,
  CheckSquare,
  Square,
  Loader2,
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

interface UpcomingEvent {
  id: string;
  title: string;
  startDate: string;
  location: string;
  eventType: string;
}

interface ClubFriendsManagementProps {
  clubId: string;
  clubName: string;
  isMainlandEurope?: boolean;
}

export default function ClubFriendsManagement({
  clubId,
  clubName,
  isMainlandEurope = true,
}: ClubFriendsManagementProps) {
  const [friends, setFriends] = useState<FriendClub[]>([]);
  const [twinClub, setTwinClub] = useState<TwinClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTwinForm, setShowTwinForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unlinkingTwin, setUnlinkingTwin] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchTwinClub();
    fetchUpcomingEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const fetchUpcomingEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await fetch(
        `/api/events?hostClubId=${clubId}&status=OPEN`
      );
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

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
      {/* Twin Club + Friends Header Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Twin Club Section - Compact */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-gray-900">
                Twin Club
              </h3>
            </div>
            {!twinClub && !showTwinForm && (
              <button
                type="button"
                onClick={() => setShowTwinForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Set
              </button>
            )}
            {showTwinForm && (
              <button
                type="button"
                onClick={() => setShowTwinForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

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
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="relative w-10 h-10 flex-shrink-0">
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
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {twinClub.name}
                </h4>
                {twinClub.location && (
                  <p className="text-xs text-gray-500 truncate">
                    {twinClub.location}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/clubs/${twinClub.id}`}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  title="View club page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleUnlinkTwin}
                  disabled={unlinkingTwin}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Unlink twin club"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            !showTwinForm && (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                <Link2 className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="text-sm text-gray-500">No twin club set</p>
              </div>
            )
          )}
        </div>

        {/* Friends Header - Takes more space */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                {isMainlandEurope
                  ? `Friends of ${clubName}`
                  : "International Friends"}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {isMainlandEurope
                  ? "Clubs that have visited or played at your club appear here."
                  : "Clubs you've visited on your international trips appear here."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              {showAddForm ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add Friend Club
                </>
              )}
            </button>
          </div>

          {/* Empty state or info - inside the card */}
          {friends.length === 0 ? (
            <div className="flex-1 flex items-center justify-center mt-3">
              <div className="text-center py-2">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                <p className="text-sm text-gray-500">No friends yet</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p>
                {friends.length} club{friends.length !== 1 ? "s" : ""} in your
                network
              </p>
            </div>
          )}
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

      {/* Friends List - only show if there are friends */}
      {friends.length > 0 && (
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

      {/* Divider */}
      {friends.length > 0 && <div className="border-t border-gray-200 mt-6" />}

      {/* Send Invitations Section */}
      {friends.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Notify Friend Clubs
              </h3>
            </div>
            {!showInviteForm && (
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(true);
                  setSelectedFriends(new Set(friends.map((f) => f.id)));
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                Send Invitations
              </button>
            )}
            {showInviteForm && (
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false);
                  setSelectedFriends(new Set());
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

          <p className="text-sm text-purple-700 mb-4">
            Send a custom message to your friend clubs about upcoming
            tournaments or events. Perfect for inviting them to participate in
            your next competition!
          </p>

          {showInviteForm ? (
            <SendInvitationsForm
              clubId={clubId}
              clubName={clubName}
              friends={friends}
              selectedFriends={selectedFriends}
              setSelectedFriends={setSelectedFriends}
              upcomingEvents={upcomingEvents}
              loadingEvents={loadingEvents}
              onClose={() => {
                setShowInviteForm(false);
                setSelectedFriends(new Set());
              }}
            />
          ) : (
            <div className="text-center py-4 bg-white/50 rounded-lg border border-purple-100">
              <Send className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Reach out to {friends.length} friend club
                {friends.length !== 1 ? "s" : ""} in your network
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You can exclude individual clubs before sending
              </p>
            </div>
          )}
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
      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
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
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Setting..." : "Set as Twin Club"}
          </button>
        </div>
      </div>
    </form>
  );
}

interface SendInvitationsFormProps {
  clubId: string;
  clubName: string;
  friends: FriendClub[];
  selectedFriends: Set<string>;
  setSelectedFriends: React.Dispatch<React.SetStateAction<Set<string>>>;
  upcomingEvents: UpcomingEvent[];
  loadingEvents: boolean;
  onClose: () => void;
}

function SendInvitationsForm({
  clubId,
  clubName,
  friends,
  selectedFriends,
  setSelectedFriends,
  upcomingEvents,
  loadingEvents,
  onClose,
}: SendInvitationsFormProps) {
  const [message, setMessage] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const selectAll = () => {
    setSelectedFriends(new Set(friends.map((f) => f.id)));
  };

  const deselectAll = () => {
    setSelectedFriends(new Set());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFriends.size === 0) {
      setError("Please select at least one club to send invitations to");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/clubs/${clubId}/friends/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendClubIds: Array.from(selectedFriends),
          message: message.trim(),
          eventId: selectedEventId || null,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to send invitations");
      }
    } catch (err) {
      console.error("Error sending invitations:", err);
      setError("Failed to send invitations. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg p-6 border border-purple-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Invitations Sent!
        </h4>
        <p className="text-gray-600">
          Your message has been sent to {selectedFriends.size} club
          {selectedFriends.size !== 1 ? "s" : ""}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSend}
      className="bg-white rounded-lg p-5 border border-purple-200"
    >
      <div className="space-y-5">
        {/* Select Recipients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Recipients ({selectedFriends.size} of {friends.length})
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-100">
            {friends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => toggleFriend(friend.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                  selectedFriends.has(friend.id) ? "bg-purple-50" : ""
                }`}
              >
                {selectedFriends.has(friend.id) ? (
                  <CheckSquare className="w-5 h-5 text-purple-600 flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {friend.name}
                  </p>
                  {friend.location && (
                    <p className="text-xs text-gray-500 truncate">
                      {friend.location}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Select Event (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link to Event (Optional)
          </label>
          {loadingEvents ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading events...
            </div>
          ) : upcomingEvents.length > 0 ? (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">No event selected</option>
              {upcomingEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {formatDate(event.startDate)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-500 py-2">
              No upcoming events. You can still send a custom message.
            </p>
          )}
        </div>

        {/* Custom Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write your invitation message here...\n\nExample:\nWe'd love to invite your club to our upcoming tournament! It's a great opportunity to compete, meet other clubs, and explore the area.`}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            This message will be sent from {clubName} to all selected clubs.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending || selectedFriends.size === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {selectedFriends.size} Club
                {selectedFriends.size !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
