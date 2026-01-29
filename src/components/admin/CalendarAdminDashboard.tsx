"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Globe,
  Plus,
  Settings,
  AlertCircle,
  Flag,
  Download,
  Trash2,
  RefreshCw,
  Check,
  Edit3,
  X,
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
    "none" | "overview" | "calendar" | "statistics" | "settings"
  >("none");
  const [calendarStats, setCalendarStats] = useState<CalendarStats | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const adminTabs = [
    { id: "overview", label: "Overview", mobileLabel: "Overview" },
    { id: "statistics", label: "Statistics", mobileLabel: "Stats" },
    { id: "settings", label: "Settings", mobileLabel: "Settings" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Content - Show ABOVE calendar when a tab is selected */}
      {activeTab !== "none" && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100">
          <div className="p-3 sm:p-6">
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-[10px] sm:text-xs font-medium">
                          Total Events
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-900">
                          {stats.totalEvents}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-[10px] sm:text-xs font-medium">
                          Interests
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-green-900">
                          {stats.totalInterests}
                        </p>
                      </div>
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-[10px] sm:text-xs font-medium">
                          Active Clubs
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-purple-900">
                          {stats.activeClubs}
                        </p>
                      </div>
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-[10px] sm:text-xs font-medium">
                          Upcoming
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-orange-900">
                          {stats.upcomingEvents}
                        </p>
                      </div>
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600">
                          Calendar system launched for mainland Europe
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600">
                          Interest heatmap privacy controls implemented
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600">
                          Irish holidays auto-display enabled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium">
                          Add Priority Weekend
                        </span>
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                        <span className="text-xs sm:text-sm font-medium">
                          Manage Blocked Weekends
                        </span>
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="text-xs sm:text-sm font-medium">
                          Calendar Settings
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-base font-medium text-yellow-900">
                        Calendar System Status
                      </h4>
                      <p className="text-[10px] sm:text-sm text-yellow-800 mt-1">
                        The calendar system is active for {stats.activeClubs}{" "}
                        mainland European clubs. Interest submissions and event
                        management are fully operational.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "statistics" && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                  Calendar Statistics
                </h3>

                {loading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-xs sm:text-base text-gray-500">
                      Loading statistics...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
                      <h4 className="text-xs sm:text-base font-medium text-gray-900 mb-2 sm:mb-4">
                        Events by Month
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {calendarStats?.eventsByMonth?.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-xs sm:text-sm text-gray-600">
                              {item.month}
                            </span>
                            <span className="text-xs sm:text-sm font-medium">
                              {item.count}
                            </span>
                          </div>
                        )) || (
                          <p className="text-xs sm:text-sm text-gray-500">
                            No data available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
                      <h4 className="text-xs sm:text-base font-medium text-gray-900 mb-2 sm:mb-4">
                        Top Interest Submissions
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {calendarStats?.interestsByClub?.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-xs sm:text-sm text-gray-600">
                              {item.clubName}
                            </span>
                            <span className="text-xs sm:text-sm font-medium">
                              {item.submissions}
                            </span>
                          </div>
                        )) || (
                          <p className="text-xs sm:text-sm text-gray-500">
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
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                  Calendar Settings
                </h3>

                {/* Primary Action - Edit Calendar */}
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="w-full flex items-center justify-center gap-3 p-4 sm:p-5 bg-primary hover:bg-primary/90 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all"
                >
                  <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
                  Edit Calendar
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 shadow-md">
                    <h4 className="text-xs sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-600" />
                      General Settings
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">
                            Auto-show Irish Holidays
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Display Irish holidays automatically
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Enabled
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">
                            Interest Heatmap Privacy
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Hide from non-authenticated users
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Enabled
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 shadow-md">
                    <h4 className="text-xs sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      Data Management
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium text-gray-700 shadow-sm"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        Export Calendar Data
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium text-gray-700 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        Clear Old Interest Submissions
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium text-gray-700 shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        Refresh Holiday Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar - The Central Nervous System */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <UnifiedCalendarView
          mainlandEuropeClubs={clubs}
          clubPermissions={mockClubPermissions}
          userId="admin"
          isAdmin={true}
          adminTabs={adminTabs}
          activeAdminTab={activeTab}
          onAdminTabChange={(tabId) => {
            // Toggle off if clicking the same tab
            if (activeTab === tabId) {
              setActiveTab("none");
            } else {
              setActiveTab(
                tabId as
                  | "none"
                  | "overview"
                  | "calendar"
                  | "statistics"
                  | "settings"
              );
            }
          }}
        />
      </div>

      {/* Edit Calendar Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Edit Calendar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Administrators can edit, add and remove fixtures here. You can
                also select which club calendars these fixtures appear on.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  Full editing functionality coming soon
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="w-full mt-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
