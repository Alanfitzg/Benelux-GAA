"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import CalendarCell from "./CalendarCell";
import CalendarFilters from "./CalendarFilters";
import CalendarLegend from "./CalendarLegend";
import {
  CalendarEvent,
  Holiday,
  BlockedWeekend,
  PriorityWeekend,
} from "@prisma/client";

interface Club {
  id: string;
  name: string;
  isMainlandEurope: boolean;
  country: { name: string; code: string } | null;
}

interface AdminTab {
  id: string;
  label: string;
  mobileLabel: string;
}

interface UnifiedCalendarViewProps {
  mainlandEuropeClubs: Club[];
  clubPermissions: Record<
    string,
    {
      canViewCalendar: boolean;
      canCreateEvents: boolean;
      canViewInterestIdentities: boolean;
    }
  >;
  userId?: string | null;
  isAdmin?: boolean;
  // Sidebar filters from EventsPageClient
  selectedCountry?: string;
  selectedSportTypes?: string[];
  // Admin tabs integration
  adminTabs?: AdminTab[];
  activeAdminTab?: string;
  onAdminTabChange?: (tabId: string) => void;
}

// Extended CalendarEvent with club info for filtering
interface CalendarEventWithClub extends CalendarEvent {
  club: {
    name: string;
    imageUrl: string | null;
    location: string | null;
    sportsSupported: string[];
    country: {
      name: string;
      code: string;
    } | null;
  };
}

interface CalendarData {
  events: CalendarEventWithClub[];
  interests: {
    date: string;
    totalSubmissions: number;
    uniqueUsers: number;
    clubCount: number;
  }[];
  holidays: Holiday[];
  blockedWeekends: BlockedWeekend[];
  priorityWeekends: PriorityWeekend[];
}

interface Filters {
  showPublic: boolean;
  showPrivate: boolean;
  showInterest: boolean;
}

