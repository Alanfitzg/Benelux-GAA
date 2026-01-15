"use client";

import { useState } from "react";
import {
  Download,
  Users,
  TrendingUp,
  Calendar,
  Building2,
  BarChart3,
  Loader2,
} from "lucide-react";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  endpoint: string;
  type: "export" | "view";
  includes?: string[];
}

const reports: ReportCard[] = [
  {
    id: "user-preferences",
    title: "User Preferences Export",
    description:
      "Export all user onboarding preferences including travel motivations, competitive levels, and destinations.",
    icon: <Users className="w-5 h-5 text-white" />,
    gradient: "from-blue-500 to-indigo-500",
    endpoint: "/api/admin/users/export-preferences",
    type: "export",
    includes: [
      "Travel motivations",
      "Competitive levels",
      "Preferred destinations",
      "Budget preferences",
      "Preferred travel months",
    ],
  },
  {
    id: "onboarding-summary",
    title: "Onboarding Summary",
    description:
      "Aggregated view of user preferences showing most popular choices and completion rates.",
    icon: <BarChart3 className="w-5 h-5 text-white" />,
    gradient: "from-violet-500 to-purple-500",
    endpoint: "/api/admin/reports/onboarding-summary",
    type: "view",
    includes: [
      "Completion vs skip rate",
      "Top motivations",
      "Popular destinations",
      "Budget distribution",
      "Seasonal preferences",
    ],
  },
  {
    id: "interest-trends",
    title: "Interest Submission Trends",
    description:
      "Analysis of event and tournament interest submissions with conversion tracking.",
    icon: <TrendingUp className="w-5 h-5 text-white" />,
    gradient: "from-emerald-500 to-teal-500",
    endpoint: "/api/admin/reports/interest-trends",
    type: "view",
    includes: [
      "Monthly submission trends",
      "Top interested clubs",
      "Team size preferences",
      "Status distribution",
      "Geographic breakdown",
    ],
  },
  {
    id: "event-performance",
    title: "Event Performance",
    description:
      "Tournament and event analytics including registration rates and capacity utilization.",
    icon: <Calendar className="w-5 h-5 text-white" />,
    gradient: "from-orange-500 to-amber-500",
    endpoint: "/api/admin/reports/event-performance",
    type: "view",
    includes: [
      "Events by type & location",
      "Team registrations",
      "Conversion rates",
      "Seasonal distribution",
      "Capacity utilization",
    ],
  },
  {
    id: "club-health",
    title: "Club Health Report",
    description:
      "Overview of club registrations, verification status, and profile completeness.",
    icon: <Building2 className="w-5 h-5 text-white" />,
    gradient: "from-rose-500 to-pink-500",
    endpoint: "/api/admin/reports/club-health",
    type: "view",
    includes: [
      "Verification status breakdown",
      "Geographic distribution",
      "Sports & team types offered",
      "Profile completeness score",
      "Top hosting clubs",
    ],
  },
  {
    id: "calendar-patterns",
    title: "Calendar Interest Patterns",
    description:
      "Scheduling demand analysis showing peak periods and booking lead times.",
    icon: <Calendar className="w-5 h-5 text-white" />,
    gradient: "from-cyan-500 to-blue-500",
    endpoint: "/api/admin/reports/calendar-patterns",
    type: "view",
    includes: [
      "Monthly demand patterns",
      "Day of week preferences",
      "Lead time analysis",
      "Most requested dates",
      "Blocked periods",
    ],
  },
];

