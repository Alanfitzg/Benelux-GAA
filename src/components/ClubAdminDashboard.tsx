"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import PitchManagement from "@/components/pitch/PitchManagement";
import CreateEventButton from "@/components/CreateEventButton";
import TestimonialsDashboardWidget from "@/components/testimonials/TestimonialsDashboardWidget";
import ClubCalendarManagement from "@/components/admin/ClubCalendarManagement";
import ClubFriendsManagement from "@/components/club/ClubFriendsManagement";
import ClubPhotoGallery from "@/components/club/ClubPhotoGallery";
import {
  Calendar,
  BarChart3,
  MessageSquare,
  MapPin,
  ExternalLink,
  Edit,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  CalendarDays,
  Euro,
  Info,
  Image,
} from "lucide-react";

interface ClubStats {
  club: {
    id: string;
    name: string;
    location: string | null;
    memberCount: number;
    eventCount: number;
  };
  overview: {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    totalInterests: number;
    averageInterestsPerEvent: string;
    yearEarnings: number;
    currentYear: number;
  };
  events: Array<{
    id: string;
    title: string;
    eventType: string;
    startDate: string;
    location: string;
    interestCount: number;
    interests: Array<{
      name: string;
      email: string;
      submittedAt: string;
      message: string | null;
    }>;
  }>;
  recentInterests: Array<{
    id: string;
    name: string;
    email: string;
    eventTitle: string;
    submittedAt: string;
    message: string | null;
  }>;
}

type DashboardSection =
  | "overview"
  | "calendar"
  | "events"
  | "testimonials"
  | "friends"
  | "photos"
  | "pitches";

export default function ClubAdminDashboard({ clubId }: { clubId: string }) {
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [showInterestsInfo, setShowInterestsInfo] = useState(false);
  const interestsInfoRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        interestsInfoRef.current &&
        !interestsInfoRef.current.contains(event.target as Node)
      ) {
        setShowInterestsInfo(false);
      }
    };

    if (showInterestsInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInterestsInfo]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/stats`);
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading statistics: {error}</p>
      </div>
    );
  }

  const tabs: { id: DashboardSection; label: string; icon: React.ReactNode }[] =
    [
      {
        id: "overview",
        label: "Overview",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        id: "calendar",
        label: "Calendar",
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        id: "events",
        label: "Events",
        icon: <CalendarDays className="w-4 h-4" />,
      },
      {
        id: "testimonials",
        label: "Testimonials",
        icon: <MessageSquare className="w-4 h-4" />,
      },
      { id: "friends", label: "Friends", icon: <Users className="w-4 h-4" /> },
      { id: "photos", label: "Photos", icon: <Image className="w-4 h-4" /> },
      { id: "pitches", label: "Pitches", icon: <MapPin className="w-4 h-4" /> },
    ];

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {stats.club.name}
            </h1>
            <p className="text-gray-500 mt-1">{stats.club.location}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/clubs/${clubId}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Page
            </Link>
            <Link
              href={`/clubs/${clubId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Club
            </Link>
            <CreateEventButton />
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upcoming Events - Hero Stat */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Upcoming Events
              </p>
              <p className="text-4xl font-bold mt-1">
                {stats.overview.upcomingEvents}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Interests */}
        <div
          ref={interestsInfoRef}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-gray-500 text-sm font-medium">
                  Total Interests
                </p>
                <button
                  type="button"
                  onClick={() => setShowInterestsInfo(!showInterestsInfo)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="What are interests?"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.overview.totalInterests}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Avg {stats.overview.averageInterestsPerEvent} per event
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          {/* Info Tooltip */}
          {showInterestsInfo && (
            <div className="absolute top-full left-0 right-0 mt-2 z-10">
              <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
                <p className="font-medium mb-1">What are Interests?</p>
                <p className="text-gray-300 text-xs leading-relaxed">
                  When teams browse your events and want to participate, they
                  submit an &ldquo;interest&rdquo; to let you know. You can then
                  contact them to confirm their registration.
                </p>
                <div className="absolute -top-2 left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          )}
        </div>

        {/* Year Earnings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                {stats.overview.currentYear} Earnings
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                €
                {stats.overview.yearEarnings.toLocaleString("en-IE", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-gray-400 mt-1">From registrations</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Euro className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.overview.totalEvents}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.overview.pastEvents} completed
              </p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeSection === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Recent Interests */}
              {stats.recentInterests.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Interests (Last 30 Days)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.recentInterests.slice(0, 5).map((interest) => (
                          <tr key={interest.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {interest.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {interest.email}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {interest.eventTitle}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                interest.submittedAt
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {stats.recentInterests.length > 5 && (
                    <p className="text-sm text-gray-500 mt-3">
                      + {stats.recentInterests.length - 5} more interests
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No recent interests
                  </h3>
                  <p className="text-gray-500">
                    Interest submissions from the last 30 days will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calendar Tab */}
          {activeSection === "calendar" && (
            <ClubCalendarManagement
              clubId={clubId}
              clubName={stats.club.name}
            />
          )}

          {/* Events Tab */}
          {activeSection === "events" && (
            <div className="space-y-4">
              {stats.events.length > 0 ? (
                stats.events.map((event) => {
                  const isUpcoming = new Date(event.startDate) > new Date();
                  return (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          setExpandedEvent(
                            expandedEvent === event.id ? null : event.id
                          )
                        }
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {event.title}
                              </h3>
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                  isUpcoming
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isUpcoming ? "Upcoming" : "Past"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {event.eventType} • {event.location} •{" "}
                              {new Date(event.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">
                                {event.interestCount}
                              </p>
                              <p className="text-xs text-gray-500">interests</p>
                            </div>
                            {expandedEvent === event.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Interest Details */}
                      {expandedEvent === event.id &&
                        event.interests.length > 0 && (
                          <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              People who expressed interest:
                            </h4>
                            <div className="space-y-2">
                              {event.interests.map((interest, index) => (
                                <div
                                  key={index}
                                  className="bg-white p-3 rounded-lg border border-gray-200"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {interest.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {interest.email}
                                      </p>
                                      {interest.message && (
                                        <p className="text-sm text-gray-500 mt-1 italic">
                                          &ldquo;{interest.message}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      {new Date(
                                        interest.submittedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No events yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first event to start receiving interest from
                    teams.
                  </p>
                  <CreateEventButton />
                </div>
              )}
            </div>
          )}

          {/* Testimonials Tab */}
          {activeSection === "testimonials" && (
            <TestimonialsDashboardWidget clubId={clubId} />
          )}

          {/* Friends Tab */}
          {activeSection === "friends" && (
            <ClubFriendsManagement clubId={clubId} clubName={stats.club.name} />
          )}

          {/* Photos Tab */}
          {activeSection === "photos" && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Add up to 3 photos to showcase your club. These will be
                displayed on your public club page.
              </p>
              <ClubPhotoGallery clubId={clubId} isAdmin={true} />
            </div>
          )}

          {/* Pitches Tab */}
          {activeSection === "pitches" && (
            <PitchManagement clubId={clubId} canEdit={true} />
          )}
        </div>
      </div>
    </div>
  );
}
