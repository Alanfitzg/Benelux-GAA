"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import CalendarCell from "./CalendarCell";
import CalendarFilters from "./CalendarFilters";
import CalendarLegend from "./CalendarLegend";
import { CalendarEvent, Holiday, BlockedWeekend, PriorityWeekend } from "@prisma/client";

interface Club {
  id: string;
  name: string;
  isMainlandEurope: boolean;
}

interface UnifiedCalendarViewProps {
  mainlandEuropeClubs: Club[];
  clubPermissions: Record<string, { canViewCalendar: boolean; canCreateEvents: boolean; canViewInterestIdentities: boolean }>;
  userId?: string | null;
}

interface CalendarData {
  events: CalendarEvent[];
  interests: { date: string; totalSubmissions: number; uniqueUsers: number; clubCount: number }[];
  holidays: Holiday[];
  blockedWeekends: BlockedWeekend[];
  priorityWeekends: PriorityWeekend[];
}

interface Filters {
  showFixtures: boolean;
  showEvents: boolean;
  showInterest: boolean;
}

export default function UnifiedCalendarView({
  mainlandEuropeClubs,
  clubPermissions: _clubPermissions, // eslint-disable-line @typescript-eslint/no-unused-vars
  userId
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
    showFixtures: true,
    showEvents: true,
    showInterest: !!userId, // Only show interest to logged-in users
  });
  const [loading, setLoading] = useState(true);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
        throw new Error('Failed to fetch unified calendar data');
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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    // For unified view, show club selection for interest submission
    setSelectedDate(date);
    if (userId) {
      setShowInterestModal(true);
    }
  };

  const getDataForDate = (date: Date) => {
    const events = calendarData.events.filter(event =>
      isSameDay(new Date(event.startDate), date)
    );

    const interest = calendarData.interests.find((i: { date: string; totalSubmissions: number; uniqueUsers: number; clubCount: number }) =>
      isSameDay(new Date(i.date), date)
    );

    const holidays = calendarData.holidays.filter(h =>
      isSameDay(new Date(h.date), date)
    );

    const priorityWeekend = calendarData.priorityWeekends.find(p =>
      isSameDay(new Date(p.date), date)
    );

    return {
      events,
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
      canViewInterestIdentities: false,
      canSubmitInterest: !!userId,
      canViewAllCalendars: true,
      canManageHolidays: false,
      canAccessDigest: false,
      canViewInterest: !!userId, // Only show interest heatmap to logged in users
    };
  };

  const totalEvents = calendarData.events.length;
  const totalInterestSubmissions = calendarData.interests.reduce((sum: number, interest: { date: string; totalSubmissions: number; uniqueUsers: number; clubCount: number }) =>
    sum + (interest.totalSubmissions || 0), 0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            European GAA Calendar
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{totalEvents} events this month</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{totalInterestSubmissions} interest submissions</span>
            </div>
          </div>
        </div>

        <CalendarFilters
          filters={filters}
          onFiltersChange={setFilters}
          showInterestFilter={!!userId}
        />

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          Loading European calendar data...
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-28" />;
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
                  priorityWeekend={dayData.priorityWeekend}
                  filters={{...filters, showHolidays: true}}
                  permissions={getUnifiedPermissions()}
                  onClick={() => handleDateClick(date)}
                />
              );
            })}
          </div>
        </div>
      )}

      <CalendarLegend />

      {/* Unified Interest Modal - requires club selection */}
      {showInterestModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Express Interest</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose a club you&apos;d like to visit on {format(selectedDate, "PPP")}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {mainlandEuropeClubs.slice(0, 10).map((club) => (
                  <button
                    key={club.id}
                    onClick={() => {
                      setSelectedClubForInterest(club.id);
                      setShowInterestModal(false);
                      // This would open the actual InterestModal for the specific club
                    }}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{club.name}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setShowInterestModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}