export default function DataCenterPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(
    null
  );

  const handleExport = async (reportId: string, endpoint: string) => {
    setLoading(reportId);
    try {
      const link = document.createElement("a");
      link.href = endpoint;
      link.click();
    } finally {
      setTimeout(() => setLoading(null), 1000);
    }
  };

  const handleViewReport = async (reportId: string, endpoint: string) => {
    setLoading(reportId);
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setViewingReport(reportId);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(null);
    }
  };

  const closeReport = () => {
    setViewingReport(null);
    setReportData(null);
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="mb-4 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Data Center
        </h1>
        <p className="text-gray-600 text-sm md:text-base mt-1 md:mt-2">
          Export and analyze platform data for insights and reporting
        </p>
      </div>

      {/* Unique Data Asset Overview */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-primary/20 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-base md:text-xl font-semibold text-primary mb-2 md:mb-3 text-center md:text-left">
          First-Party Data: A Unique GAA Asset
        </h2>
        <p className="text-gray-700 text-xs md:text-base leading-relaxed mb-3 md:mb-4 text-center md:text-left">
          This data has{" "}
          <strong>never been systematically captured before</strong> in the
          history of Gaelic Games abroad. For the first time, we can see exactly
          how many teams and individuals are actively planning international
          trips, which destinations they prefer, their budgets, and when they
          want to travel. This intelligence enables accurate demand forecasting,
          revenue projections, and strategic partnership opportunities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-sm">
          <div className="bg-white/60 rounded-lg p-3 md:p-4 border border-primary/10">
            <div className="font-semibold text-primary text-sm md:text-base mb-1 text-center md:text-left">
              Travel Intent Data
            </div>
            <p className="text-gray-600 text-xs text-center md:text-left">
              Real booking intentions from clubs and individuals, not estimates.
              See exact team sizes, preferred dates, and destination interests.
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 md:p-4 border border-secondary/10">
            <div className="font-semibold text-secondary text-sm md:text-base mb-1 text-center md:text-left">
              Revenue Forecasting
            </div>
            <p className="text-gray-600 text-xs text-center md:text-left">
              Transform interest data into projected revenue. Calculate
              potential earnings from registrations, platform fees, and
              partnership opportunities.
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 md:p-4 border border-primary/10">
            <div className="font-semibold text-primary text-sm md:text-base mb-1 text-center md:text-left">
              Market Intelligence
            </div>
            <p className="text-gray-600 text-xs text-center md:text-left">
              Understand seasonal patterns, popular routes, competitive level
              distribution, and emerging markets for strategic planning.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${report.gradient} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  {report.icon}
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {report.title}
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              {report.includes && (
                <div className="text-xs text-gray-500 mb-4">
                  <p className="font-medium mb-1">Includes:</p>
                  <ul className="list-disc list-inside ml-1 space-y-0.5">
                    {report.includes.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  report.type === "export"
                    ? handleExport(report.id, report.endpoint)
                    : handleViewReport(report.id, report.endpoint)
                }
                disabled={loading === report.id}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 ${
                  report.type === "export"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {loading === report.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {report.type === "export" ? "Export CSV" : "View Report"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {viewingReport && reportData && (
        <ReportModal
          reportId={viewingReport}
          data={reportData}
          onClose={closeReport}
        />
      )}
    </div>
  );
}

interface ReportModalProps {
  reportId: string;
  data: Record<string, unknown>;
  onClose: () => void;
}

function ReportModal({ reportId, data, onClose }: ReportModalProps) {
  const report = reports.find((r) => r.id === reportId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div
          className={`bg-gradient-to-r ${report?.gradient || "from-gray-500 to-gray-600"} px-6 py-4 flex items-center justify-between`}
        >
          <h2 className="text-xl font-bold text-white">{report?.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <ReportContent reportId={reportId} data={data} />
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReportContentProps {
  reportId: string;
  data: Record<string, unknown>;
}

function ReportContent({ reportId, data }: ReportContentProps) {
  switch (reportId) {
    case "onboarding-summary":
      return <OnboardingSummaryReport data={data} />;
    case "interest-trends":
      return <InterestTrendsReport data={data} />;
    case "event-performance":
      return <EventPerformanceReport data={data} />;
    case "club-health":
      return <ClubHealthReport data={data} />;
    case "calendar-patterns":
      return <CalendarPatternsReport data={data} />;
    default:
      return (
        <pre className="text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left py-2 px-3 font-medium text-gray-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-gray-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OnboardingSummaryReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalUsers: number;
    completedOnboarding: number;
    skippedOnboarding: number;
    completionRate: number;
  };
  const motivations = data.motivations as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const competitiveLevels = data.competitiveLevels as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const topDestinations = data.topDestinations as {
    name: string;
    count: number;
  }[];
  const budgetRanges = data.budgetRanges as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const preferredMonths = data.preferredMonths as {
    name: string;
    count: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={summary?.totalUsers || 0} />
        <StatCard label="Completed" value={summary?.completedOnboarding || 0} />
        <StatCard label="Skipped" value={summary?.skippedOnboarding || 0} />
        <StatCard
          label="Completion Rate"
          value={`${summary?.completionRate || 0}%`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Top Motivations</h3>
          <DataTable
            headers={["Motivation", "Count", "%"]}
            rows={(motivations || [])
              .slice(0, 6)
              .map((m) => [m.name, m.count, `${m.percentage}%`])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Competitive Levels</h3>
          <DataTable
            headers={["Level", "Count", "%"]}
            rows={(competitiveLevels || []).map((c) => [
              c.name,
              c.count,
              `${c.percentage}%`,
            ])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Top Destinations</h3>
          <DataTable
            headers={["Destination", "Count"]}
            rows={(topDestinations || [])
              .slice(0, 10)
              .map((d) => [d.name, d.count])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Budget Preferences</h3>
          <DataTable
            headers={["Budget Range", "Count", "%"]}
            rows={(budgetRanges || []).map((b) => [
              b.name,
              b.count,
              `${b.percentage}%`,
            ])}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Preferred Travel Months</h3>
        <DataTable
          headers={["Month", "Count"]}
          rows={(preferredMonths || []).map((m) => [m.name, m.count])}
        />
      </div>
    </div>
  );
}

function InterestTrendsReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalEventInterests: number;
    totalTournamentInterests: number;
    totalCombined: number;
  };
  const monthlyTrends = data.monthlyTrends as {
    month: string;
    count: number;
  }[];
  const topClubs = data.topClubs as {
    name: string;
    country: string | null;
    count: number;
  }[];
  const topCountries = data.topCountries as {
    country: string;
    count: number;
  }[];
  const teamSizeDistribution = data.teamSizeDistribution as {
    range: string;
    count: number;
  }[];
  const statusDistribution = data.statusDistribution as {
    status: string;
    count: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Event Interests"
          value={summary?.totalEventInterests || 0}
        />
        <StatCard
          label="Tournament Interests"
          value={summary?.totalTournamentInterests || 0}
        />
        <StatCard label="Total Combined" value={summary?.totalCombined || 0} />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Monthly Trends (Last 12 Months)</h3>
        <DataTable
          headers={["Month", "Submissions"]}
          rows={(monthlyTrends || []).map((m) => [m.month, m.count])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Top Interested Clubs</h3>
          <DataTable
            headers={["Club", "Country", "Count"]}
            rows={(topClubs || [])
              .slice(0, 10)
              .map((c) => [c.name, c.country || "-", c.count])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Interest by Country</h3>
          <DataTable
            headers={["Country", "Count"]}
            rows={(topCountries || [])
              .slice(0, 10)
              .map((c) => [c.country, c.count])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Team Size Preferences</h3>
          <DataTable
            headers={["Size Range", "Count"]}
            rows={(teamSizeDistribution || []).map((t) => [t.range, t.count])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Status Distribution</h3>
          <DataTable
            headers={["Status", "Count"]}
            rows={(statusDistribution || []).map((s) => [s.status, s.count])}
          />
        </div>
      </div>
    </div>
  );
}

function EventPerformanceReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalEvents: number;
    activeEvents: number;
    upcomingEvents: number;
    totalTeamRegistrations: number;
    confirmedTeams: number;
    conversionRate: number;
    avgCapacityUtilization: number;
  };
  const eventsByType = data.eventsByType as { type: string; count: number }[];
  const eventsByLocation = data.eventsByLocation as {
    location: string;
    count: number;
  }[];
  const seasonalDistribution = data.seasonalDistribution as {
    month: string;
    count: number;
  }[];
  const topEventsByInterest = data.topEventsByInterest as {
    title: string;
    interestCount: number;
    teamCount: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={summary?.totalEvents || 0} />
        <StatCard label="Active Events" value={summary?.activeEvents || 0} />
        <StatCard label="Upcoming" value={summary?.upcomingEvents || 0} />
        <StatCard
          label="Conversion Rate"
          value={`${summary?.conversionRate || 0}%`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Team Registrations"
          value={summary?.totalTeamRegistrations || 0}
        />
        <StatCard
          label="Confirmed Teams"
          value={summary?.confirmedTeams || 0}
        />
        <StatCard
          label="Avg Capacity Used"
          value={`${summary?.avgCapacityUtilization || 0}%`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Events by Type</h3>
          <DataTable
            headers={["Type", "Count"]}
            rows={(eventsByType || []).map((e) => [e.type, e.count])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Events by Location</h3>
          <DataTable
            headers={["Location", "Count"]}
            rows={(eventsByLocation || [])
              .slice(0, 10)
              .map((e) => [e.location, e.count])}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Seasonal Distribution</h3>
        <DataTable
          headers={["Month", "Events Scheduled"]}
          rows={(seasonalDistribution || []).map((s) => [s.month, s.count])}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Top Events by Interest</h3>
        <DataTable
          headers={["Event", "Interests", "Teams"]}
          rows={(topEventsByInterest || []).map((e) => [
            e.title,
            e.interestCount,
            e.teamCount,
          ])}
        />
      </div>
    </div>
  );
}

function ClubHealthReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalClubs: number;
    verifiedClubs: number;
    clubsWithEvents: number;
    totalEventsHosted: number;
    clubsWithMembers: number;
    totalMembers: number;
    avgProfileCompleteness: number;
  };
  const verificationStatus = data.verificationStatus as {
    status: string;
    count: number;
    percentage: number;
  }[];
  const topCountries = data.topCountries as {
    country: string;
    count: number;
  }[];
  const sportsOffered = data.sportsOffered as {
    sport: string;
    count: number;
  }[];
  const topHostingClubs = data.topHostingClubs as {
    name: string;
    country: string | null;
    eventsHosted: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Clubs" value={summary?.totalClubs || 0} />
        <StatCard label="Verified" value={summary?.verifiedClubs || 0} />
        <StatCard label="With Events" value={summary?.clubsWithEvents || 0} />
        <StatCard
          label="Profile Score"
          value={`${summary?.avgProfileCompleteness || 0}%`}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Events Hosted"
          value={summary?.totalEventsHosted || 0}
        />
        <StatCard
          label="Clubs with Members"
          value={summary?.clubsWithMembers || 0}
        />
        <StatCard label="Total Members" value={summary?.totalMembers || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Verification Status</h3>
          <DataTable
            headers={["Status", "Count", "%"]}
            rows={(verificationStatus || []).map((v) => [
              v.status,
              v.count,
              `${v.percentage}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Sports Offered</h3>
          <DataTable
            headers={["Sport", "Clubs"]}
            rows={(sportsOffered || [])
              .slice(0, 8)
              .map((s) => [s.sport, s.count])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Top Countries</h3>
          <DataTable
            headers={["Country", "Clubs"]}
            rows={(topCountries || [])
              .slice(0, 10)
              .map((c) => [c.country, c.count])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Top Hosting Clubs</h3>
          <DataTable
            headers={["Club", "Country", "Events"]}
            rows={(topHostingClubs || []).map((c) => [
              c.name,
              c.country || "-",
              c.eventsHosted,
            ])}
          />
        </div>
      </div>
    </div>
  );
}

function CalendarPatternsReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalCalendarInterests: number;
    totalTournamentInterests: number;
    totalBlockedWeekends: number;
    avgLeadTimeDays: number;
  };
  const monthlyDemand = data.monthlyDemand as {
    month: string;
    count: number;
  }[];
  const leadTimeDistribution = data.leadTimeDistribution as {
    range: string;
    count: number;
  }[];
  const topRequestedDates = data.topRequestedDates as {
    date: string;
    count: number;
  }[];
  const topInterestedClubs = data.topInterestedClubs as {
    name: string;
    country: string | null;
    count: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Calendar Interests"
          value={summary?.totalCalendarInterests || 0}
        />
        <StatCard
          label="Tournament Interests"
          value={summary?.totalTournamentInterests || 0}
        />
        <StatCard
          label="Blocked Weekends"
          value={summary?.totalBlockedWeekends || 0}
        />
        <StatCard
          label="Avg Lead Time"
          value={`${summary?.avgLeadTimeDays || 0} days`}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Monthly Demand</h3>
        <DataTable
          headers={["Month", "Interest Count"]}
          rows={(monthlyDemand || []).map((m) => [m.month, m.count])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Lead Time Distribution</h3>
          <DataTable
            headers={["Time Range", "Count"]}
            rows={(leadTimeDistribution || []).map((l) => [l.range, l.count])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Top Requested Dates</h3>
          <DataTable
            headers={["Date", "Requests"]}
            rows={(topRequestedDates || [])
              .slice(0, 8)
              .map((d) => [d.date, d.count])}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Most Interested Clubs</h3>
        <DataTable
          headers={["Club", "Country", "Submissions"]}
          rows={(topInterestedClubs || [])
            .slice(0, 10)
            .map((c) => [c.name, c.country || "-", c.count])}
        />
      </div>
    </div>
  );
}
