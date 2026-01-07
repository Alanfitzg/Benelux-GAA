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
};

export default function EventsManagementClient({
  initialEvents,
  deleteEvent,
}: Props) {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");

  // Extract unique countries and event types for filter dropdowns
  const { countries, eventTypes } = useMemo(() => {
    const countrySet = new Set<string>();
    const eventTypeSet = new Set<string>();

    initialEvents.forEach((event) => {
      // Add event type
      if (event.eventType) {
        eventTypeSet.add(event.eventType);
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
        // This is a simple heuristic - you might want to improve this
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
    };
  }, [initialEvents]);

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
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
          // For independent events, check location
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
  }, [initialEvents, selectedCountry, selectedEventType, searchTerm]);

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

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Country Filter */}
          <div>
            <label
              htmlFor="country-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Country/Region
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">
                All Countries ({initialEvents.length})
              </option>
              {countries.map((country) => {
                const count = initialEvents.filter((event) => {
                  let eventCountry = "";
                  if (event.club) {
                    eventCountry =
                      event.club.country?.name ||
                      event.club.internationalUnit?.name ||
                      event.club.region ||
                      "";
                  } else {
                    const locationParts = event.location
                      .split(",")
                      .map((s) => s.trim());
                    if (locationParts.length > 1) {
                      eventCountry = locationParts[locationParts.length - 1];
                    }
                  }
                  return eventCountry === country;
                }).length;

                return (
                  <option key={country} value={country}>
                    {country} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label
              htmlFor="type-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Type
            </label>
            <select
              id="type-filter"
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Types</option>
              {eventTypes.map((type) => {
                const count = initialEvents.filter(
                  (event) => event.eventType === type
                ).length;
                return (
                  <option key={type} value={type}>
                    {type} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search Filter */}
          <div>
            <label
              htmlFor="search-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Events
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search by title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="px-4 py-2 bg-gray-100 rounded-lg w-full text-center">
              <span className="text-sm text-gray-600">
                Showing {filteredEvents.length} of {initialEvents.length} events
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
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
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
                  let displayCountry = "-";
                  if (event.club) {
                    displayCountry =
                      event.club.country?.name ||
                      event.club.internationalUnit?.name ||
                      event.club.region ||
                      "-";
                  } else {
                    const locationParts = event.location
                      .split(",")
                      .map((s) => s.trim());
                    if (locationParts.length > 1) {
                      displayCountry = locationParts[locationParts.length - 1];
                    }
                  }

                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 transition-colors"
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary/10 text-secondary">
                          {event.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.eventType === "Tournament" ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              event.visibility === "PUBLIC"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.visibility === "PUBLIC"
                              ? "🌍 Public"
                              : "🔒 Private"}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        📍 {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {displayCountry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        📅 {formatShortDate(event.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
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
    </div>
  );
}
