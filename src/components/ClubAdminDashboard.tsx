"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import NextImage from "next/image";
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
  Info,
  Image,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Package,
  Ticket,
  ArrowRight,
  Inbox,
  Eye,
} from "lucide-react";

interface ClubStats {
  club: {
    id: string;
    name: string;
    location: string | null;
    crest: string | null;
    memberCount: number;
    eventCount: number;
  };
  overview: {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    pendingEvents: number;
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
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
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
  applications: Array<{
    id: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    hostClubId: string | null;
    hostClubName: string | null;
    status: string;
    submittedAt: string;
    message: string | null;
  }>;
}

type DashboardSection =
  | "overview"
  | "calendar"
  | "events"
  | "applications"
  | "testimonials"
  | "friends"
  | "photos"
  | "pitches";

interface ClubAdminDashboardProps {
  clubId: string;
  isMainlandEurope: boolean;
}

export default function ClubAdminDashboard({
  clubId,
  isMainlandEurope,
}: ClubAdminDashboardProps) {
  // Irish clubs (isMainlandEurope = false) focus on travelling to tournaments
  // European clubs (isMainlandEurope = true) focus on hosting tournaments
  const isIrishClub = !isMainlandEurope;
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [showRevenueInfo, setShowRevenueInfo] = useState(false);

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

  const fetchUnreadInquiries = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/clubs/${clubId}/inquiries?filter=active`
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadInquiries(data.stats?.unread || 0);
      }
    } catch {
      // Silently fail - not critical
    }
  }, [clubId]);

  useEffect(() => {
    fetchStats();
    fetchUnreadInquiries();
  }, [fetchStats, fetchUnreadInquiries]);

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

  const allTabs: {
    id: DashboardSection;
    label: string;
    icon: React.ReactNode;
    europeanOnly?: boolean;
    irishOnly?: boolean;
    irishLabel?: string;
  }[] = [
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
      irishLabel: "Trips",
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: "applications",
      label: "Applications",
      icon: <Send className="w-4 h-4" />,
      irishOnly: true,
    },
    {
      id: "testimonials",
      label: "Testimonials",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    { id: "friends", label: "Friends", icon: <Users className="w-4 h-4" /> },
    { id: "photos", label: "Photos", icon: <Image className="w-4 h-4" /> },
    {
      id: "pitches",
      label: "Pitches",
      icon: <MapPin className="w-4 h-4" />,
      europeanOnly: true,
    },
  ];

  // Filter tabs based on club type
  const tabs = allTabs.filter((tab) => {
    if (tab.europeanOnly && isIrishClub) return false;
    if (tab.irishOnly && !isIrishClub) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Club Crest */}
              <div className="flex-shrink-0">
                <NextImage
                  src={
                    stats.club.crest ||
                    "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                  }
                  alt={stats.club.name}
                  width={64}
                  height={64}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain bg-white p-1.5 shadow-sm border border-gray-200"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {stats.club.name}
                </h1>
                <p className="text-gray-500 mt-1">{stats.club.location}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/club-admin/${clubId}/inquiries`}
                className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
              >
                <Inbox className="w-4 h-4" />
                Inbox
                {unreadInquiries > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadInquiries > 9 ? "9+" : unreadInquiries}
                  </span>
                )}
              </Link>
              <Link
                href={`/clubs/${clubId}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Page
              </Link>
              <Link
                href={`/clubs/${clubId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Club
              </Link>
              {!isIrishClub && <CreateEventButton />}
              {isIrishClub && (
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <CalendarDays className="w-4 h-4" />
                  Find Tournaments
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row - Irish Clubs Only */}
      {isIrishClub && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Upcoming Trips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary/30 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Upcoming Trips
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.overview.upcomingEvents}
                </p>
                <p className="text-xs text-gray-400 mt-1">Scheduled</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Trips Taken */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary/30 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Trips Taken</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.overview.pastEvents}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tournaments attended
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Tournaments Attended */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary/30 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Tournaments Attended
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.overview.totalEvents}
                </p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Applications */}
          <button
            type="button"
            onClick={() => setActiveSection("applications")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Applications
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.applications?.length || 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tournaments applied
                </p>
              </div>
              <div className="bg-amber-100 rounded-full p-3">
                <Send className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Pending Events Alert */}
      {stats.overview.pendingEvents > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">
                {stats.overview.pendingEvents} Event
                {stats.overview.pendingEvents !== 1 ? "s" : ""} Pending Approval
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Your event{stats.overview.pendingEvents !== 1 ? "s are" : " is"}{" "}
                awaiting review by an administrator. Once approved,{" "}
                {stats.overview.pendingEvents !== 1 ? "they" : "it"} will be
                visible on the public events page.
              </p>
              <div className="mt-3 space-y-2">
                {stats.events
                  .filter((e) => e.approvalStatus === "PENDING")
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-amber-900">
                        {event.title}
                      </span>
                      <span className="text-amber-600">
                        ({new Date(event.startDate).toLocaleDateString()})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Events Alert */}
      {stats.events.some((e) => e.approvalStatus === "REJECTED") && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                Event
                {stats.events.filter((e) => e.approvalStatus === "REJECTED")
                  .length !== 1
                  ? "s"
                  : ""}{" "}
                Rejected
              </h3>
              <p className="text-sm text-red-700 mt-1">
                The following event
                {stats.events.filter((e) => e.approvalStatus === "REJECTED")
                  .length !== 1
                  ? "s were"
                  : " was"}{" "}
                rejected by an administrator.
              </p>
              <div className="mt-3 space-y-2">
                {stats.events
                  .filter((e) => e.approvalStatus === "REJECTED")
                  .map((event) => (
                    <div key={event.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-900">
                          {event.title}
                        </span>
                      </div>
                      {event.rejectionReason && (
                        <p className="ml-6 text-red-600 text-xs mt-1">
                          Reason: {event.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50/80 border-b border-gray-200">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  activeSection === tab.id
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                {tab.icon}
                {isIrishClub && tab.irishLabel ? tab.irishLabel : tab.label}
              </button>
            ))}
            {/* European clubs only links */}
            {!isIrishClub && (
              <div className="flex items-center ml-auto border-l border-gray-200">
                <Link
                  href="/products"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-primary hover:text-primary-dark hover:bg-white/50 transition-all"
                >
                  <Package className="w-4 h-4" />
                  Products
                </Link>
                <Link
                  href="/host-terms"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-amber-600 hover:text-amber-700 hover:bg-white/50 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Host Terms
                </Link>
              </div>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {isIrishClub ? (
                /* Irish Club Overview - Trip Discovery Focus */
                <div className="space-y-6">
                  {/* Quick Actions for Irish Clubs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/events"
                      className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="bg-primary/10 rounded-full p-3 group-hover:bg-primary/20 transition-colors">
                        <CalendarDays className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Browse Tournaments
                        </h3>
                        <p className="text-sm text-gray-500">
                          Find tournaments to attend across Europe
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/clubs"
                      className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="bg-primary/10 rounded-full p-3 group-hover:bg-primary/20 transition-colors">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Explore Clubs
                        </h3>
                        <p className="text-sm text-gray-500">
                          Discover GAA clubs hosting events abroad
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Trip History Summary */}
                  {stats.events.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Trip History
                      </h3>
                      <div className="space-y-3">
                        {stats.events.slice(0, 3).map((event) => {
                          const isPast = new Date(event.startDate) < new Date();
                          return (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {event.location} •{" "}
                                  {new Date(
                                    event.startDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    isPast
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {isPast ? "Completed" : "Upcoming"}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-semibold text-white bg-amber-500 rounded-full">
                                  Demo Date
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {stats.events.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setActiveSection("events")}
                          className="text-sm text-primary hover:text-primary-dark font-medium mt-3"
                        >
                          View all {stats.events.length} trips →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-primary/5 to-blue-50 rounded-xl border border-primary/10">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No trips yet
                      </h3>
                      <p className="text-gray-600 mb-5 max-w-sm mx-auto">
                        Start exploring tournaments to plan your first trip
                        abroad.
                      </p>
                      <Link
                        href="/events"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                      >
                        <CalendarDays className="w-4 h-4" />
                        Browse Tournaments
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* European Club Nerve Center */
                <div className="space-y-6">
                  {/* Hero Stats - The Numbers That Matter */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Interests */}
                    <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-xl p-5 border border-primary/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Teams Interested
                          </p>
                          <p className="text-4xl font-bold text-primary mt-1">
                            {stats.overview.totalInterests}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Irish clubs wanting to visit
                          </p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-2">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Potential Revenue */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200 relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-emerald-700">
                              Potential Revenue
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setShowRevenueInfo(!showRevenueInfo)
                              }
                              className="text-emerald-500 hover:text-emerald-700 transition-colors"
                              aria-label="How is this calculated?"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-4xl font-bold text-emerald-600 mt-1">
                            €
                            {(
                              stats.overview.totalInterests *
                              15 *
                              45
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            From Day-Pass sales
                          </p>
                        </div>
                        <div className="bg-emerald-100 rounded-lg p-2">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                      {showRevenueInfo && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-10">
                          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-1">
                              How is this calculated?
                            </p>
                            <p className="text-gray-300 text-xs leading-relaxed">
                              {stats.overview.totalInterests} interest
                              {stats.overview.totalInterests !== 1 ? "s" : ""} ×
                              15 players × €45 Day-Pass = €
                              {(
                                stats.overview.totalInterests *
                                15 *
                                45
                              ).toLocaleString()}
                            </p>
                            <div className="absolute -top-2 left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Earnings */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stats.overview.currentYear} Earnings
                          </p>
                          <p className="text-4xl font-bold text-gray-900 mt-1">
                            €{stats.overview.yearEarnings.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Confirmed revenue
                          </p>
                        </div>
                        <div className="bg-gray-200 rounded-lg p-2">
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Day-Pass Foundation - Compact but Clear */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Ticket className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Day-Pass
                          </h3>
                          <p className="text-sm text-gray-500">
                            Your per-player hospitality fee for visiting teams
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/club-admin/${clubId}/day-pass`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                      >
                        Configure
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Recent Interests */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          Recent Interests
                        </h3>
                        {stats.recentInterests.length > 0 && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <Link
                        href={`/club-admin/${clubId}/inquiries`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        <Inbox className="w-4 h-4" />
                        Inbox
                        {unreadInquiries > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadInquiries}
                          </span>
                        )}
                      </Link>
                    </div>
                    <div className="p-4">
                      {stats.recentInterests.length > 0 ? (
                        <div className="space-y-2">
                          {stats.recentInterests.slice(0, 4).map((interest) => {
                            const daysAgo = Math.floor(
                              (Date.now() -
                                new Date(interest.submittedAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            return (
                              <div
                                key={interest.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                                    {interest.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {interest.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {interest.eventTitle}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <a
                                    href={`mailto:${interest.email}`}
                                    className="text-xs text-primary hover:underline"
                                  >
                                    {interest.email}
                                  </a>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {daysAgo === 0
                                      ? "Today"
                                      : daysAgo === 1
                                        ? "Yesterday"
                                        : `${daysAgo}d ago`}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            No interests yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Teams visiting your events will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Links Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link
                      href={`/clubs/${clubId}/edit`}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-gray-50 transition-all"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Edit Profile
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveSection("events")}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-gray-50 transition-all text-left"
                    >
                      <CalendarDays className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Events ({stats.overview.totalEvents})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("photos")}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-gray-50 transition-all text-left"
                    >
                      <Image className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Photos
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("pitches")}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-gray-50 transition-all text-left"
                    >
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Pitches
                      </span>
                    </button>
                  </div>
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
                <div className="text-center py-12 bg-gradient-to-br from-primary/5 to-blue-50 rounded-xl border border-primary/10">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isIrishClub ? "No trips yet" : "No events yet"}
                  </h3>
                  <p className="text-gray-600 mb-5 max-w-sm mx-auto">
                    {isIrishClub
                      ? "Register for tournaments to track your upcoming trips."
                      : "Create your first event to start receiving interest from teams."}
                  </p>
                  {isIrishClub ? (
                    <Link
                      href="/events"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Browse Tournaments
                    </Link>
                  ) : (
                    <CreateEventButton />
                  )}
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

          {/* Applications Tab - Irish Clubs Only */}
          {activeSection === "applications" && (
            <div className="space-y-4">
              {stats.applications && stats.applications.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Your Tournament Applications
                    </h3>
                    <span className="text-sm text-gray-500">
                      {stats.applications.length} application
                      {stats.applications.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {stats.applications.map((app) => {
                      const isPast = new Date(app.eventDate) < new Date();
                      const statusConfig = {
                        PENDING: {
                          icon: Clock,
                          color: "text-amber-600",
                          bg: "bg-amber-100",
                          label: "Pending",
                        },
                        ACCEPTED: {
                          icon: CheckCircle,
                          color: "text-green-600",
                          bg: "bg-green-100",
                          label: "Accepted",
                        },
                        WAITLISTED: {
                          icon: AlertCircle,
                          color: "text-blue-600",
                          bg: "bg-blue-100",
                          label: "Waitlisted",
                        },
                        REJECTED: {
                          icon: XCircle,
                          color: "text-red-600",
                          bg: "bg-red-100",
                          label: "Rejected",
                        },
                        WITHDRAWN: {
                          icon: XCircle,
                          color: "text-gray-600",
                          bg: "bg-gray-100",
                          label: "Withdrawn",
                        },
                      }[app.status] || {
                        icon: Clock,
                        color: "text-gray-600",
                        bg: "bg-gray-100",
                        label: app.status,
                      };
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={app.id}
                          className={`p-4 bg-white rounded-lg border ${isPast ? "border-gray-200 opacity-75" : "border-gray-200"}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/events/${app.eventId}`}
                                  className="font-medium text-gray-900 hover:text-primary truncate"
                                >
                                  {app.eventTitle}
                                </Link>
                                {isPast && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    Past
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {app.eventLocation} •{" "}
                                {new Date(app.eventDate).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                              {app.hostClubName && (
                                <p className="text-sm text-gray-500">
                                  Hosted by{" "}
                                  <Link
                                    href={`/clubs/${app.hostClubId}`}
                                    className="text-primary hover:underline"
                                  >
                                    {app.hostClubName}
                                  </Link>
                                </p>
                              )}
                              {app.message && (
                                <p className="text-sm text-gray-600 mt-2 italic">
                                  &ldquo;{app.message}&rdquo;
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                              </span>
                              <span className="text-xs text-gray-400">
                                Applied{" "}
                                {new Date(app.submittedAt).toLocaleDateString(
                                  "en-GB",
                                  { day: "numeric", month: "short" }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-600 mb-5 max-w-sm mx-auto">
                    When you register interest in tournaments, your applications
                    will appear here.
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Browse Tournaments
                  </Link>
                </div>
              )}
            </div>
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
