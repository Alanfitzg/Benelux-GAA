"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  BarChart3,
  Globe,
  Plus,
  Settings,
  AlertCircle,
  Flag,
} from "lucide-react";
import UnifiedCalendarView from "@/components/calendar/UnifiedCalendarView";

interface Club {
  id: string;
  name: string;
  location: string | null;
  isMainlandEurope: boolean;
  country: { name: string; code: string } | null;
}

interface Stats {
  totalEvents: number;
  totalInterests: number;
  activeClubs: number;
  upcomingEvents: number;
}

interface CalendarAdminDashboardProps {
  clubs: Club[];
  stats: Stats;
}

interface CalendarStats {
  eventsByMonth: { month: string; count: number }[];
  interestsByClub: { clubName: string; submissions: number }[];
  upcomingHolidays: { date: string; name: string }[];
  priorityWeekends: { date: string; message: string }[];
}

export default function CalendarAdminDashboard({
  clubs,
  stats,
}: CalendarAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "calendar" | "statistics" | "settings"
  >("overview");
  const [calendarStats, setCalendarStats] = useState<CalendarStats | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchCalendarStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/calendar/stats");
      if (response.ok) {
        const data = await response.json();
        setCalendarStats(data);
      }
    } catch (error) {
      console.error("Error fetching calendar stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "statistics") {
      fetchCalendarStats();
    }
  }, [activeTab]);

  const mockClubPermissions = clubs.reduce(
    (acc, club) => {
      acc[club.id] = {
        canViewCalendar: true,
        canCreateEvents: false,
        canViewInterestIdentities: true,
      };
      return acc;
    },
    {} as Record<
      string,
      {
        canViewCalendar: boolean;
        canCreateEvents: boolean;
        canViewInterestIdentities: boolean;
      }
    >
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.totalEvents}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Interest Submissions
              </p>
              <p className="text-3xl font-bold text-green-900">
                {stats.totalInterests}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                Active Clubs
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {stats.activeClubs}
              </p>
            </div>
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">
                Upcoming Events
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {stats.upcomingEvents}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "calendar", label: "Unified Calendar", icon: Calendar },
              { id: "statistics", label: "Statistics", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "overview"
                        | "calendar"
                        | "statistics"
                        | "settings"
                    )
                  }
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">
                        Calendar system launched for mainland Europe
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">
                        Interest heatmap privacy controls implemented
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">
                        Irish holidays auto-display enabled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                      <Plus className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Add Priority Weekend
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                      <Flag className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">
                        Manage Blocked Weekends
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                      <Settings className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Calendar Settings
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">
                      Calendar System Status
                    </h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      The calendar system is active for {stats.activeClubs}{" "}
                      mainland European clubs. Interest submissions and event
                      management are fully operational.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unified European Calendar
                </h3>
                <p className="text-gray-600">
                  View all calendar events, interest submissions, and holidays
                  across all mainland European clubs.
                </p>
              </div>

              <UnifiedCalendarView
                mainlandEuropeClubs={clubs}
                clubPermissions={mockClubPermissions}
                userId="admin"
              />
            </div>
          )}

          {activeTab === "statistics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Calendar Statistics
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading statistics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Events by Month
                    </h4>
                    <div className="space-y-2">
                      {calendarStats?.eventsByMonth?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-600">
                            {item.month}
                          </span>
                          <span className="text-sm font-medium">
                            {item.count}
                          </span>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">
                          No data available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Top Interest Submissions
                    </h4>
                    <div className="space-y-2">
                      {calendarStats?.interestsByClub?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-600">
                            {item.clubName}
                          </span>
                          <span className="text-sm font-medium">
                            {item.submissions}
                          </span>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">
                          No data available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Calendar Settings
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    General Settings
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Auto-show Irish Holidays
                        </p>
                        <p className="text-xs text-gray-600">
                          Display Irish holidays automatically
                        </p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Interest Heatmap Privacy
                        </p>
                        <p className="text-xs text-gray-600">
                          Hide from non-authenticated users
                        </p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Data Management
                  </h4>
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                      Export Calendar Data
                    </button>
                    <button className="w-full p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                      Clear Old Interest Submissions
                    </button>
                    <button className="w-full p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                      Refresh Holiday Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
