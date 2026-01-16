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
  HelpCircle,
  X,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";

interface ClubStats {
  club: {
    id: string;
    name: string;
    location: string | null;
    crest: string | null;
    memberCount: number;
    eventCount: number;
    dayPassPrice: number | null;
    verificationStatus:
      | "UNVERIFIED"
      | "PENDING_VERIFICATION"
      | "VERIFIED"
      | "EXPIRED"
      | "DISPUTED";
    verificationExpiry: string | null;
    bio: string | null;
    twitter: string | null;
    tiktok: string | null;
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
    // Hero stats for European host clubs
    teamsWelcomed: number;
    playersHosted: number;
    eventsHosted: number;
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
    appealStatus?: "PENDING" | "APPROVED" | "DENIED" | null;
    dismissedAt?: string | null;
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
  const [appealModal, setAppealModal] = useState<{
    eventId: string;
    eventTitle: string;
  } | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [showDifferenceModal, setShowDifferenceModal] = useState(false);

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

  const handleAppealSubmit = async () => {
    if (!appealModal || !appealReason.trim()) return;

    setAppealSubmitting(true);
    try {
      const response = await fetch(
        `/api/events/${appealModal.eventId}/appeal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appealReason: appealReason.trim() }),
        }
      );

      if (response.ok) {
        setAppealModal(null);
        setAppealReason("");
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit appeal");
      }
    } catch {
      alert("An error occurred submitting the appeal");
    } finally {
      setAppealSubmitting(false);
    }
  };

  const handleDismissRejection = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/dismiss`, {
        method: "POST",
      });

      if (response.ok) {
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to dismiss rejection");
      }
    } catch {
      alert("An error occurred dismissing the rejection");
    }
  };

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
    {
      id: "friends",
      label: "Partner Clubs",
      irishLabel: "Friends",
      icon: <Users className="w-4 h-4" />,
    },
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
    <div className="space-y-3 md:space-y-6">
      {/* Hero Header Section - Dark Theme - Hidden on mobile to save space */}
      <div className="relative p-4 md:p-8 mb-2 md:mb-6 hidden md:block">
        {/* Header with icon and hero stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl md:text-2xl">🏠</span>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white">
                Command Center
              </h1>
              <p className="text-xs md:text-sm text-white/60">
                {isIrishClub ? "Travelling Club" : "Your club management hub"}
              </p>
            </div>
          </div>

          {/* Hero Stats - European clubs only */}
          {!isIrishClub && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {stats.overview.teamsWelcomed}
                </p>
                <p className="text-xs text-white/60">Teams Welcomed</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {stats.overview.playersHosted.toLocaleString()}
                </p>
                <p className="text-xs text-white/60">Players Hosted</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {stats.overview.eventsHosted}
                </p>
                <p className="text-xs text-white/60">Events Hosted</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header with Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-gray-100 px-3 md:px-6 py-3 md:py-5">
          <div className="flex items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
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
                  className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl object-contain bg-white p-1 md:p-1.5 shadow-sm border border-gray-200"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-2xl font-bold text-gray-900 truncate">
                  {stats.club.name}
                </h1>
                <p className="text-xs md:text-base text-gray-500 truncate">
                  {stats.club.location}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href={`/club-admin/${clubId}/inquiries`}
                className="relative inline-flex items-center justify-center gap-2 p-2 md:px-4 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
                title="Inbox"
              >
                <Inbox className="w-4 h-4" />
                <span className="hidden md:inline">Inbox</span>
                {unreadInquiries > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadInquiries > 9 ? "9+" : unreadInquiries}
                  </span>
                )}
              </Link>
              <Link
                href={`/clubs/${clubId}`}
                className="inline-flex items-center justify-center gap-2 p-2 md:px-4 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
                title="View Public Page"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden md:inline">View Public Page</span>
              </Link>
              <Link
                href={`/clubs/${clubId}/edit`}
                className="inline-flex items-center justify-center gap-2 p-2 md:px-4 md:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
                title="Edit Club"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden md:inline">Edit Club</span>
              </Link>
              {isIrishClub && (
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 p-2 md:px-4 md:py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                  title="Find Tournaments"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden md:inline">Find Tournaments</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Host Club Actions - European Clubs Only */}
      {!isIrishClub && (
        <div className="bg-gradient-to-r from-emerald-50 via-white to-red-50 rounded-xl border border-gray-200 p-3 md:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                  Get Started as a Host Club
                </h3>
                <p className="text-xs md:text-sm text-gray-500 hidden md:block">
                  Set your pricing or create tournaments to attract visiting
                  teams
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href={`/club-admin/${clubId}/day-pass`}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                {stats.club.dayPassPrice ? (
                  <>
                    <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">VIEW </span>DAY-PASS
                  </>
                ) : (
                  <>
                    <Ticket className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">SET </span>DAY-PASS
                  </>
                )}
              </Link>
              <Link
                href="/events/create"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">CREATE </span>EVENT
              </Link>
              <button
                type="button"
                onClick={() => setShowDifferenceModal(true)}
                className="p-2 md:px-3 md:py-2 text-gray-600 hover:text-primary border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
                title="What's the difference?"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden md:inline ml-1.5 text-sm font-medium">
                  What&apos;s the difference?
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

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
      {stats.events.some(
        (e) => e.approvalStatus === "REJECTED" && !e.dismissedAt
      ) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                Event
                {stats.events.filter(
                  (e) => e.approvalStatus === "REJECTED" && !e.dismissedAt
                ).length !== 1
                  ? "s"
                  : ""}{" "}
                Rejected
              </h3>
              <p className="text-sm text-red-700 mt-1">
                The following event
                {stats.events.filter(
                  (e) => e.approvalStatus === "REJECTED" && !e.dismissedAt
                ).length !== 1
                  ? "s were"
                  : " was"}{" "}
                rejected by an administrator.
              </p>
              <div className="mt-3 space-y-3">
                {stats.events
                  .filter(
                    (e) => e.approvalStatus === "REJECTED" && !e.dismissedAt
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className="text-sm bg-white/50 rounded-lg p-3"
                    >
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
                      {event.appealStatus === "PENDING" ? (
                        <div className="ml-6 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Appeal Under Review
                          </span>
                        </div>
                      ) : event.appealStatus === "DENIED" ? (
                        <div className="ml-6 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Appeal Denied
                          </span>
                        </div>
                      ) : !event.appealStatus ? (
                        <div className="ml-6 mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setAppealModal({
                                eventId: event.id,
                                eventTitle: event.title,
                              })
                            }
                            className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Challenge Decision
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismissRejection(event.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Accept Decision
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {appealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Challenge Rejection Decision
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Event:{" "}
              <span className="font-medium">{appealModal.eventTitle}</span>
            </p>
            <div className="mb-4">
              <label
                htmlFor="appealReason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Why should this decision be reconsidered?
              </label>
              <textarea
                id="appealReason"
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                placeholder="Please explain why you believe this event should be approved..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                rows={4}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setAppealModal(null);
                  setAppealReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={appealSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAppealSubmit}
                disabled={!appealReason.trim() || appealSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {appealSubmitting ? "Submitting..." : "Submit Appeal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* What's the Difference Modal */}
      {showDifferenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Day-Pass vs Create Event
              </h3>
              <button
                type="button"
                onClick={() => setShowDifferenceModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Day-Pass */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900">Day-Pass</h4>
                    <p className="text-xs text-emerald-600">
                      For casual visits
                    </p>
                  </div>
                </div>
                <p className="text-sm text-emerald-800 mb-2">
                  Your <strong>standard per-player fee</strong> for teams
                  visiting outside of tournaments.
                </p>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Training sessions, friendly matches, facility use</li>
                  <li>• Teams can book any time that suits you</li>
                  <li>• One price covers pitch access and hospitality</li>
                  <li>• Your club appears on the map for travelling teams</li>
                </ul>
              </div>

              {/* Create Event */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      Create Event
                    </h4>
                    <p className="text-xs text-blue-600">For tournaments</p>
                  </div>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Organised tournaments</strong> with their own pricing,
                  dates, and team limits.
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tournaments, blitzes, or competitions</li>
                  <li>• Set your own event price (can differ from Day-Pass)</li>
                  <li>• Fixed dates with limited team slots</li>
                  <li>• Featured on the events calendar</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>In short:</strong> Day-Pass is for drop-in visitors.
                  Events are for organised tournaments with their own pricing.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/club-admin/${clubId}/day-pass`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                onClick={() => setShowDifferenceModal(false)}
              >
                {stats.club.dayPassPrice ? (
                  <>
                    <Eye className="w-4 h-4" />
                    View Day-Pass
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    Set Day-Pass
                  </>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setShowDifferenceModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50/80 border-b border-gray-200">
          <nav
            className="flex overflow-x-auto scrollbar-hide -mb-px"
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap transition-all flex-shrink-0 ${
                  activeSection === tab.id
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">
                  {isIrishClub && tab.irishLabel ? tab.irishLabel : tab.label}
                </span>
              </button>
            ))}
            {/* European clubs only links */}
            {!isIrishClub && (
              <>
                <Link
                  href="/products"
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-primary hover:text-primary-dark hover:bg-white/50 transition-all flex-shrink-0 ml-auto"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Products</span>
                </Link>
                <Link
                  href="/host-terms"
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-amber-600 hover:text-amber-700 hover:bg-white/50 transition-all flex-shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Host Terms</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-3 md:p-6">
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
                  {/* Verification Status Banner */}
                  {stats.club.verificationStatus !== "VERIFIED" && (
                    <div
                      className={`flex items-start gap-3 p-4 rounded-xl border ${
                        stats.club.verificationStatus === "UNVERIFIED"
                          ? "bg-amber-50 border-amber-200"
                          : stats.club.verificationStatus ===
                              "PENDING_VERIFICATION"
                            ? "bg-blue-50 border-blue-200"
                            : stats.club.verificationStatus === "EXPIRED"
                              ? "bg-orange-50 border-orange-200"
                              : "bg-red-50 border-red-200"
                      }`}
                    >
                      {stats.club.verificationStatus === "UNVERIFIED" && (
                        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      {stats.club.verificationStatus ===
                        "PENDING_VERIFICATION" && (
                        <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      {stats.club.verificationStatus === "EXPIRED" && (
                        <ShieldX className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      )}
                      {stats.club.verificationStatus === "DISPUTED" && (
                        <ShieldX className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4
                          className={`font-semibold text-sm ${
                            stats.club.verificationStatus === "UNVERIFIED"
                              ? "text-amber-800"
                              : stats.club.verificationStatus ===
                                  "PENDING_VERIFICATION"
                                ? "text-blue-800"
                                : stats.club.verificationStatus === "EXPIRED"
                                  ? "text-orange-800"
                                  : "text-red-800"
                          }`}
                        >
                          {stats.club.verificationStatus === "UNVERIFIED" &&
                            "Club Not Verified"}
                          {stats.club.verificationStatus ===
                            "PENDING_VERIFICATION" && "Verification Pending"}
                          {stats.club.verificationStatus === "EXPIRED" &&
                            "Verification Expired"}
                          {stats.club.verificationStatus === "DISPUTED" &&
                            "Verification Disputed"}
                        </h4>
                        <p
                          className={`text-xs mt-1 ${
                            stats.club.verificationStatus === "UNVERIFIED"
                              ? "text-amber-700"
                              : stats.club.verificationStatus ===
                                  "PENDING_VERIFICATION"
                                ? "text-blue-700"
                                : stats.club.verificationStatus === "EXPIRED"
                                  ? "text-orange-700"
                                  : "text-red-700"
                          }`}
                        >
                          {stats.club.verificationStatus === "UNVERIFIED" &&
                            "Verified clubs appear higher in search results and build more trust with travelling teams. Complete your club profile to begin verification."}
                          {stats.club.verificationStatus ===
                            "PENDING_VERIFICATION" &&
                            "Your verification request is being reviewed. This usually takes 1-2 business days."}
                          {stats.club.verificationStatus === "EXPIRED" &&
                            "Your verification has expired. Please update your club details to renew."}
                          {stats.club.verificationStatus === "DISPUTED" &&
                            "There's an issue with your club verification. Please contact support."}
                        </p>
                        {stats.club.verificationStatus === "UNVERIFIED" && (
                          <Link
                            href={`/clubs/${clubId}/edit`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 mt-2"
                          >
                            Complete your profile{" "}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verified Badge (show when verified) */}
                  {stats.club.verificationStatus === "VERIFIED" && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg w-fit">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">
                        Verified Host Club
                      </span>
                      {stats.club.verificationExpiry && (
                        <span className="text-xs text-emerald-600">
                          (until{" "}
                          {new Date(
                            stats.club.verificationExpiry
                          ).toLocaleDateString("en-IE", {
                            month: "short",
                            year: "numeric",
                          })}
                          )
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hero Stats - The Numbers That Matter */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Interests - Clickable to Demand Insights */}
                    <Link
                      href={`/club-admin/${clubId}/demand`}
                      className="block bg-gradient-to-br from-primary/5 to-blue-50 rounded-xl p-5 border border-primary/20 shadow-md hover:border-primary/40 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                            Teams Interested
                          </p>
                          <p className="text-4xl font-bold text-primary mt-1">
                            {stats.overview.totalInterests}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            View demand insights
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </Link>

                    {/* Potential Revenue - Clickable */}
                    <Link
                      href={`/club-admin/${clubId}/financials`}
                      className="block bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200 shadow-md relative hover:border-emerald-400 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-emerald-700">
                              Potential Revenue
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowRevenueInfo(!showRevenueInfo);
                              }}
                              className="text-emerald-500 hover:text-emerald-700 transition-colors"
                              aria-label="How is this calculated?"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {stats.overview.totalInterests > 0 ? (
                            <>
                              <p className="text-4xl font-bold text-emerald-600 mt-1">
                                €
                                {(
                                  stats.overview.totalInterests *
                                  15 *
                                  45
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                View financials
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-2xl font-bold text-emerald-600/60 mt-1">
                                —
                              </p>
                              <p className="text-xs text-emerald-600/70 mt-1">
                                Host events to see potential
                              </p>
                            </>
                          )}
                        </div>
                        <div className="bg-emerald-100 rounded-lg p-2 group-hover:bg-emerald-200 transition-colors">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                      {showRevenueInfo && stats.overview.totalInterests > 0 && (
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
                    </Link>

                    {/* Earnings - Clickable */}
                    <Link
                      href={`/club-admin/${clubId}/financials`}
                      className="block bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:border-gray-400 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stats.overview.currentYear} Earnings
                          </p>
                          <p className="text-4xl font-bold text-gray-900 mt-1">
                            €{stats.overview.yearEarnings.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            View financials
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </p>
                        </div>
                        <div className="bg-gray-200 rounded-lg p-2 group-hover:bg-gray-300 transition-colors">
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Day-Pass Foundation - Compact but Clear */}
                  <Link
                    href={`/club-admin/${clubId}/day-pass`}
                    className="block bg-white rounded-xl border border-gray-200 shadow-md p-4 hover:border-emerald-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
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
                      <div className="flex items-center gap-3">
                        {stats.club.dayPassPrice ? (
                          <span className="text-xl font-bold text-emerald-600">
                            €{stats.club.dayPassPrice}
                          </span>
                        ) : (
                          <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                            Not set
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>

                  {/* Recent Interests */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
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
                  <div
                    className={`grid grid-cols-2 gap-3 ${isMainlandEurope ? "md:grid-cols-5" : "md:grid-cols-4"}`}
                  >
                    <Link
                      href={`/clubs/${clubId}/edit`}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-primary/30 hover:bg-gray-50 hover:shadow-md transition-all"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Edit Profile
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveSection("events")}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-primary/30 hover:bg-gray-50 hover:shadow-md transition-all text-left"
                    >
                      <CalendarDays className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Events ({stats.overview.totalEvents})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("photos")}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-primary/30 hover:bg-gray-50 hover:shadow-md transition-all text-left"
                    >
                      <Image className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Photos
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("pitches")}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-primary/30 hover:bg-gray-50 hover:shadow-md transition-all text-left"
                    >
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Pitches
                      </span>
                    </button>
                    {isMainlandEurope && (
                      <Link
                        href={`/club-admin/${clubId}/financials`}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md transition-all"
                      >
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Financials
                        </span>
                      </Link>
                    )}
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
              {stats.events.filter((e) => e.approvalStatus !== "REJECTED")
                .length > 0 ? (
                stats.events
                  .filter((e) => e.approvalStatus !== "REJECTED")
                  .map((event) => {
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
                                <p className="text-xs text-gray-500">
                                  interests
                                </p>
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
