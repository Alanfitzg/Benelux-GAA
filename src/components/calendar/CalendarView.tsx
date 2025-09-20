"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { Calendar, AlertCircle, Plus, List, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarPermissions } from "@/lib/calendar/permissions";
import CalendarCell from "./CalendarCell";
import CalendarFilters from "./CalendarFilters";
import CalendarLegend from "./CalendarLegend";
import EventCreateModal from "./EventCreateModal";
import InterestModal from "./InterestModal";
import { CalendarEvent, Holiday, BlockedWeekend, PriorityWeekend } from "@prisma/client";

interface CalendarViewProps {
  clubId: string;
  clubName: string;
  permissions: CalendarPermissions;
  isMainlandEurope: boolean;
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

export default function CalendarView({ clubId, clubName, permissions, isMainlandEurope }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
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
    showInterest: permissions.canViewInterestIdentities !== false,
  });
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchCalendarData = useCallback(async () => {
    if (!isMainlandEurope) return;

    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const [eventsRes, interestsRes, holidaysRes, blockedRes, priorityRes] = await Promise.all([
        fetch(`/api/calendar/events?clubId=${clubId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
        fetch(`/api/calendar/interest?clubId=${clubId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
        fetch(`/api/calendar/holidays?country=Ireland&year=${currentDate.getFullYear()}`),
        fetch(`/api/calendar/blocked-weekends?clubId=${clubId}`),
        fetch(`/api/calendar/priority-weekends?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
      ]);

      const [events, interests, holidays, blockedWeekends, priorityWeekends] = await Promise.all([
        eventsRes.ok ? eventsRes.json() : [],
        interestsRes.ok ? interestsRes.json() : [],
        holidaysRes.ok ? holidaysRes.json() : [],
        blockedRes.ok ? blockedRes.json() : [],
        priorityRes.ok ? priorityRes.json() : [],
      ]);

      setCalendarData({
        events,
        interests,
        holidays,
        blockedWeekends,
        priorityWeekends,
      });
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, clubId, isMainlandEurope]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (permissions.canSubmitInterest) {
      setShowInterestModal(true);
    }
  };

  const handleCreateEvent = () => {
    setSelectedDate(null);
    setShowEventModal(true);
  };

  const getDataForDate = (date: Date) => {

    const events = calendarData.events.filter(event =>
      isSameDay(new Date(event.startDate), date)
    );

    const interest = calendarData.interests.find(i =>
      isSameDay(new Date(i.date), date)
    );

    const holidays = calendarData.holidays.filter(h =>
      isSameDay(new Date(h.date), date)
    );

    const isBlocked = calendarData.blockedWeekends.some(b =>
      date >= new Date(b.startDate) && date <= new Date(b.endDate)
    );

    const priorityWeekend = calendarData.priorityWeekends.find(p =>
      isSameDay(new Date(p.date), date)
    );

    return {
      events,
      interestCount: interest?.totalSubmissions || 0,
      uniqueUsers: interest?.uniqueUsers || 0,
      holidays,
      isBlocked,
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

  if (!isMainlandEurope) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Calendar Not Available</h3>
            <p className="text-sm text-yellow-800 mt-1">
              The Club Admin Calendar is only available for GAA clubs registered in mainland Europe (Gaelic Games Europe).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Club Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "calendar" ? "list" : "calendar")}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              {viewMode === "calendar" ? <List className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {viewMode === "calendar" ? "List View" : "Calendar View"}
            </button>
            {permissions.canCreateEvents && (
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            )}
          </div>
        </div>

        <CalendarFilters
          filters={filters}
          onFiltersChange={setFilters}
          showInterestFilter={permissions.canViewInterest !== false}
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
          Loading calendar data...
        </div>
      ) : viewMode === "calendar" ? (
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
                  permissions={permissions}
                  onClick={() => handleDateClick(date)}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="space-y-4">
            {calendarData.events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.startDate), "PPP")}
                      {event.startTime && ` at ${event.startTime}`}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    )}
                    {event.conflictWarning && (
                      <div className="flex items-center gap-2 mt-2 text-yellow-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{event.conflictWarning}</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.eventSource === "FIXTURE" ? "bg-blue-100 text-blue-800" :
                    event.eventSource === "CLUB" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {event.eventType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CalendarLegend />

      {showEventModal && permissions.canCreateEvents && (
        <EventCreateModal
          clubId={clubId}
          selectedDate={selectedDate}
          onClose={() => setShowEventModal(false)}
          onSuccess={() => {
            setShowEventModal(false);
            fetchCalendarData();
          }}
        />
      )}

      {showInterestModal && selectedDate && (
        <InterestModal
          clubId={clubId}
          clubName={clubName}
          selectedDate={selectedDate}
          onClose={() => setShowInterestModal(false)}
          onSuccess={() => {
            setShowInterestModal(false);
            fetchCalendarData();
          }}
        />
      )}
    </div>
  );
}