export default function UnifiedCalendarView({
  mainlandEuropeClubs,
  clubPermissions: _clubPermissions, // eslint-disable-line @typescript-eslint/no-unused-vars
  userId,
  isAdmin = false,
  selectedCountry = "",
  selectedSportTypes = [],
  adminTabs,
  activeAdminTab,
  onAdminTabChange,
}: UnifiedCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({
    events: [],
    interests: [],
    holidays: [],
    blockedWeekends: [],
    priorityWeekends: [],
  });
  const [filters, setFilters] = useState<Filters>({
    showPublic: true,
    showPrivate: true,
    showInterest: isAdmin, // Only show interest heatmap to admins
  });
  const [loading, setLoading] = useState(true);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<
    CalendarEventWithClub[]
  >([]);
  const [selectedClubForInterest, setSelectedClubForInterest] = useState<
    string | null
  >(null);
  const [selectedCountryForInterest, setSelectedCountryForInterest] = useState<
    string | null
  >(null);

  // Get unique countries from mainland Europe clubs
  const availableCountries = useMemo(() => {
    const countries = mainlandEuropeClubs
      .map((club) => club.country?.name)
      .filter((name): name is string => !!name);
    return [...new Set(countries)].sort();
  }, [mainlandEuropeClubs]);

  // Filter clubs by selected country
  const filteredClubsForInterest = useMemo(() => {
    if (!selectedCountryForInterest) return [];
    return mainlandEuropeClubs.filter(
      (club) => club.country?.name === selectedCountryForInterest
    );
  }, [mainlandEuropeClubs, selectedCountryForInterest]);

  const fetchUnifiedCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      // Use the unified API endpoint for better performance
      const response = await fetch(
        `/api/calendar/unified?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch unified calendar data");
      }

      const data = await response.json();

      setCalendarData({
        events: data.events || [],
        interests: data.interests || [],
        holidays: data.holidays || [],
        blockedWeekends: [], // Not relevant for unified view
        priorityWeekends: data.priorityWeekends || [],
      });
    } catch (error) {
      console.error("Error fetching unified calendar data:", error);
      // Fallback to empty data
      setCalendarData({
        events: [],
        interests: [],
        holidays: [],
        blockedWeekends: [],
        priorityWeekends: [],
      });
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchUnifiedCalendarData();
  }, [fetchUnifiedCalendarData]);

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateClick = (date: Date, events: CalendarEventWithClub[]) => {
    setSelectedDate(date);
    setSelectedDateEvents(events);

    if (events.length > 0) {
      // Date has events - show event modal
      setShowEventModal(true);
    } else if (userId) {
      // Date is empty - show interest modal for logged-in users
      setShowInterestModal(true);
    }
  };

  const getDataForDate = (date: Date) => {
    let events = calendarData.events.filter((event) =>
      isSameDay(new Date(event.startDate), date)
    );

    // Apply country filter from sidebar
    if (selectedCountry) {
      events = events.filter((event) => {
        const clubCountry = event.club?.country?.name || "";
        const eventLocation = event.location || event.club?.location || "";
        return (
          clubCountry.toLowerCase().includes(selectedCountry.toLowerCase()) ||
          eventLocation.toLowerCase().includes(selectedCountry.toLowerCase())
        );
      });
    }

    // Apply sport type filter from sidebar
    if (selectedSportTypes.length > 0) {
      events = events.filter((event) => {
        const clubSports = event.club?.sportsSupported || [];
        // Check if club supports any of the selected sport types
        return selectedSportTypes.some((sport) => clubSports.includes(sport));
      });
    }

    const interest = calendarData.interests.find(
      (i: {
        date: string;
        totalSubmissions: number;
        uniqueUsers: number;
        clubCount: number;
      }) => isSameDay(new Date(i.date), date)
    );

    const holidays = calendarData.holidays.filter((h) =>
      isSameDay(new Date(h.date), date)
    );

    const priorityWeekend = calendarData.priorityWeekends.find((p) =>
      isSameDay(new Date(p.date), date)
    );

    return {
      events: events as CalendarEvent[], // Cast back to CalendarEvent for CalendarCell
      filteredEvents: events, // Keep full data for modal
      interestCount: interest?.totalSubmissions || 0,
      uniqueUsers: interest?.uniqueUsers || 0,
      holidays,
      isBlocked: false, // No blocking in unified view
      priorityWeekend,
    };
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Add empty cells for alignment
    const firstDayOfWeek = getDay(start);
    const emptyDays = Array(firstDayOfWeek).fill(null);

    return [...emptyDays, ...days];
  };

  const getUnifiedPermissions = () => {
    return {
      canViewCalendar: true,
      canCreateEvents: false, // Not available in unified view
      canEditAllEvents: false,
      canBlockWeekends: false,
      canFlagPriorityWeekends: false,
      canViewInterestIdentities: isAdmin,
      canSubmitInterest: !!userId,
      canViewAllCalendars: true,
      canManageHolidays: false,
      canAccessDigest: false,
      canViewInterest: isAdmin, // Only show interest heatmap to admins
    };
  };

  const totalEvents = calendarData.events.length;
  const totalInterestSubmissions = calendarData.interests.reduce(
    (
      sum: number,
      interest: {
        date: string;
        totalSubmissions: number;
        uniqueUsers: number;
        clubCount: number;
      }
    ) => sum + (interest.totalSubmissions || 0),
    0
  );

  // Show under construction message for non-admin users
  // Super admins get full access to the calendar
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              European GAA Calendar
            </h2>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Calendar Under Construction
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We&apos;re working on bringing you an improved calendar experience.
            Check back soon!
          </p>
        </div>
      </div>
    );
  }

  // Full calendar implementation for admins
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            European GAA Calendar
          </h2>
          {totalEvents > 0 && (
            <span className="text-white/90 text-sm">
              {totalEvents} event{totalEvents !== 1 ? "s" : ""} this month
            </span>
          )}
        </div>
      </div>

      {/* Controls section */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-1.5 sm:p-2 hover:bg-white rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 min-w-[120px] sm:min-w-[160px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1.5 sm:p-2 hover:bg-white rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Filters and Admin Tabs */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <CalendarFilters
              filters={filters}
              onFiltersChange={setFilters}
              showInterestFilter={isAdmin}
            />

            {/* Admin Tabs - inline with filters */}
            {isAdmin &&
              adminTabs &&
              adminTabs.length > 0 &&
              onAdminTabChange && (
                <>
                  <div className="w-px h-6 bg-gray-300 hidden sm:block" />
                  <div className="flex items-center gap-1">
                    {adminTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => onAdminTabChange(tab.id)}
                        className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          activeAdminTab === tab.id
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.mobileLabel}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
          </div>
        </div>

        {/* Active sidebar filters indicator */}
        {(selectedCountry || selectedSportTypes.length > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Filtering by:</span>
            {selectedCountry && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {selectedCountry}
              </span>
            )}
            {selectedSportTypes.map((sport) => (
              <span
                key={sport}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {sport}
              </span>
            ))}
          </div>
        )}

        {/* Admin stats - only show to admins */}
        {isAdmin && totalInterestSubmissions > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{totalInterestSubmissions} interest submissions</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      ) : (
        <div className="bg-primary p-4 md:p-6 relative overflow-hidden">
          {/* Subtle texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 relative z-10">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, index) => (
                <div
                  key={day}
                  className={`text-center text-xs font-semibold py-2 rounded-md ${
                    index === 0 || index === 6
                      ? "text-white/90"
                      : "text-white/70"
                  }`}
                >
                  {day}
                </div>
              )
            )}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5 relative z-10">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-20 md:h-24 bg-white/10 rounded-lg"
                  />
                );
              }

              const dayData = getDataForDate(date);

              return (
                <CalendarCell
                  key={date.toISOString()}
                  date={date}
                  events={dayData.events}
                  interestCount={dayData.interestCount}
                  uniqueUsers={dayData.uniqueUsers}
                  holidays={dayData.holidays}
                  isBlocked={dayData.isBlocked}
                  priorityWeekend={dayData.priorityWeekend || null}
                  filters={{ ...filters, showHolidays: true }}
                  permissions={getUnifiedPermissions()}
                  onClick={() => handleDateClick(date, dayData.filteredEvents)}
                />
              );
            })}
          </div>
        </div>
      )}

      <CalendarLegend />

      {/* Event Modal - shows events for selected date */}
      {showEventModal && selectedDate && selectedDateEvents.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {selectedDateEvents.length === 1 ? "Event" : "Events"} on{" "}
                {format(selectedDate!, "PPP")}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <a
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
                  >
                    <div className="font-semibold text-gray-900">
                      {event.title}
                    </div>
                    {event.club && (
                      <div className="text-sm text-gray-600 mt-1">
                        Hosted by {event.club.name}
                        {event.club.country && ` • ${event.club.country.name}`}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-sm text-gray-500 mt-1">
                        {event.location}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-primary font-medium">
                      Go to event page →
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interest Modal - for empty dates */}
      {showInterestModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {format(selectedDate!, "EEEE, MMMM d, yyyy")}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mt-3">
                  Express Interest
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                You are available and interested to travel on this date? If you
                have any preference of location - feel free to add/select it
                below.
              </p>

              {!selectedCountryForInterest ? (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Select a country (optional):
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                    {availableCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => setSelectedCountryForInterest(country)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
                      >
                        <div className="font-medium">{country}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClubForInterest(null);
                        setShowInterestModal(false);
                      }}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Submit Interest (No Preference)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCountryForInterest(null);
                        setShowInterestModal(false);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Clubs in {selectedCountryForInterest}:
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedCountryForInterest(null)}
                      className="text-sm text-primary hover:underline"
                    >
                      Change country
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                    {filteredClubsForInterest.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => {
                          setSelectedClubForInterest(club.id);
                          setSelectedCountryForInterest(null);
                          setShowInterestModal(false);
                        }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
                      >
                        <div className="font-medium">{club.name}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClubForInterest(null);
                        setSelectedCountryForInterest(null);
                        setShowInterestModal(false);
                      }}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Submit Interest ({selectedCountryForInterest})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCountryForInterest(null);
                        setShowInterestModal(false);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
