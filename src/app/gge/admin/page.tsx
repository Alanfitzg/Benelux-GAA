"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type EventType =
  | "DADS_AND_LADS"
  | "GAELIC4MOTHERS_AND_OTHERS"
  | "SOCIAL_CAMOGIE";

type EventStatus = "PENDING" | "APPROVED" | "REJECTED";
type RegistrationStatus = "CONFIRMED" | "WAITING_LIST" | "CANCELLED";

interface SocialEvent {
  id: string;
  clubName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  eventType: EventType;
  proposedDate: string;
  location: string;
  venueName: string;
  venueDetails: string | null;
  numberOfPitches: number;
  maxTeams: number;
  foodOptions: string | null;
  accommodationOptions: string | null;
  localAttractions: string | null;
  additionalNotes: string | null;
  status: EventStatus;
  createdAt: string;
  _count: {
    registrations: number;
  };
}

interface Registration {
  id: string;
  clubName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  numberOfPlayers: number;
  additionalNotes: string | null;
  status: RegistrationStatus;
  createdAt: string;
  event: {
    id: string;
    location: string;
    eventType: EventType;
  };
}

const eventTypeLabels: Record<EventType, string> = {
  DADS_AND_LADS: "Dads & Lads",
  GAELIC4MOTHERS_AND_OTHERS: "G4MO",
  SOCIAL_CAMOGIE: "Social Camogie",
};

