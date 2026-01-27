"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminSection {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  stats?: string;
}

const adminSections: AdminSection[] = [
  {
    title: "Calendar",
    description: "View and manage the youth events calendar",
    href: "/admin/youth/calendar",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    color: "from-blue-500 to-blue-600",
    stats: "9 Events",
  },
  {
    title: "Events",
    description: "Create, edit, and manage youth events",
    href: "/admin/youth/events",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    color: "from-green-500 to-green-600",
    stats: "Manage All",
  },
  {
    title: "Youth Clubs",
    description: "Manage clubs participating in youth programs",
    href: "/admin/youth/clubs",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    color: "from-purple-500 to-purple-600",
    stats: "0 Clubs",
  },
  {
    title: "Testimonials",
    description: "Manage youth event testimonials and reviews",
    href: "/admin/youth/testimonials",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    color: "from-amber-500 to-amber-600",
    stats: "0 Reviews",
  },
  {
    title: "Communications",
    description: "Send messages to youth clubs and coordinators",
    href: "/admin/youth/communications",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    color: "from-rose-500 to-rose-600",
    stats: "Send Messages",
  },
  {
    title: "Newsletter",
    description: "Create and send youth program newsletters",
    href: "/admin/youth/newsletter",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
    ),
    color: "from-indigo-500 to-indigo-600",
    stats: "Compose",
  },
  {
    title: "Data Center",
    description: "Analytics, reports, and youth program insights",
    href: "/admin/youth/data-center",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    color: "from-cyan-500 to-cyan-600",
    stats: "View Reports",
  },
];

export default function YouthAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" &&
        session.user.role !== "YOUTH_OFFICER")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "YOUTH_OFFICER")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-3xl">🏃</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                Youth Admin Centre
              </h1>
              <p className="text-white/70 text-xs sm:text-sm hidden sm:block">
                Manage youth programs, events, and communications
              </p>
            </div>
          </div>

          {/* Welcome Banner - Simplified on mobile */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 sm:p-4 mt-4 sm:mt-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl flex-shrink-0">👋</span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-purple-200">
                  Welcome, {session.user.name || session.user.username}!
                </h3>
                <p className="text-xs sm:text-sm text-purple-100/80 mt-1 hidden sm:block">
                  This is your central hub for managing all youth-related
                  activities across Gaelic Games Europe. Use the sections below
                  to access different features.
                </p>
                <p className="text-xs text-purple-100/80 mt-1 sm:hidden">
                  Manage youth activities across Gaelic Games Europe.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - More compact on mobile */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 group relative">
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/40 group-hover:text-white/70 transition-colors hidden sm:block">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-white">9</div>
            <div className="text-[10px] sm:text-sm text-white/70">Events</div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 hidden sm:block">
              Total youth events scheduled for 2026
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 group relative">
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/40 group-hover:text-white/70 transition-colors hidden sm:block">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-white">5</div>
            <div className="text-[10px] sm:text-sm text-white/70">Months</div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 hidden sm:block">
              Events span from March to August 2026
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 group relative">
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/40 group-hover:text-white/70 transition-colors hidden sm:block">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-white">8+</div>
            <div className="text-[10px] sm:text-sm text-white/70">
              Countries
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 hidden sm:block">
              Events across France, Belgium, Spain, Germany & more
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 group relative">
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white/40 group-hover:text-white/70 transition-colors hidden sm:block">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-white">0</div>
            <div className="text-[10px] sm:text-sm text-white/70">Signups</div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 hidden sm:block">
              Total team registrations across all youth events
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        {/* Admin Sections Grid - Compact cards on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-[0.98]"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white mb-2 sm:mb-4 group-hover:scale-110 transition-transform`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6">{section.icon}</div>
              </div>
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                {section.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mb-2 sm:mb-4 line-clamp-2 hidden sm:block">
                {section.description}
              </p>
              {section.stats && (
                <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-white/40 bg-white/5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  {section.stats}
                </div>
              )}
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions - Scrollable on mobile */}
        <div className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
            <Link
              href="/admin/youth/events?action=new"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Event
            </Link>
            <Link
              href="/admin/youth/communications?action=compose"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Message
            </Link>
            <Link
              href="/youth-events"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Public
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
