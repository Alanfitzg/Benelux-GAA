"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CompactCalendarWidgetProps {
  clubId: string;
  clubName: string;
  userId?: string;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
}

export default function CompactCalendarWidget({
  clubId,
}: CompactCalendarWidgetProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const fetchCalendarData = async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/calendar`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentYearEvents = () => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    return events
      .filter((event) => {
        const eventDate = parseISO(event.startDate);
        return eventDate >= startOfYear && eventDate <= endOfYear;
      })
      .sort(
        (a, b) =>
          parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
      );
  };

  const currentYearEvents = getCurrentYearEvents();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-400" />
              Events
            </h3>
            {currentYearEvents.length > 0 && (
              <span className="text-sm text-gray-500">
                {currentYearEvents.length} in {new Date().getFullYear()}
              </span>
            )}
          </div>

          {currentYearEvents.length > 0 ? (
            <div className="space-y-3 mb-4">
              {currentYearEvents.map((event) => (
                <a
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="text-gray-500 mt-0.5 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {format(parseISO(event.startDate), "MMM d, yyyy")}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 px-4 bg-gray-50 rounded-lg mb-4">
              <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No upcoming tournaments scheduled
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Express interest to help organize one!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