const statusColors: Record<EventStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const regStatusColors: Record<RegistrationStatus, string> = {
  CONFIRMED: "bg-green-100 text-green-800",
  WAITING_LIST: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function GGEAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"events" | "registrations">(
    "events"
  );
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null);
  const [eventFilter, setEventFilter] = useState<EventStatus | "ALL">("ALL");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const response = await fetch("/api/gge/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("gge_admin_email", email);
        fetchData();
      } else {
        setAuthError("You are not authorized to access this page.");
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, regsRes] = await Promise.all([
        fetch("/api/gge/admin/events"),
        fetch("/api/gge/admin/registrations"),
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }

      if (regsRes.ok) {
        const regsData = await regsRes.json();
        setRegistrations(regsData.registrations || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("gge_admin_email");
    if (savedEmail) {
      setEmail(savedEmail);
      const verifyAuth = async (emailToVerify: string) => {
        try {
          const response = await fetch("/api/gge/admin/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailToVerify }),
          });

          if (response.ok) {
            setIsAuthenticated(true);
            fetchData();
          }
        } catch {
          // Silent fail - user will need to log in
        }
      };
      verifyAuth(savedEmail);
    }
  }, [fetchData]);

  const updateEventStatus = async (eventId: string, status: EventStatus) => {
    try {
      const response = await fetch(`/api/gge/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const updateRegistrationStatus = async (
    regId: string,
    status: RegistrationStatus
  ) => {
    try {
      const response = await fetch(`/api/gge/admin/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update registration:", error);
    }
  };

  const exportCSV = () => {
    const data = registrations.map((r) => ({
      "Event Location": r.event.location,
      "Event Type": eventTypeLabels[r.event.eventType],
      "Club Name": r.clubName,
      "Contact Name": r.contactName,
      "Contact Email": r.contactEmail,
      "Contact Phone": r.contactPhone,
      "Number of Players": r.numberOfPlayers,
      Status: r.status,
      "Registration Date": new Date(r.createdAt).toLocaleDateString(),
      Notes: r.additionalNotes || "",
    }));

    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => `"${row[h as keyof typeof row] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gge-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredEvents =
    eventFilter === "ALL"
      ? events
      : events.filter((e) => e.status === eventFilter);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#1e3a5f] text-white py-4">
          <div className="container mx-auto px-4 flex items-center gap-4">
            <Image
              src="/images/gge-crest.png"
              alt="Gaelic Games Europe"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <h1 className="text-lg font-bold">GGE Admin</h1>
              <p className="text-sm text-[#f5c842]">Recreational Games 2026</p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6 text-center">
              Admin Login
            </h2>
            <form onSubmit={handleLogin}>
              {authError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {authError}
                </div>
              )}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1e3a5f] text-white font-bold py-3 rounded-lg hover:bg-[#2d4a6f] transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/gge-crest.png"
              alt="Gaelic Games Europe"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <h1 className="text-lg font-bold">GGE Admin Dashboard</h1>
              <p className="text-sm text-[#f5c842]">Recreational Games 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{email}</span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("gge_admin_email");
                setIsAuthenticated(false);
              }}
              className="text-sm text-white/70 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-3xl font-bold text-[#1e3a5f]">
              {events.filter((e) => e.status === "PENDING").length}
            </p>
            <p className="text-gray-500">Pending Events</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-3xl font-bold text-green-600">
              {events.filter((e) => e.status === "APPROVED").length}
            </p>
            <p className="text-gray-500">Approved Events</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-3xl font-bold text-[#f5c842]">
              {registrations.filter((r) => r.status === "CONFIRMED").length}
            </p>
            <p className="text-gray-500">Confirmed Teams</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-3xl font-bold text-orange-500">
              {registrations.filter((r) => r.status === "WAITING_LIST").length}
            </p>
            <p className="text-gray-500">Waiting List</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "events"
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Event Applications ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("registrations")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "registrations"
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Team Registrations ({registrations.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : activeTab === "events" ? (
          <div>
            {/* Event Filters */}
            <div className="flex gap-2 mb-4">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setEventFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      eventFilter === status
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {status === "ALL" ? "All" : status}
                  </button>
                )
              )}
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Host Club
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Teams
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(event)}
                          className="text-[#1e3a5f] font-medium hover:underline"
                        >
                          {event.location}
                        </button>
                        <p className="text-sm text-gray-500">
                          {event.venueName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {eventTypeLabels[event.eventType]}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(event.proposedDate)}
                      </td>
                      <td className="px-4 py-3 text-sm">{event.clubName}</td>
                      <td className="px-4 py-3 text-sm">
                        {event._count.registrations} / {event.maxTeams}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {event.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateEventStatus(event.id, "APPROVED")
                              }
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateEventStatus(event.id, "REJECTED")
                              }
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No events found
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Export Button */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={exportCSV}
                className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d4a6f] transition-colors"
              >
                Export CSV
              </button>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Players
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Registered
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{reg.clubName}</p>
                        <p className="text-sm text-gray-500">
                          {reg.contactName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p>{reg.event.location}</p>
                        <p className="text-gray-500">
                          {eventTypeLabels[reg.event.eventType]}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p>{reg.contactEmail}</p>
                        <p className="text-gray-500">{reg.contactPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {reg.numberOfPlayers}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(reg.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${regStatusColors[reg.status]}`}
                        >
                          {reg.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={reg.status}
                          onChange={(e) =>
                            updateRegistrationStatus(
                              reg.id,
                              e.target.value as RegistrationStatus
                            )
                          }
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="WAITING_LIST">Waiting List</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registrations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No registrations yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#1e3a5f] text-white p-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{selectedEvent.location}</h3>
                <p className="text-[#f5c842]">
                  {eventTypeLabels[selectedEvent.eventType]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-white/70 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
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
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Host Club</p>
                  <p className="font-medium">{selectedEvent.clubName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Contact</p>
                  <p className="font-medium">{selectedEvent.contactName}</p>
                  <p className="text-sm">{selectedEvent.contactEmail}</p>
                  <p className="text-sm">{selectedEvent.contactPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedEvent.proposedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Venue</p>
                  <p className="font-medium">{selectedEvent.venueName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pitches</p>
                  <p className="font-medium">{selectedEvent.numberOfPitches}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Max Teams</p>
                  <p className="font-medium">{selectedEvent.maxTeams}</p>
                </div>
              </div>
              {selectedEvent.venueDetails && (
                <div>
                  <p className="text-gray-500 text-sm">Venue Details</p>
                  <p>{selectedEvent.venueDetails}</p>
                </div>
              )}
              {selectedEvent.foodOptions && (
                <div>
                  <p className="text-gray-500 text-sm">Food Options</p>
                  <p>{selectedEvent.foodOptions}</p>
                </div>
              )}
              {selectedEvent.accommodationOptions && (
                <div>
                  <p className="text-gray-500 text-sm">Accommodation</p>
                  <p>{selectedEvent.accommodationOptions}</p>
                </div>
              )}
              {selectedEvent.localAttractions && (
                <div>
                  <p className="text-gray-500 text-sm">Local Attractions</p>
                  <p>{selectedEvent.localAttractions}</p>
                </div>
              )}
              {selectedEvent.additionalNotes && (
                <div>
                  <p className="text-gray-500 text-sm">Additional Notes</p>
                  <p>{selectedEvent.additionalNotes}</p>
                </div>
              )}
              <div className="pt-4 border-t flex gap-2">
                {selectedEvent.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateEventStatus(selectedEvent.id, "APPROVED");
                        setSelectedEvent(null);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      Approve Event
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateEventStatus(selectedEvent.id, "REJECTED");
                        setSelectedEvent(null);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                    >
                      Reject Event
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
