"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarIcon,
  Users,
  Globe,
  CheckCircle,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

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
    <div className="bg-white rounded-xl shadow-lg border border-primary/20 overflow-hidden">
      {/* Premium Blue Header */}
      <div className="bg-gradient-to-r from-primary to-[#1a3352] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            Club Calendar
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Calendar information"
              >
                <Info className="w-4 h-4 text-white/70 hover:text-white" />
              </button>
              {showInfoTooltip && (
                <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-white text-gray-800 text-sm rounded-lg shadow-xl z-50 border border-gray-200">
                  <p className="leading-relaxed">
                    In the club calendar, you can see all competitive fixtures
                    locked in for the year ahead. You can also register interest
                    for a vacant date to let the hosts know you&apos;d like to
                    visit.
                  </p>
                  <div className="absolute -top-2 left-3 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
                </div>
              )}
            </div>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView(view === "month" ? "list" : "month")}
              className="px-4 py-2 text-sm font-medium bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors"
            >
              {view === "month" ? "List View" : "Month View"}
            </button>
            <button
              type="button"
              onClick={handleExpressInterest}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Express Interest
            </button>
          </div>
        </div>

        {/* Info Banner - styled for blue header */}
        {showInfoBanner && (
          <div className="mb-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg relative">
            <button
              type="button"
              onClick={() => setShowInfoBanner(false)}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss info"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <Info className="w-5 h-5 text-white/90 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/90 leading-relaxed">
                In the club calendar, you can see all competitive fixtures
                locked in for the year ahead. You can also register interest for
                a vacant date to let the hosts know you&apos;d like to visit.
              </p>
            </div>
          </div>
        )}

        {/* Month Interests Banner */}
        {monthInterests.length > 0 && (
          <div className="mb-4 p-3 bg-amber-400/20 border border-amber-400/40 rounded-lg">
            <p className="text-sm text-white">
              <strong className="text-amber-300">
                {monthInterests.length} team
                {monthInterests.length > 1 ? "s" : ""}
              </strong>{" "}
              interested in visiting during {format(currentDate, "MMMM yyyy")}
            </p>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
              )
            }
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="px-6 py-2 bg-white/20 rounded-full">
            <h3 className="text-lg font-semibold text-white">
              {format(currentDate, "MMMM yyyy")}
            </h3>
          </div>
          <button
            type="button"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
              )
            }
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center gap-3 text-primary">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Loading calendar...</span>
          </div>
        </div>
      ) : view === "month" ? (
        <div className="p-6 bg-gradient-to-b from-primary/5 to-white">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-primary py-2 bg-primary/10 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
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
                  className={`h-24 p-2 border-2 rounded-xl transition-all ${
                    hasContent
                      ? "border-primary/30 bg-white shadow-sm"
                      : "border-gray-200 bg-white/80"
                  } hover:border-primary hover:shadow-md cursor-pointer`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${hasContent ? "text-primary" : "text-gray-700"}`}
                  >
                    {format(date, "d")}
                  </div>
                  <div className="space-y-1">
                    {availability && (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span className="font-medium">Available</span>
                      </div>
                    )}
                    {dayInterests.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full w-fit">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">
                          {dayInterests.length} interested
                        </span>
                      </div>
                    )}
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="truncate font-medium">
                          {event.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4 bg-gradient-to-b from-primary/5 to-white">
          {interests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-primary/30 mx-auto mb-3" />
              <p className="text-gray-500">
                No interests registered yet for this month
              </p>
            </div>
          ) : (
            interests.map((interest) => (
              <div
                key={interest.id}
                className="p-4 bg-white border-2 border-primary/20 rounded-xl hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {interest.user.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                        <Users className="w-3 h-3" />
                        {interest.teamSize} players
                      </span>
                      <span className="text-gray-500">
                        Flexibility: {interest.flexibility}
                      </span>
                    </p>
                    {interest.interestType === "SPECIFIC_DATE" &&
                      interest.specificDate && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Date:</span>{" "}
                          {format(new Date(interest.specificDate), "PPP")}
                        </p>
                      )}
                    {interest.interestType === "ENTIRE_MONTH" && (
                      <p className="text-sm text-gray-600 mt-1">
                        Interested in any time during the month
                      </p>
                    )}
                    {interest.message && (
                      <p className="text-sm text-gray-500 mt-2 italic bg-gray-50 p-2 rounded-lg">
                        &ldquo;{interest.message}&rdquo;
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      interest.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : interest.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {interest.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Legend Footer */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-t border-primary/20">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm" />
            <span className="text-gray-700 font-medium">Available Dates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm" />
            <span className="text-gray-700 font-medium">Team Interest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full shadow-sm" />
            <span className="text-gray-700 font-medium">Tournaments</span>
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
