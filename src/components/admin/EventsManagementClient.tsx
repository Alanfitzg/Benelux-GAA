"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DeleteButton from "@/components/ui/DeleteButton";
import { formatShortDate } from "@/lib/utils";

type EventListItem = {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: Date;
  visibility: string;
  acceptedTeamTypes: string[];
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  cost?: number | null;
  platformFee?: number;
  club?: {
    id: string;
    name: string;
    country?: {
      id: string;
      name: string;
    } | null;
    internationalUnit?: {
      id: string;
      name: string;
    } | null;
    region?: string | null;
  } | null;
};

type Props = {
  initialEvents: EventListItem[];
  deleteEvent: (formData: FormData) => Promise<void>;
  approveEvent?: (formData: FormData) => Promise<void>;
  rejectEvent?: (formData: FormData) => Promise<void>;
};

export default function EventsManagementClient({
  initialEvents,
  deleteEvent,
  approveEvent,
  rejectEvent,
}: Props) {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedApprovalStatus, setSelectedApprovalStatus] =
    useState<string>("all");
  const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Extract unique countries, event types, and sports for filter dropdowns
  const { countries, eventTypes, sports, approvalStatuses } = useMemo(() => {
    const countrySet = new Set<string>();
    const eventTypeSet = new Set<string>();
    const sportSet = new Set<string>();
    const approvalStatusSet = new Set<string>();

    initialEvents.forEach((event) => {
      // Add event type
      if (event.eventType) {
        eventTypeSet.add(event.eventType);
      }

      // Add approval status
      if (event.approvalStatus) {
        approvalStatusSet.add(event.approvalStatus);
      }

      // Add sports/codes
      if (event.acceptedTeamTypes && event.acceptedTeamTypes.length > 0) {
        event.acceptedTeamTypes.forEach((sport) => sportSet.add(sport));
      }

      // Extract country from club data
      if (event.club) {
        if (event.club.country?.name) {
          countrySet.add(event.club.country.name);
        } else if (event.club.internationalUnit?.name) {
          countrySet.add(event.club.internationalUnit.name);
        } else if (event.club.region) {
          countrySet.add(event.club.region);
        }
      } else {
        // For independent events, try to extract country from location
        const locationParts = event.location.split(",").map((s) => s.trim());
        if (locationParts.length > 1) {
          const potentialCountry = locationParts[locationParts.length - 1];
          if (potentialCountry && potentialCountry.length > 1) {
            countrySet.add(potentialCountry);
          }
        }
      }
    });

    return {
      countries: Array.from(countrySet).sort(),
      eventTypes: Array.from(eventTypeSet).sort(),
      sports: Array.from(sportSet).sort(),
      approvalStatuses: Array.from(approvalStatusSet).sort(),
    };
  }, [initialEvents]);

  // Count events by approval status
  const pendingCount = initialEvents.filter(
    (e) => e.approvalStatus === "PENDING"
  ).length;
  const approvedCount = initialEvents.filter(
    (e) => e.approvalStatus === "APPROVED"
  ).length;
  const rejectedCount = initialEvents.filter(
    (e) => e.approvalStatus === "REJECTED"
  ).length;

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // Approval status filter
      if (
        selectedApprovalStatus !== "all" &&
        event.approvalStatus !== selectedApprovalStatus
      ) {
        return false;
      }

      // Country filter
      if (selectedCountry !== "all") {
        let eventCountry = "";

        if (event.club) {
          eventCountry =
            event.club.country?.name ||
            event.club.internationalUnit?.name ||
            event.club.region ||
            "";
        } else {
          const locationParts = event.location.split(",").map((s) => s.trim());
          if (locationParts.length > 1) {
            eventCountry = locationParts[locationParts.length - 1];
          }
        }

        if (eventCountry !== selectedCountry) {
          return false;
        }
      }

      // Event type filter
      if (
        selectedEventType !== "all" &&
        event.eventType !== selectedEventType
      ) {
        return false;
      }

      // Sport filter
      if (selectedSport !== "all") {
        if (
          !event.acceptedTeamTypes ||
          !event.acceptedTeamTypes.includes(selectedSport)
        ) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.eventType.toLowerCase().includes(searchLower) ||
          event.club?.name.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [
    initialEvents,
    selectedCountry,
    selectedEventType,
    selectedSport,
    selectedApprovalStatus,
    searchTerm,
  ]);

  const handleReject = async (eventId: string) => {
    if (!rejectEvent) return;
    const formData = new FormData();
    formData.append("id", eventId);
    formData.append("reason", rejectionReason);
    await rejectEvent(formData);
    setRejectingEventId(null);
    setRejectionReason("");
  };

  const getApprovalStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            ⏳ Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            ✓ Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            ✗ Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Manage Events
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href="/events/create"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md text-center"
          >
            Create Event
          </Link>
          <Link
            href="/admin"
            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Pending Events Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-full p-2">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">
                {pendingCount} Event{pendingCount !== 1 ? "s" : ""} Awaiting
                Approval
              </h3>
              <p className="text-sm text-amber-700">
                Review and approve or reject pending events to make them visible
                on the public events page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedApprovalStatus("PENDING")}
              className="ml-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
            >
              View Pending
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Approval Status Filter */}
          <div>
            <label
              htmlFor="approval-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Approval Status
            </label>
            <select
              id="approval-filter"
              value={selectedApprovalStatus}
              onChange={(e) => setSelectedApprovalStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Status ({initialEvents.length})</option>
              <option value="PENDING">⏳ Pending ({pendingCount})</option>
              <option value="APPROVED">✓ Approved ({approvedCount})</option>
              <option value="REJECTED">✗ Rejected ({rejectedCount})</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label
              htmlFor="country-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country/Region
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label
              htmlFor="type-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Type
            </label>
            <select
              id="type-filter"
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Sport Filter */}
          <div>
            <label
              htmlFor="sport-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sport
            </label>
            <select
              id="sport-filter"
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Sports</option>
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          {/* Search Filter */}
          <div>
            <label
              htmlFor="search-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="px-4 py-2 bg-gray-100 rounded-lg w-full text-center">
              <span className="text-sm text-gray-600">
                {filteredEvents.length} of {initialEvents.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const totalCost = event.cost
                    ? event.cost + (event.platformFee || 5)
                    : null;

                  return (
                    <tr
                      key={event.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        event.approvalStatus === "PENDING"
                          ? "bg-amber-50/50"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        {event.club && (
                          <div className="text-xs text-gray-500">
                            {event.club.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getApprovalStatusBadge(event.approvalStatus)}
                        {event.approvalStatus === "REJECTED" &&
                          event.rejectionReason && (
                            <div
                              className="text-xs text-red-600 mt-1 max-w-32 truncate"
                              title={event.rejectionReason}
                            >
                              {event.rejectionReason}
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary/10 text-secondary">
                          {event.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {totalCost !== null ? (
                          <div>
                            <span className="font-medium text-gray-900">
                              €{totalCost}
                            </span>
                            <span className="text-xs text-gray-500 block">
                              (€{event.cost} + €{event.platformFee || 5} fee)
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        📍 {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        📅 {formatShortDate(event.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {event.approvalStatus === "PENDING" &&
                            approveEvent &&
                            rejectEvent && (
                              <>
                                <form action={approveEvent}>
                                  <input
                                    type="hidden"
                                    name="id"
                                    value={event.id}
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                                  >
                                    Approve
                                  </button>
                                </form>
                                <button
                                  type="button"
                                  onClick={() => setRejectingEventId(event.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-primary hover:text-primary/80 transition"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300">|</span>
                          <DeleteButton
                            id={event.id}
                            onDelete={deleteEvent}
                            itemType="event"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No events found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingEventId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reject Event
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this event. This will be
              shown to the event creator.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 mb-4"
              rows={3}
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingEventId(null);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectingEventId)}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Reject Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
