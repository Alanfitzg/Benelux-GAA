"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AdminDashboardClientProps {
  stats: {
    clubCount: number;
    countryCount: number;
    userCount: number;
    eventCount: number;
  };
}

interface ConflictStats {
  total: number;
}

interface AppealStats {
  total: number;
}

export default function AdminDashboardClient({
  stats,
}: AdminDashboardClientProps) {
  const [showMore, setShowMore] = useState(false);
  const [conflictStats, setConflictStats] = useState<ConflictStats | null>(
    null
  );
  const [appealStats, setAppealStats] = useState<AppealStats | null>(null);

  useEffect(() => {
    async function fetchConflictStats() {
      try {
        const response = await fetch("/api/conflicts/stats");
        if (response.ok) {
          const data = await response.json();
          setConflictStats(data);
        }
      } catch {
        // Silently fail - badge just won't show
      }
    }
    async function fetchAppealStats() {
      try {
        const response = await fetch("/api/appeals/stats");
        if (response.ok) {
          const data = await response.json();
          setAppealStats(data);
        }
      } catch {
        // Silently fail - badge just won't show
      }
    }
    fetchConflictStats();
    fetchAppealStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 relative">
      {/* Background pattern for entire page */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-6">
        {/* Platform Overview - Command Centre */}
        <div className="relative p-4 md:p-8 mb-4 md:mb-8">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl md:text-2xl">🎛️</span>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white">
                PlayAway Command Centre
              </h1>
              <p className="text-xs md:text-sm text-white/60">
                Admin Dashboard
              </p>
            </div>
          </div>

          {/* Stats row - always visible */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-4 text-center">
              <div className="text-lg md:text-3xl font-bold text-white">
                {stats.clubCount.toLocaleString()}
              </div>
              <div className="text-[10px] md:text-sm text-white/70">Clubs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-4 text-center">
              <div className="text-lg md:text-3xl font-bold text-white">
                {stats.countryCount}
              </div>
              <div className="text-[10px] md:text-sm text-white/70">
                Countries
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-4 text-center">
              <div className="text-lg md:text-3xl font-bold text-white">
                {stats.userCount.toLocaleString()}
              </div>
              <div className="text-[10px] md:text-sm text-white/70">Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-4 text-center">
              <div className="text-lg md:text-3xl font-bold text-secondary">
                {stats.eventCount}
              </div>
              <div className="text-[10px] md:text-sm text-white/70">Events</div>
            </div>
          </div>

          {/* Mobile: Collapsed with Read More */}
          <div className="md:hidden">
            {!showMore ? (
              <button
                type="button"
                onClick={() => setShowMore(true)}
                className="text-xs text-white/70 hover:text-white underline"
              >
                Read more about the platform...
              </button>
            ) : (
              <>
                <p className="text-xs text-white/90 leading-relaxed mb-2 font-medium">
                  Welcome to the central hub for managing the GAA&apos;s global
                  travel and tournament platform. The platform connects Irish
                  and UK clubs with European host clubs, facilitating
                  international fixtures, training camps, and cultural
                  exchanges.
                </p>
                <button
                  type="button"
                  onClick={() => setShowMore(false)}
                  className="text-xs text-white/70 hover:text-white underline"
                >
                  Show less
                </button>
              </>
            )}
          </div>

          {/* Desktop: Always visible */}
          <p className="hidden md:block text-sm md:text-base text-white/90 leading-relaxed font-medium">
            Welcome to the central hub for managing the GAA&apos;s global travel
            and tournament platform. From here, you have complete oversight of
            tournament scheduling, club verification, and user management. The
            platform connects Irish and UK clubs with European host clubs,
            facilitating international fixtures, training camps, and cultural
            exchanges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
          <Link
            href="/admin/events"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Manage Events
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Create, edit, and delete tournament events
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/clubs"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">🏛️</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Manage Clubs
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Create, edit, and delete club information
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/clubs-approval"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">✅</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Club Approvals
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Review and approve pending club registrations
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">👥</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Manage Users
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Edit users, assign roles, and manage club memberships
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/club-admin-requests"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">🛡️</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Club Admin Requests
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Review and approve club admin access requests
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/images"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">🖼️</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Manage Images
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Link club photos from S3 storage
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/survey-responses"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Custom Trip Requests
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  View and analyze custom trip requests
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/testimonials"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">💬</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Testimonials
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Review and manage club testimonials
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/conflicts"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-red-300"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-red-400/20 to-orange-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Conflict Resolution
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Review and resolve event disputes
                </p>
                {conflictStats && conflictStats.total > 0 && (
                  <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
                    {conflictStats.total} open
                  </span>
                )}
              </div>
            </div>
          </Link>

          <Link
            href="/admin/appeals"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-yellow-300"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Event Appeals
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Review rejection appeals from clubs
                </p>
                {appealStats && appealStats.total > 0 && (
                  <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                    {appealStats.total} pending
                  </span>
                )}
              </div>
            </div>
          </Link>

          <Link
            href="/admin/backups"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">💾</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Database Backups
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Create and manage database backups
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/pitches"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">🏟️</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Pitch Management
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Manage training pitches and location requests
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/calendar"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Calendar Management
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Manage club calendars, events, and interest submissions
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/features"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">🎛️</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Feature Toggles
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Enable or disable features for testing
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/emails"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-amber-300"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">📧</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Automated Emails
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Manage email templates and view logs
                </p>
                <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Setup Required
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/venues"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">📍</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Neutral Venues
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Private database of European event locations
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/data-center"
            className="group bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-slate-400/20 to-gray-500/20 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-lg md:text-2xl">🗄️</span>
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Data Center
                </h2>
                <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1">
                  Database statistics and data overview
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
