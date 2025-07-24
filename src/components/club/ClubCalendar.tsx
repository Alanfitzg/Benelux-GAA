"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarIcon, Users, Globe, CheckCircle } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import InterestSubmissionForm from "./InterestSubmissionForm";
import SignInPromptModal from "../auth/SignInPromptModal";
import { useSignInPrompt } from "@/hooks/useSignInPrompt";

interface ClubCalendarProps {
  clubId: string;
  clubName: string;
}

interface AvailabilitySlot {
  id: string;
  date: string;
  timeSlots: string[];
  capacity?: number;
}

interface TournamentInterest {
  id: string;
  interestType: string;
  specificDate?: string;
  monthYear?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  teamSize: number;
  flexibility: string;
  status: string;
  message?: string;
  user: {
    name: string;
    email: string;
  };
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  eventType: string;
}

export default function ClubCalendar({ clubId, clubName }: ClubCalendarProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const signInPrompt = useSignInPrompt({ action: "express interest" });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "list">("month");
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [interests, setInterests] = useState<TournamentInterest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const [availabilityRes, interestsRes, eventsRes] = await Promise.all([
        fetch(
          `/api/clubs/${clubId}/availability?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        ),
        fetch(
          `/api/clubs/${clubId}/tournament-interest?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`
        ),
        fetch(
          `/api/events?clubId=${clubId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        ),
      ]);

      if (availabilityRes.ok) {
        const data = await availabilityRes.json();
        setAvailabilitySlots(data);
      }

      if (interestsRes.ok) {
        const data = await interestsRes.json();
        setInterests(data);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, clubId]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Check if user just signed in and wanted to express interest
  useEffect(() => {
    const showInterest = searchParams.get("showInterest");
    if (session && showInterest === "true") {
      // Small delay to ensure the page is loaded
      const timer = setTimeout(() => {
        setShowInterestForm(true);
      }, 500);

      // Clean up the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("showInterest");
      window.history.replaceState({}, "", url.toString());

      return () => clearTimeout(timer);
    }
  }, [session, searchParams]);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const days = [];
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfWeek = start.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    return days;
  };

  const getDateContent = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    const availability = availabilitySlots.find(
      (slot) => format(new Date(slot.date), "yyyy-MM-dd") === dateStr
    );

    const dayInterests = interests.filter((interest) => {
      if (
        interest.specificDate &&
        isSameDay(new Date(interest.specificDate), date)
      ) {
        return true;
      }
      if (interest.dateRangeStart && interest.dateRangeEnd) {
        return isWithinInterval(date, {
          start: new Date(interest.dateRangeStart),
          end: new Date(interest.dateRangeEnd),
        });
      }
      return false;
    });

    const dayEvents = events.filter((event) =>
      isSameDay(new Date(event.startDate), date)
    );

    return { availability, interests: dayInterests, events: dayEvents };
  };

  const handleExpressInterest = () => {
    signInPrompt.promptSignIn(() => setShowInterestForm(true));
  };

  const monthInterests = interests.filter(
    (interest) =>
      interest.interestType === "ENTIRE_MONTH" ||
      interest.interestType === "MULTIPLE_MONTHS"
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            Club Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === "month" ? "list" : "month")}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
            >
              {view === "month" ? "List View" : "Month View"}
            </button>
            <button
              onClick={handleExpressInterest}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Express Interest
            </button>
          </div>
        </div>

        {monthInterests.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>
                {monthInterests.length} team
                {monthInterests.length > 1 ? "s" : ""}
              </strong>{" "}
              interested in visiting during {format(currentDate, "MMMM yyyy")}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
              )
            }
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h3 className="text-lg font-medium">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
              )
            }
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          Loading calendar...
        </div>
      ) : view === "month" ? (
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24" />;
              }

              const {
                availability,
                interests: dayInterests,
                events: dayEvents,
              } = getDateContent(date);
              const hasContent =
                availability || dayInterests.length > 0 || dayEvents.length > 0;

              return (
                <motion.div
                  key={date.toISOString()}
                  className={`h-24 p-2 border rounded-lg ${
                    hasContent
                      ? "border-gray-300 bg-gray-50"
                      : "border-gray-200"
                  } hover:bg-gray-100 cursor-pointer`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(date, "d")}
                  </div>
                  <div className="space-y-1">
                    {availability && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                    )}
                    {dayInterests.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Users className="w-3 h-3" />
                        <span>{dayInterests.length}</span>
                      </div>
                    )}
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-1 text-xs text-blue-600"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{interest.user.name}</p>
                  <p className="text-sm text-gray-600">
                    Team size: {interest.teamSize} | Flexibility:{" "}
                    {interest.flexibility}
                  </p>
                  {interest.interestType === "SPECIFIC_DATE" &&
                    interest.specificDate && (
                      <p className="text-sm text-gray-600">
                        Date: {format(new Date(interest.specificDate), "PPP")}
                      </p>
                    )}
                  {interest.interestType === "ENTIRE_MONTH" && (
                    <p className="text-sm text-gray-600">
                      Interested in any time during the month
                    </p>
                  )}
                  {interest.message && (
                    <p className="text-sm text-gray-500 mt-1">
                      {interest.message}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    interest.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : interest.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {interest.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Available Dates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Team Interest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Tournaments</span>
          </div>
        </div>
      </div>

      {showInterestForm && (
        <InterestSubmissionForm
          clubId={clubId}
          clubName={clubName}
          onClose={() => setShowInterestForm(false)}
          onSubmit={() => {
            setShowInterestForm(false);
            fetchCalendarData();
          }}
        />
      )}

      <SignInPromptModal
        isOpen={signInPrompt.showSignInPrompt}
        onClose={signInPrompt.closeSignInPrompt}
        clubName={clubName}
        action={signInPrompt.action}
        onSignUp={signInPrompt.handleSignUp}
        onSignIn={signInPrompt.handleSignIn}
      />
    </div>
  );
}
