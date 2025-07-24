"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, MapPin, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import InterestSubmissionForm from "./InterestSubmissionForm";
import { useSignInPrompt } from "@/hooks/useSignInPrompt";
import SignInPromptModal from "@/components/auth/SignInPromptModal";

interface CompactCalendarWidgetProps {
  clubId: string;
  clubName: string;
  userId?: string;
}

interface AvailabilitySlot {
  id: string;
  date: string;
  isAvailable: boolean;
}

interface TournamentInterest {
  id: string;
  interestType: string;
  specificDate?: string;
  monthYear?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  teamSize: number;
  user: {
    name: string;
  };
}

interface Event {
  id: string;
  title: string;
  startDate: string;
}

export default function CompactCalendarWidget({
  clubId,
  clubName,
  userId,
}: CompactCalendarWidgetProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [interests, setInterests] = useState<TournamentInterest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const {
    promptSignIn,
    showSignInPrompt,
    handleSignUp,
    handleSignIn,
    closeSignInPrompt,
  } = useSignInPrompt();

  useEffect(() => {
    fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const fetchCalendarData = async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/calendar`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability || []);
        setInterests(data.interests || []);
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = () => {
    if (!userId) {
      promptSignIn(() => setShowInterestForm(true));
    } else {
      setShowInterestForm(true);
    }
  };

  const handleInterestSubmitted = () => {
    setShowInterestForm(false);
    fetchCalendarData();
  };

  const getUpcomingOpportunities = () => {
    const today = new Date();

    // Group by month
    const monthData = new Map<
      string,
      { available: number; interests: number; hasEvent: boolean }
    >();

    // Process availability
    availability.forEach((slot) => {
      if (slot.isAvailable) {
        const month = format(parseISO(slot.date), "yyyy-MM");
        const data = monthData.get(month) || {
          available: 0,
          interests: 0,
          hasEvent: false,
        };
        data.available++;
        monthData.set(month, data);
      }
    });

    // Process interests
    interests.forEach((interest) => {
      if (interest.monthYear) {
        const month = format(parseISO(interest.monthYear), "yyyy-MM");
        const data = monthData.get(month) || {
          available: 0,
          interests: 0,
          hasEvent: false,
        };
        data.interests++;
        monthData.set(month, data);
      } else if (interest.specificDate) {
        const month = format(parseISO(interest.specificDate), "yyyy-MM");
        const data = monthData.get(month) || {
          available: 0,
          interests: 0,
          hasEvent: false,
        };
        data.interests++;
        monthData.set(month, data);
      }
    });

    // Process events
    events.forEach((event) => {
      const month = format(parseISO(event.startDate), "yyyy-MM");
      const data = monthData.get(month) || {
        available: 0,
        interests: 0,
        hasEvent: false,
      };
      data.hasEvent = true;
      monthData.set(month, data);
    });

    // Convert to array and sort
    return Array.from(monthData.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        date: new Date(month + "-01"),
      }))
      .filter((item) => item.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3); // Show next 3 months with activity
  };

  const upcomingOpportunities = getUpcomingOpportunities();
  const totalInterests = interests.length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-400" />
              Club Calendar
            </h3>
            {totalInterests > 0 && (
              <span className="text-sm text-gray-500">
                {totalInterests} team{totalInterests !== 1 ? "s" : ""}{" "}
                interested
              </span>
            )}
          </div>

          {upcomingOpportunities.length > 0 ? (
            <div className="space-y-3 mb-4">
              {upcomingOpportunities.map((opp) => (
                <div
                  key={opp.month}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {format(opp.date, "MMMM yyyy")}
                      </div>
                      <div className="text-gray-500 mt-0.5">
                        {opp.hasEvent && (
                          <span className="text-blue-600">
                            Tournament scheduled
                          </span>
                        )}
                        {!opp.hasEvent && opp.available > 0 && (
                          <span>
                            {opp.available} date{opp.available !== 1 ? "s" : ""}{" "}
                            available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {opp.interests > 0 && !opp.hasEvent && (
                    <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      {opp.interests}
                    </div>
                  )}
                </div>
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

          <div className="flex gap-3">
            <button
              onClick={handleExpressInterest}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Express Interest
            </button>
            <button
              onClick={() => {
                const calendarSection =
                  document.querySelector("#full-calendar");
                if (calendarSection) {
                  calendarSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
            >
              Full Calendar
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {showInterestForm && (
        <InterestSubmissionForm
          clubId={clubId}
          clubName={clubName}
          onClose={() => setShowInterestForm(false)}
          onSubmit={handleInterestSubmitted}
        />
      )}

      {showSignInPrompt && (
        <SignInPromptModal
          isOpen={showSignInPrompt}
          onClose={closeSignInPrompt}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          clubName={clubName}
          action="express interest"
        />
      )}
    </>
  );
}
