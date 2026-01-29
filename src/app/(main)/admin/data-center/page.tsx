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
  Flame,
  MapPinOff,
  MapPin,
  UserCheck,
  Trophy,
  Plane,
  ClipboardList,
  CheckCircle2,
  Target,
  CalendarDays,
  Clock,
  Heart,
} from "lucide-react";

interface ReportCard {
  id: string;
  title: string;
  narrativeQuestion: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  endpoint: string;
  type: "export" | "view" | "dual";
  exportEndpoint?: string;
  viewEndpoint?: string;
  includes?: string[];
}

const reports: ReportCard[] = [
  {
    id: "market-coverage",
    title: "Market Coverage & TAM",
    narrativeQuestion: "What's our market reach?",
    description:
      "Total Addressable Market analysis showing club adoption funnel from database → activated → verified → hosting.",
    icon: <Target className="w-5 h-5 text-white" />,
    gradient: "from-purple-600 to-indigo-600",
    endpoint: "/api/admin/reports/market-coverage",
    type: "view",
    includes: [
      "Total clubs (TAM)",
      "Activated clubs (has members)",
      "Verified clubs (has admins)",
      "Adoption funnel with percentages",
      "Country & region breakdown",
      "Monthly activation growth",
    ],
  },
  {
    id: "bank-holiday-analysis",
    title: "Bank Holiday Analysis",
    narrativeQuestion: "Bank holiday analysis",
    description:
      "Analysis of GAA travel demand around Irish & UK bank holidays - prime booking windows for tournaments.",
    icon: <CalendarDays className="w-5 h-5 text-white" />,
    gradient: "from-amber-500 to-orange-500",
    endpoint: "/api/admin/reports/bank-holiday-analysis",
    type: "view",
    includes: [
      "Top performing holiday weekends",
      "Upcoming holiday opportunities",
      "Holiday gap analysis (no events)",
      "Monthly demand heatmap",
      "2025 vs 2026 comparison",
      "Downloadable holiday calendar",
    ],
  },
  {
    id: "booking-intelligence",
    title: "Booking Intelligence",
    narrativeQuestion: "When & where do teams book?",
    description:
      "Lead time analysis and travel relationship patterns - understand booking behaviour and club-to-country corridors.",
    icon: <Clock className="w-5 h-5 text-white" />,
    gradient: "from-cyan-500 to-blue-500",
    endpoint: "/api/admin/reports/booking-intelligence",
    type: "view",
    includes: [
      "Lead time by destination & team type",
      "Booking window distribution",
      "County → Country corridors",
      "Repeat traveller clubs",
      "Popular host clubs & return rates",
      "Club pairings & relationships",
    ],
  },
  {
    id: "user-preferences",
    title: "Customer Preferences",
    narrativeQuestion: "What do our customers want?",
    description:
      "User onboarding data showing travel motivations, competitive levels, destinations, and engagement metrics.",
    icon: <Users className="w-5 h-5 text-white" />,
    gradient: "from-blue-500 to-indigo-500",
    endpoint: "/api/admin/reports/onboarding-summary",
    type: "dual",
    exportEndpoint: "/api/admin/users/export-preferences",
    viewEndpoint: "/api/admin/reports/onboarding-summary",
    includes: [
      "Onboarding completion rates",
      "Top travel motivations",
      "Preferred destinations",
      "Budget distribution",
      "Seasonal preferences",
    ],
  },
  {
    id: "interest-trends",
    title: "Interest Submission Trends",
    narrativeQuestion: "Where do teams want to go?",
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
      "Team type breakdown",
      "Status distribution",
      "Geographic breakdown",
    ],
  },
  {
    id: "event-performance",
    title: "Event Performance",
    narrativeQuestion: "Which tournaments are thriving?",
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
    narrativeQuestion: "How strong is our club network?",
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
    narrativeQuestion: "When do teams want to travel?",
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
  {
    id: "hot-leads",
    title: "Hot Leads",
    narrativeQuestion: "Who's ready to book?",
    description:
      "Users who completed onboarding and expressed interest but haven't booked yet - your warmest prospects.",
    icon: <Flame className="w-5 h-5 text-white" />,
    gradient: "from-red-500 to-orange-500",
    endpoint: "/api/admin/reports/hot-leads",
    type: "view",
    includes: [
      "Users with complete profiles",
      "Interest submissions without bookings",
      "Time since last activity",
      "Preferred destinations",
      "Contact readiness score",
    ],
  },
  {
    id: "trending",
    title: "Trending Analysis",
    narrativeQuestion: "What's trending?",
    description:
      "Rising destinations, clubs, and travel months based on recent interest vs historical patterns.",
    icon: <TrendingUp className="w-5 h-5 text-white" />,
    gradient: "from-violet-500 to-purple-500",
    endpoint: "/api/admin/reports/trending",
    type: "view",
    includes: [
      "Rising destinations (30-day trend)",
      "Emerging club popularity",
      "Seasonal momentum shifts",
      "New vs returning interest",
      "Growth rate comparisons",
    ],
  },
  {
    id: "unmet-demand",
    title: "Unmet Demand",
    narrativeQuestion: "Where's the untapped demand?",
    description:
      "Destinations users want to visit but where no clubs or events currently exist - expansion opportunities.",
    icon: <MapPinOff className="w-5 h-5 text-white" />,
    gradient: "from-amber-500 to-yellow-500",
    endpoint: "/api/admin/reports/unmet-demand",
    type: "view",
    includes: [
      "Requested destinations without clubs",
      "High-interest areas with no events",
      "Geographic gap analysis",
      "User demand by region",
      "Partnership opportunities",
    ],
  },
  {
    id: "club-engagement",
    title: "Club Engagement",
    narrativeQuestion: "How active are our clubs?",
    description:
      "Registered users, admins, and login activity per club - understand which clubs are most engaged.",
    icon: <UserCheck className="w-5 h-5 text-white" />,
    gradient: "from-sky-500 to-cyan-500",
    endpoint: "/api/admin/reports/club-engagement",
    type: "view",
    includes: [
      "Members & admins per club",
      "Recent login activity",
      "User role distribution",
      "Monthly membership growth",
      "Top engaged clubs",
    ],
  },
  {
    id: "sport-performance",
    title: "Sport Performance",
    narrativeQuestion: "Which sports are thriving?",
    description:
      "Performance breakdown by sport - see which GAA codes drive the most engagement across the platform.",
    icon: <Trophy className="w-5 h-5 text-white" />,
    gradient: "from-green-500 to-emerald-500",
    endpoint: "/api/admin/reports/sport-performance",
    type: "view",
    includes: [
      "Clubs per sport",
      "Events per sport",
      "Team registrations by sport",
      "Interest trends by sport",
      "Regional sport distribution",
    ],
  },
  {
    id: "club-trips",
    title: "Club Trip Activity",
    narrativeQuestion: "Which clubs are most active?",
    description:
      "Track club participation in tournaments (Ireland) and completed hosting bookings (International).",
    icon: <Plane className="w-5 h-5 text-white" />,
    gradient: "from-teal-500 to-cyan-500",
    endpoint: "/api/admin/reports/club-trips",
    type: "view",
    includes: [
      "Irish clubs by trips participated",
      "International clubs by bookings hosted",
      "Trip activity by county",
      "Hosting activity by country",
      "Recent trip & booking activity",
    ],
  },
  {
    id: "trip-requests",
    title: "Custom Trip Requests",
    narrativeQuestion: "What are teams looking for?",
    description:
      "Analysis of custom trip request submissions including roles, budgets, team sizes, and travel preferences.",
    icon: <ClipboardList className="w-5 h-5 text-white" />,
    gradient: "from-amber-500 to-orange-500",
    endpoint: "/api/admin/reports/trip-requests",
    type: "view",
    includes: [
      "Submissions by role & country",
      "Budget & team size preferences",
      "Service interests",
      "Biggest travel challenges",
      "Monthly submission trends",
    ],
  },
  {
    id: "event-approvals",
    title: "Event Approvals",
    narrativeQuestion: "How well do we approve events?",
    description:
      "Event approval and rejection statistics with appeal tracking. Perfect for marketing: 'We approve X% of event applications!'",
    icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    gradient: "from-emerald-500 to-green-500",
    endpoint: "/api/admin/reports/event-approvals",
    type: "view",
    includes: [
      "Approval & rejection rates",
      "Appeal success rates",
      "Monthly approval trends",
      "Rejection reasons breakdown",
      "Marketing-ready stats",
    ],
  },
  {
    id: "gge-interest",
    title: "Social GAA Interest",
    narrativeQuestion: "Who wants to play Social GAA?",
    description:
      "GGE Social GAA waiting list and interest registrations. Track demand by county, event type, and build fair allocation based on participation history.",
    icon: <Heart className="w-5 h-5 text-white" />,
    gradient: "from-rose-500 to-pink-500",
    endpoint: "/api/admin/reports/gge-interest",
    type: "view",
    includes: [
      "Total registrations & recent signups",
      "Interest by event type (Dads & Lads, G4MO, Camogie)",
      "County breakdown",
      "Estimated player counts",
      "Previous participation tracking",
      "Monthly registration trends",
    ],
  },
  {
    id: "youth-gaa",
    title: "Youth GAA Report",
    narrativeQuestion: "How active is Youth GAA?",
    description:
      "Comprehensive youth GAA analysis with demographics, age group breakdown, and county-level travel patterns. See which counties are most active in youth tournaments.",
    icon: <Users className="w-5 h-5 text-white" />,
    gradient: "from-emerald-500 to-teal-500",
    endpoint: "/api/admin/reports/youth-gaa",
    type: "view",
    includes: [
      "Youth events & registrations overview",
      "Age group demographics (U8-U18, Minor)",
      "County travel rankings",
      "Most active youth clubs",
      "County interest levels",
      "Monthly trend analysis",
    ],
  },
];

export default function DataCenterPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(
    null
  );
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showFinancialModal, setShowFinancialModal] = useState(false);

  // Filter reports based on selection
  const displayedReports = selectedReport
    ? reports.filter((r) => r.id === selectedReport)
    : reports;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 relative">
      {/* Background pattern for entire page */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-6 max-w-6xl">
        {/* Hero Header Section */}
        <div className="relative p-4 md:p-8 mb-4 md:mb-6 text-center">
          {/* Header with icon */}
          <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-xl md:text-2xl">📊</span>
            </div>
            <div className="text-left">
              <h1 className="text-lg md:text-2xl font-bold text-white">
                PlayAway Intelligence Hub
              </h1>
              <p className="text-xs md:text-sm text-white/60">
                Data Center &amp; Analytics
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm md:text-lg text-cyan-300 font-semibold mb-2 md:mb-3">
            First-of-its-kind GAA travel intelligence
          </p>

          {/* Description */}
          <p className="text-xs md:text-base text-white/80 leading-relaxed max-w-3xl mx-auto">
            This data has{" "}
            <strong className="text-white">
              never been systematically captured before
            </strong>
            . See exactly how many teams are planning trips, where they want to
            go, their budgets, and when they want to travel.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all bg-white/10 text-white/80 hover:bg-white/20`}
            >
              All Reports
            </button>
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedReport(report.id)}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all ${
                  selectedReport === report.id
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {report.narrativeQuestion}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-6 ${selectedReport ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {displayedReports.map((report) => (
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
                <p className="text-lg font-semibold text-gray-900 mb-2 italic">
                  &ldquo;{report.narrativeQuestion}&rdquo;
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  {report.description}
                </p>
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
                {report.type === "dual" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleViewReport(report.id, report.viewEndpoint!)
                      }
                      disabled={loading === report.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {loading === report.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <BarChart3 className="w-4 h-4" />
                      )}
                      Summary
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleExport(
                          report.id + "-export",
                          report.exportEndpoint!
                        )
                      }
                      disabled={loading === report.id + "-export"}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {loading === report.id + "-export" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Export
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          ))}

          {/* Financial Data Card - Coming Soon */}
          {!selectedReport && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Financial Data
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-lg font-semibold text-gray-900 mb-2 italic">
                  &ldquo;What&apos;s our economic impact?&rdquo;
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Revenue tracking, spending analysis, and economic impact data
                  for European GAA travel.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  <p className="font-medium mb-1">Will include:</p>
                  <ul className="list-disc list-inside ml-1 space-y-0.5">
                    <li>Total revenue & platform fees</li>
                    <li>Spending by travelling teams</li>
                    <li>Economic impact estimates</li>
                    <li>Club earnings breakdown</li>
                    <li>Payment & booking trends</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFinancialModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors bg-amber-100 text-amber-700 hover:bg-amber-200"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Financial Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Financial Data Modal - Coming Soon */}
        {showFinancialModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Financial Data</h2>
                <button
                  type="button"
                  onClick={() => setShowFinancialModal(false)}
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
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🚧</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  Financial data reporting is not yet available as the payment
                  and booking models are currently under construction.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-xs text-amber-800">
                    <strong>What&apos;s being built:</strong> Once the booking
                    and payment systems are finalised, this report will show
                    revenue, club earnings, economic impact data, and spending
                    trends across European GAA travel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFinancialModal(false)}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {viewingReport && reportData && (
          <ReportModal
            reportId={viewingReport}
            data={reportData}
            onClose={closeReport}
          />
        )}
      </div>
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
    case "market-coverage":
      return <MarketCoverageReport data={data} />;
    case "bank-holiday-analysis":
      return <BankHolidayAnalysisReport data={data} />;
    case "booking-intelligence":
      return <BookingIntelligenceReport data={data} />;
    case "user-preferences":
      return <OnboardingSummaryReport data={data} />;
    case "interest-trends":
      return <InterestTrendsReport data={data} />;
    case "event-performance":
      return <EventPerformanceReport data={data} />;
    case "club-health":
      return <ClubHealthReport data={data} />;
    case "calendar-patterns":
      return <CalendarPatternsReport data={data} />;
    case "hot-leads":
      return <HotLeadsReport data={data} />;
    case "trending":
      return <TrendingReport data={data} />;
    case "unmet-demand":
      return <UnmetDemandReport data={data} />;
    case "club-engagement":
      return <ClubEngagementReport data={data} />;
    case "sport-performance":
      return <SportPerformanceReport data={data} />;
    case "club-trips":
      return <ClubTripsReport data={data} />;
    case "trip-requests":
      return <TripRequestsReport data={data} />;
    case "event-approvals":
      return <EventApprovalsReport data={data} />;
    case "gge-interest":
      return <GGEInterestReport data={data} />;
    case "youth-gaa":
      return <YouthGAAReport data={data} />;
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

function MarketCoverageReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalClubs: number;
    activatedClubs: number;
    verifiedClubs: number;
    hostingClubs: number;
    activationRate: number;
    verificationRate: number;
    overallVerificationRate: number;
    hostingRate: number;
    untappedClubs: number;
    untappedPercentage: number;
  };
  const funnel = data.funnel as {
    stage: string;
    count: number;
    percentage: number;
  }[];
  const regionBreakdown = data.regionBreakdown as {
    irish: {
      total: number;
      activated: number;
      verified: number;
      activationRate: number;
      verificationRate: number;
    };
    european: {
      total: number;
      activated: number;
      verified: number;
      activationRate: number;
      verificationRate: number;
    };
  };
  const countryBreakdown = data.countryBreakdown as {
    country: string;
    totalClubs: number;
    activatedClubs: number;
    verifiedClubs: number;
    activationRate: number;
    verificationRate: number;
  }[];
  const monthlyGrowth = data.monthlyGrowth as {
    month: string;
    newActivations: number;
  }[];
  const userStats = data.userStats as {
    totalUsers: number;
    totalMembers: number;
    totalAdmins: number;
    membershipRate: number;
    adminRate: number;
  };

  return (
    <div className="space-y-6">
      {/* Key Headline Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold">
              {summary?.totalClubs?.toLocaleString() || 0}
            </p>
            <p className="text-purple-200 text-sm">Total Clubs (TAM)</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{summary?.activatedClubs || 0}</p>
            <p className="text-purple-200 text-sm">
              Activated ({summary?.activationRate || 0}%)
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold">{summary?.verifiedClubs || 0}</p>
            <p className="text-purple-200 text-sm">
              Verified ({summary?.overallVerificationRate || 0}%)
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold">{summary?.hostingClubs || 0}</p>
            <p className="text-purple-200 text-sm">Hosting Events</p>
          </div>
        </div>
      </div>

      {/* Adoption Funnel */}
      <div>
        <h3 className="font-semibold mb-3">Adoption Funnel</h3>
        <div className="space-y-3">
          {(funnel || []).map((stage, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {stage.stage}
                </span>
                <span className="text-sm text-gray-600">
                  {stage.count.toLocaleString()} ({stage.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    idx === 0
                      ? "bg-purple-600"
                      : idx === 1
                        ? "bg-indigo-500"
                        : idx === 2
                          ? "bg-blue-500"
                          : "bg-cyan-500"
                  }`}
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Untapped Opportunity */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-2">
          Untapped Opportunity
        </h3>
        <p className="text-3xl font-bold text-amber-600">
          {summary?.untappedClubs?.toLocaleString() || 0} clubs
        </p>
        <p className="text-sm text-amber-700">
          {summary?.untappedPercentage || 0}% of the market has not yet engaged
          with PlayAway
        </p>
      </div>

      {/* Region Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>🇮🇪</span> Ireland & UK (Travellers)
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-green-700">
                {regionBreakdown?.irish?.total || 0}
              </p>
              <p className="text-xs text-green-600">Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-700">
                {regionBreakdown?.irish?.activated || 0}
              </p>
              <p className="text-xs text-green-600">
                Activated ({regionBreakdown?.irish?.activationRate || 0}%)
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-700">
                {regionBreakdown?.irish?.verified || 0}
              </p>
              <p className="text-xs text-green-600">
                Verified ({regionBreakdown?.irish?.verificationRate || 0}%)
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>🌍</span> European (Hosts)
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-blue-700">
                {regionBreakdown?.european?.total || 0}
              </p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-700">
                {regionBreakdown?.european?.activated || 0}
              </p>
              <p className="text-xs text-blue-600">
                Activated ({regionBreakdown?.european?.activationRate || 0}%)
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-700">
                {regionBreakdown?.european?.verified || 0}
              </p>
              <p className="text-xs text-blue-600">
                Verified ({regionBreakdown?.european?.verificationRate || 0}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={userStats?.totalUsers || 0} />
        <StatCard
          label="Club Members"
          value={userStats?.totalMembers || 0}
          subtext={`${userStats?.membershipRate || 0}% of users`}
        />
        <StatCard
          label="Club Admins"
          value={userStats?.totalAdmins || 0}
          subtext={`${userStats?.adminRate || 0}% of users`}
        />
        <StatCard
          label="Conversion Rate"
          value={`${summary?.verificationRate || 0}%`}
          subtext="Activated → Verified"
        />
        <StatCard
          label="Hosting Rate"
          value={`${summary?.hostingRate || 0}%`}
          subtext="Verified → Hosting"
        />
      </div>

      {/* Country Breakdown */}
      <div>
        <h3 className="font-semibold mb-3">Coverage by Country</h3>
        <DataTable
          headers={[
            "Country",
            "Total",
            "Activated",
            "Verified",
            "Activation %",
            "Verification %",
          ]}
          rows={(countryBreakdown || []).map((c) => [
            c.country,
            c.totalClubs,
            c.activatedClubs,
            c.verifiedClubs,
            `${c.activationRate}%`,
            `${c.verificationRate}%`,
          ])}
        />
      </div>

      {/* Monthly Growth */}
      {(monthlyGrowth || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Monthly Activation Growth</h3>
          <DataTable
            headers={["Month", "New Activations"]}
            rows={(monthlyGrowth || []).map((m) => [m.month, m.newActivations])}
          />
        </div>
      )}
    </div>
  );
}

function BankHolidayAnalysisReport({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const summary = data.summary as {
    totalEventsOnHolidays: number;
    totalRegistrationsOnHolidays: number;
    holidayEventShare: number;
    holidayRegistrationShare: number;
    upcomingHolidaysWithEvents: number;
    upcomingHolidaysWithoutEvents: number;
    totalSourceMarketHolidays: number;
  };
  const topPerformingHolidays = data.topPerformingHolidays as {
    holidayName: string;
    country: string;
    countryFlag: string;
    date: string;
    year: number;
    eventsCount: number;
    totalRegistrations: number;
    averageRegistrations: number;
  }[];
  const upcomingOpportunities = data.upcomingOpportunities as {
    holidayName: string;
    country: string;
    countryFlag: string;
    date: string;
    year: number;
    eventsCount: number;
    daysAway: number | null;
  }[];
  const holidayGaps = data.holidayGaps as {
    holidayName: string;
    country: string;
    countryFlag: string;
    date: string;
    daysAway: number | null;
  }[];
  const heatmapData = data.heatmapData as {
    month: string;
    holidays: number;
    events: number;
    registrations: number;
  }[];
  const yearComparison = data.yearComparison as {
    "2025": {
      totalHolidays: number;
      longWeekends: number;
      eventsScheduled: number;
    };
    "2026": {
      totalHolidays: number;
      longWeekends: number;
      eventsScheduled: number;
    };
  };
  const allHolidayData = data.allHolidayData as {
    holidayName: string;
    country: string;
    countryFlag: string;
    formattedDate: string;
    year: number;
    eventsCount: number;
    totalRegistrations: number;
  }[];

  const downloadCSV = () => {
    const headers = [
      "Holiday",
      "Country",
      "Date",
      "Year",
      "Events",
      "Registrations",
    ];
    const rows = (allHolidayData || []).map((h) => [
      h.holidayName,
      h.country,
      h.formattedDate,
      h.year,
      h.eventsCount,
      h.totalRegistrations,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bank-holiday-analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* Key Stats */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold">
              {summary?.totalEventsOnHolidays || 0}
            </p>
            <p className="text-amber-100 text-sm">Events on Holidays</p>
          </div>
          <div>
            <p className="text-4xl font-bold">
              {summary?.totalRegistrationsOnHolidays || 0}
            </p>
            <p className="text-amber-100 text-sm">Holiday Registrations</p>
          </div>
          <div>
            <p className="text-4xl font-bold">
              {summary?.holidayEventShare || 0}%
            </p>
            <p className="text-amber-100 text-sm">Events on Holiday Windows</p>
          </div>
          <div>
            <p className="text-4xl font-bold">
              {summary?.holidayRegistrationShare || 0}%
            </p>
            <p className="text-amber-100 text-sm">Registrations on Holidays</p>
          </div>
        </div>
      </div>

      {/* Holiday Gaps - Priority Alert */}
      {(holidayGaps || []).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Holiday Gaps - No Events
            Scheduled
          </h3>
          <p className="text-sm text-red-700 mb-3">
            These upcoming Irish/UK bank holidays have no tournaments scheduled
            - opportunity to attract travelling teams!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {(holidayGaps || []).slice(0, 6).map((gap, idx) => (
              <div
                key={idx}
                className="bg-white rounded p-2 border border-red-100 flex items-center gap-2"
              >
                <span>{gap.countryFlag}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {gap.holidayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(gap.date).toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {gap.daysAway !== null && ` • ${gap.daysAway} days away`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Heatmap */}
      <div>
        <h3 className="font-semibold mb-3">2025 Holiday Demand Heatmap</h3>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
          {(heatmapData || []).map((month, idx) => {
            const intensity =
              month.holidays > 0
                ? month.holidays >= 2
                  ? "bg-amber-500"
                  : "bg-amber-300"
                : "bg-gray-100";
            return (
              <div
                key={idx}
                className={`${intensity} rounded p-2 text-center relative group`}
              >
                <p className="text-xs font-medium">{month.month}</p>
                <p className="text-lg font-bold">{month.holidays}</p>
                <p className="text-xs text-gray-600">{month.events} events</p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                  {month.registrations} registrations
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Darker = more bank holidays in that month (IE/UK)
        </p>
      </div>

      {/* Year Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">2025 Overview</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-blue-700">
                {yearComparison?.["2025"]?.totalHolidays || 0}
              </p>
              <p className="text-xs text-blue-600">Bank Holidays</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-700">
                {yearComparison?.["2025"]?.longWeekends || 0}
              </p>
              <p className="text-xs text-blue-600">Long Weekends</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-700">
                {yearComparison?.["2025"]?.eventsScheduled || 0}
              </p>
              <p className="text-xs text-blue-600">Events Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-3">2026 Overview</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-purple-700">
                {yearComparison?.["2026"]?.totalHolidays || 0}
              </p>
              <p className="text-xs text-purple-600">Bank Holidays</p>
            </div>
            <div>
              <p className="text-xl font-bold text-purple-700">
                {yearComparison?.["2026"]?.longWeekends || 0}
              </p>
              <p className="text-xs text-purple-600">Long Weekends</p>
            </div>
            <div>
              <p className="text-xl font-bold text-purple-700">
                {yearComparison?.["2026"]?.eventsScheduled || 0}
              </p>
              <p className="text-xs text-purple-600">Events Scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Holidays */}
      {(topPerformingHolidays || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">
            Top Performing Holiday Weekends
          </h3>
          <DataTable
            headers={[
              "Holiday",
              "Country",
              "Date",
              "Events",
              "Registrations",
              "Avg/Event",
            ]}
            rows={(topPerformingHolidays || []).map((h) => [
              h.holidayName,
              `${h.countryFlag} ${h.country}`,
              new Date(h.date).toLocaleDateString("en-IE", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              h.eventsCount,
              h.totalRegistrations,
              h.averageRegistrations,
            ])}
          />
        </div>
      )}

      {/* Upcoming Opportunities */}
      {(upcomingOpportunities || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Upcoming Holiday Opportunities</h3>
          <DataTable
            headers={[
              "Holiday",
              "Country",
              "Date",
              "Days Away",
              "Events Scheduled",
            ]}
            rows={(upcomingOpportunities || []).map((h) => [
              h.holidayName,
              `${h.countryFlag} ${h.country}`,
              new Date(h.date).toLocaleDateString("en-IE", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              h.daysAway !== null ? `${h.daysAway} days` : "—",
              h.eventsCount > 0 ? `${h.eventsCount} ✓` : "None ⚠️",
            ])}
          />
        </div>
      )}
    </div>
  );
}

function BookingIntelligenceReport({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const summary = data.summary as {
    totalBookings: number;
    uniqueTravellingClubs: number;
    uniqueHostClubs: number;
    uniqueDestinations: number;
    avgLeadTime: number;
    medianLeadTime: number;
    repeatTravelerCount: number;
    repeatTravelerRate: number;
  };
  const leadTime = data.leadTime as {
    buckets: {
      lastMinute: number;
      shortTerm: number;
      mediumTerm: number;
      planned: number;
      earlyBird: number;
    };
    byDestination: {
      country: string;
      avgLeadTime: number;
      bookings: number;
    }[];
    byTeamType: {
      teamType: string;
      avgLeadTime: number;
      bookings: number;
    }[];
  };
  const relationships = data.relationships as {
    topCorridors: {
      origin: string;
      destination: string;
      trips: number;
    }[];
    frequentTravellers: {
      clubName: string;
      totalTrips: number;
      uniqueDestinations: number;
      destinations: string;
    }[];
    popularHosts: {
      clubName: string;
      country: string;
      totalVisits: number;
      uniqueVisitors: number;
      returnRate: number;
    }[];
    repeatPairings: {
      travellerName: string;
      hostName: string;
      hostCountry: string;
      count: number;
    }[];
    popularDestinations: {
      country: string;
      trips: number;
    }[];
  };
  const allBookingData = data.allBookingData as {
    travellingClub: string;
    travellingCountry: string;
    travellingRegion: string;
    hostClub: string;
    hostCountry: string;
    eventTitle: string;
    eventDate: string;
    registrationDate: string;
    leadTimeDays: number;
    teamType: string;
  }[];

  const downloadCSV = () => {
    const headers = [
      "Travelling Club",
      "Travelling Country",
      "Travelling Region",
      "Host Club",
      "Host Country",
      "Event",
      "Event Date",
      "Registration Date",
      "Lead Time (Days)",
      "Team Type",
    ];
    const rows = (allBookingData || []).map((b) => [
      b.travellingClub,
      b.travellingCountry,
      b.travellingRegion,
      b.hostClub,
      b.hostCountry,
      b.eventTitle,
      b.eventDate,
      b.registrationDate,
      b.leadTimeDays,
      b.teamType,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "booking-intelligence.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalBuckets =
    (leadTime?.buckets?.lastMinute || 0) +
    (leadTime?.buckets?.shortTerm || 0) +
    (leadTime?.buckets?.mediumTerm || 0) +
    (leadTime?.buckets?.planned || 0) +
    (leadTime?.buckets?.earlyBird || 0);

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* Key Stats */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold">{summary?.avgLeadTime || 0}</p>
            <p className="text-cyan-100 text-sm">Avg Lead Time (days)</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{summary?.totalBookings || 0}</p>
            <p className="text-cyan-100 text-sm">Total Bookings</p>
          </div>
          <div>
            <p className="text-4xl font-bold">
              {summary?.uniqueTravellingClubs || 0}
            </p>
            <p className="text-cyan-100 text-sm">Travelling Clubs</p>
          </div>
          <div>
            <p className="text-4xl font-bold">
              {summary?.repeatTravelerRate || 0}%
            </p>
            <p className="text-cyan-100 text-sm">Repeat Travellers</p>
          </div>
        </div>
      </div>

      {/* Lead Time Distribution */}
      <div>
        <h3 className="font-semibold mb-3">Booking Window Distribution</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-red-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-700">
              {leadTime?.buckets?.lastMinute || 0}
            </p>
            <p className="text-xs text-red-600">Last Minute</p>
            <p className="text-xs text-red-500">(&lt;2 weeks)</p>
            {totalBuckets > 0 && (
              <p className="text-xs text-red-400 mt-1">
                {Math.round(
                  ((leadTime?.buckets?.lastMinute || 0) / totalBuckets) * 100
                )}
                %
              </p>
            )}
          </div>
          <div className="bg-orange-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-700">
              {leadTime?.buckets?.shortTerm || 0}
            </p>
            <p className="text-xs text-orange-600">Short Term</p>
            <p className="text-xs text-orange-500">(2-4 weeks)</p>
            {totalBuckets > 0 && (
              <p className="text-xs text-orange-400 mt-1">
                {Math.round(
                  ((leadTime?.buckets?.shortTerm || 0) / totalBuckets) * 100
                )}
                %
              </p>
            )}
          </div>
          <div className="bg-yellow-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">
              {leadTime?.buckets?.mediumTerm || 0}
            </p>
            <p className="text-xs text-yellow-600">Medium Term</p>
            <p className="text-xs text-yellow-500">(1-2 months)</p>
            {totalBuckets > 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                {Math.round(
                  ((leadTime?.buckets?.mediumTerm || 0) / totalBuckets) * 100
                )}
                %
              </p>
            )}
          </div>
          <div className="bg-green-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">
              {leadTime?.buckets?.planned || 0}
            </p>
            <p className="text-xs text-green-600">Planned</p>
            <p className="text-xs text-green-500">(2-4 months)</p>
            {totalBuckets > 0 && (
              <p className="text-xs text-green-400 mt-1">
                {Math.round(
                  ((leadTime?.buckets?.planned || 0) / totalBuckets) * 100
                )}
                %
              </p>
            )}
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {leadTime?.buckets?.earlyBird || 0}
            </p>
            <p className="text-xs text-blue-600">Early Bird</p>
            <p className="text-xs text-blue-500">(&gt;4 months)</p>
            {totalBuckets > 0 && (
              <p className="text-xs text-blue-400 mt-1">
                {Math.round(
                  ((leadTime?.buckets?.earlyBird || 0) / totalBuckets) * 100
                )}
                %
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lead Time by Destination & Team Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Lead Time by Destination</h3>
          {(leadTime?.byDestination || []).length > 0 ? (
            <DataTable
              headers={["Country", "Avg Lead Time", "Bookings"]}
              rows={(leadTime?.byDestination || []).map((d) => [
                d.country,
                `${d.avgLeadTime} days`,
                d.bookings,
              ])}
            />
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-3">Lead Time by Team Type</h3>
          {(leadTime?.byTeamType || []).length > 0 ? (
            <DataTable
              headers={["Team Type", "Avg Lead Time", "Bookings"]}
              rows={(leadTime?.byTeamType || []).map((t) => [
                t.teamType,
                `${t.avgLeadTime} days`,
                t.bookings,
              ])}
            />
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>

      {/* Travel Corridors */}
      {(relationships?.topCorridors || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">
            Top Travel Corridors (Origin → Destination)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(relationships?.topCorridors || []).slice(0, 8).map((c, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
              >
                <p className="text-sm font-medium text-gray-800">
                  {c.origin} → {c.destination}
                </p>
                <p className="text-lg font-bold text-cyan-600">
                  {c.trips} trips
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Destinations */}
      {(relationships?.popularDestinations || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Most Popular Destinations</h3>
          <div className="flex flex-wrap gap-2">
            {(relationships?.popularDestinations || []).map((d, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-full ${
                  idx === 0
                    ? "bg-cyan-500 text-white"
                    : idx === 1
                      ? "bg-cyan-400 text-white"
                      : idx === 2
                        ? "bg-cyan-300 text-cyan-900"
                        : "bg-gray-100 text-gray-700"
                }`}
              >
                <span className="font-medium">{d.country}</span>
                <span className="ml-2 opacity-75">({d.trips})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequent Travellers & Popular Hosts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(relationships?.frequentTravellers || []).length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Frequent Traveller Clubs</h3>
            <DataTable
              headers={["Club", "Trips", "Destinations"]}
              rows={(relationships?.frequentTravellers || [])
                .slice(0, 10)
                .map((t) => [t.clubName, t.totalTrips, t.uniqueDestinations])}
            />
          </div>
        )}
        {(relationships?.popularHosts || []).length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Popular Host Clubs</h3>
            <DataTable
              headers={["Club", "Country", "Visits", "Return Rate"]}
              rows={(relationships?.popularHosts || [])
                .slice(0, 10)
                .map((h) => [
                  h.clubName,
                  h.country,
                  h.totalVisits,
                  `${h.returnRate}%`,
                ])}
            />
          </div>
        )}
      </div>

      {/* Repeat Club Pairings */}
      {(relationships?.repeatPairings || []).length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3">
            Repeat Club Relationships
          </h3>
          <p className="text-sm text-green-700 mb-3">
            These clubs have visited the same host multiple times - strong
            relationships!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(relationships?.repeatPairings || []).map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded p-3 border border-green-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {p.travellerName} → {p.hostName}
                  </p>
                  <p className="text-xs text-gray-500">{p.hostCountry}</p>
                </div>
                <div className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                  {p.count}x
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Unique Host Clubs"
          value={summary?.uniqueHostClubs || 0}
        />
        <StatCard
          label="Destinations"
          value={summary?.uniqueDestinations || 0}
        />
        <StatCard
          label="Median Lead Time"
          value={`${summary?.medianLeadTime || 0} days`}
        />
        <StatCard
          label="Repeat Travellers"
          value={summary?.repeatTravelerCount || 0}
          subtext={`${summary?.repeatTravelerRate || 0}% of clubs`}
        />
      </div>
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
  const teamTypeDistribution = data.teamTypeDistribution as {
    type: string;
    label: string;
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

      {(teamTypeDistribution || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Team Type Distribution</h3>
          <DataTable
            headers={["Team Type", "Count"]}
            rows={(teamTypeDistribution || []).map((t) => [t.label, t.count])}
          />
        </div>
      )}
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

function HotLeadsReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalHotLeads: number;
    completedOnboarding: number;
    expressedInterest: number;
    avgDaysSinceActivity: number;
  };
  const hotLeads = data.hotLeads as {
    email: string;
    name: string | null;
    club: string | null;
    onboardingDate: string;
    lastInterestDate: string;
    interestCount: number;
    preferredDestinations: string[];
  }[];
  const byDestination = data.byDestination as {
    destination: string;
    count: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Hot Leads" value={summary?.totalHotLeads || 0} />
        <StatCard
          label="Completed Onboarding"
          value={summary?.completedOnboarding || 0}
        />
        <StatCard
          label="Expressed Interest"
          value={summary?.expressedInterest || 0}
        />
        <StatCard
          label="Avg Days Since Activity"
          value={summary?.avgDaysSinceActivity || 0}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Top Hot Leads</h3>
        <DataTable
          headers={["Email", "Name", "Club", "Interests", "Last Activity"]}
          rows={(hotLeads || [])
            .slice(0, 15)
            .map((l) => [
              l.email,
              l.name || "-",
              l.club || "-",
              l.interestCount,
              l.lastInterestDate,
            ])}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Hot Leads by Destination</h3>
        <DataTable
          headers={["Destination", "Hot Leads"]}
          rows={(byDestination || [])
            .slice(0, 10)
            .map((d) => [d.destination, d.count])}
        />
      </div>
    </div>
  );
}

function TrendingReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalInterestsLast30Days: number;
    totalInterestsPrevious30Days: number;
    growthRate: number;
  };
  const risingDestinations = data.risingDestinations as {
    destination: string;
    recentCount: number;
    previousCount: number;
    growthPercent: number;
  }[];
  const risingClubs = data.risingClubs as {
    name: string;
    country: string | null;
    recentCount: number;
    growthPercent: number;
  }[];
  const risingMonths = data.risingMonths as {
    month: string;
    recentCount: number;
    previousCount: number;
    growthPercent: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Last 30 Days"
          value={summary?.totalInterestsLast30Days || 0}
        />
        <StatCard
          label="Previous 30 Days"
          value={summary?.totalInterestsPrevious30Days || 0}
        />
        <StatCard
          label="Growth Rate"
          value={`${summary?.growthRate > 0 ? "+" : ""}${summary?.growthRate || 0}%`}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Rising Destinations</h3>
        <DataTable
          headers={["Destination", "Recent", "Previous", "Growth"]}
          rows={(risingDestinations || [])
            .slice(0, 10)
            .map((d) => [
              d.destination,
              d.recentCount,
              d.previousCount,
              `${d.growthPercent > 0 ? "+" : ""}${d.growthPercent}%`,
            ])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Rising Clubs</h3>
          <DataTable
            headers={["Club", "Country", "Recent", "Growth"]}
            rows={(risingClubs || [])
              .slice(0, 8)
              .map((c) => [
                c.name,
                c.country || "-",
                c.recentCount,
                `${c.growthPercent > 0 ? "+" : ""}${c.growthPercent}%`,
              ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Rising Travel Months</h3>
          <DataTable
            headers={["Month", "Recent", "Previous", "Growth"]}
            rows={(risingMonths || []).map((m) => [
              m.month,
              m.recentCount,
              m.previousCount,
              `${m.growthPercent > 0 ? "+" : ""}${m.growthPercent}%`,
            ])}
          />
        </div>
      </div>
    </div>
  );
}

function UnmetDemandReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalUnmetDestinations: number;
    totalUsersAffected: number;
    topOpportunityRegion: string;
  };
  const unmetDestinations = data.unmetDestinations as {
    destination: string;
    demandCount: number;
    hasClub: boolean;
    hasEvent: boolean;
  }[];
  const regionGaps = data.regionGaps as {
    region: string;
    demandCount: number;
    clubCount: number;
    eventCount: number;
    gapScore: number;
  }[];
  const partnershipOpportunities = data.partnershipOpportunities as {
    destination: string;
    demandCount: number;
    suggestedAction: string;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Unmet Destinations"
          value={summary?.totalUnmetDestinations || 0}
        />
        <StatCard
          label="Users Affected"
          value={summary?.totalUsersAffected || 0}
        />
        <StatCard
          label="Top Opportunity"
          value={summary?.topOpportunityRegion || "-"}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Unmet Destination Demand</h3>
        <DataTable
          headers={["Destination", "Demand", "Has Club", "Has Event"]}
          rows={(unmetDestinations || [])
            .slice(0, 15)
            .map((d) => [
              d.destination,
              d.demandCount,
              d.hasClub ? "Yes" : "No",
              d.hasEvent ? "Yes" : "No",
            ])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Regional Gap Analysis</h3>
          <DataTable
            headers={["Region", "Demand", "Clubs", "Events", "Gap Score"]}
            rows={(regionGaps || [])
              .slice(0, 8)
              .map((r) => [
                r.region,
                r.demandCount,
                r.clubCount,
                r.eventCount,
                r.gapScore,
              ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Partnership Opportunities</h3>
          <DataTable
            headers={["Destination", "Demand", "Suggested Action"]}
            rows={(partnershipOpportunities || [])
              .slice(0, 8)
              .map((p) => [p.destination, p.demandCount, p.suggestedAction])}
          />
        </div>
      </div>
    </div>
  );
}

function ClubEngagementReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalClubs: number;
    clubsWithMembers: number;
    clubsWithAdmins: number;
    totalMembers: number;
    totalAdmins: number;
    recentlyActiveUsers: number;
  };
  const topClubsByMembers = data.topClubsByMembers as {
    name: string;
    location: string;
    memberCount: number;
    adminCount: number;
    eventCount: number;
    lastActivity: string;
  }[];
  const topClubsByAdmins = data.topClubsByAdmins as {
    name: string;
    location: string;
    memberCount: number;
    adminCount: number;
    eventCount: number;
    lastActivity: string;
  }[];
  const roleDistribution = data.roleDistribution as {
    role: string;
    count: number;
  }[];
  const monthlyGrowth = data.monthlyGrowth as {
    month: string;
    newMembers: number;
  }[];
  const clubEngagement = data.clubEngagement as {
    name: string;
    location: string;
    memberCount: number;
    adminCount: number;
    eventCount: number;
    lastActivity: string;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Clubs" value={summary?.totalClubs || 0} />
        <StatCard
          label="Clubs with Members"
          value={summary?.clubsWithMembers || 0}
        />
        <StatCard
          label="Clubs with Admins"
          value={summary?.clubsWithAdmins || 0}
        />
        <StatCard label="Total Members" value={summary?.totalMembers || 0} />
        <StatCard label="Total Admins" value={summary?.totalAdmins || 0} />
        <StatCard
          label="Active (30 days)"
          value={summary?.recentlyActiveUsers || 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Top Clubs by Members</h3>
          <DataTable
            headers={["Club", "Members", "Admins", "Last Active"]}
            rows={(topClubsByMembers || [])
              .slice(0, 8)
              .map((c) => [
                c.name,
                c.memberCount,
                c.adminCount,
                c.lastActivity,
              ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Top Clubs by Admins</h3>
          <DataTable
            headers={["Club", "Admins", "Members", "Events"]}
            rows={(topClubsByAdmins || [])
              .slice(0, 8)
              .map((c) => [c.name, c.adminCount, c.memberCount, c.eventCount])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">User Role Distribution</h3>
          <DataTable
            headers={["Role", "Count"]}
            rows={(roleDistribution || []).map((r) => [r.role, r.count])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Monthly Membership Growth</h3>
          <DataTable
            headers={["Month", "New Members"]}
            rows={(monthlyGrowth || []).map((m) => [m.month, m.newMembers])}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Club Engagement Overview</h3>
        <DataTable
          headers={[
            "Club",
            "Location",
            "Members",
            "Admins",
            "Events",
            "Last Active",
          ]}
          rows={(clubEngagement || [])
            .slice(0, 15)
            .map((c) => [
              c.name,
              c.location,
              c.memberCount,
              c.adminCount,
              c.eventCount,
              c.lastActivity,
            ])}
        />
      </div>
    </div>
  );
}

function SportPerformanceReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalSports: number;
    totalClubSportOfferings: number;
    totalSportEvents: number;
    topSport: string;
  };
  const sportPerformance = data.sportPerformance as {
    sport: string;
    clubCount: number;
    eventCount: number;
    upcomingEvents: number;
    completedEvents: number;
    teamRegistrations: number;
    interestSubmissions: number;
    tournamentInterests: number;
    engagementScore: number;
  }[];
  const sportTrends = data.sportTrends as {
    sport: string;
    recentInterests: number;
    previousInterests: number;
    growthPercent: number;
  }[];
  const countryDiversity = data.countryDiversity as {
    country: string;
    sportCount: number;
    topSport: string;
    clubCount: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Sports Tracked" value={summary?.totalSports || 0} />
        <StatCard
          label="Club Sport Offerings"
          value={summary?.totalClubSportOfferings || 0}
        />
        <StatCard label="Sport Events" value={summary?.totalSportEvents || 0} />
        <StatCard label="Top Sport" value={summary?.topSport || "-"} />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Sport Performance Rankings</h3>
        <DataTable
          headers={[
            "Sport",
            "Clubs",
            "Events",
            "Registrations",
            "Interests",
            "Score",
          ]}
          rows={(sportPerformance || [])
            .slice(0, 12)
            .map((s) => [
              s.sport,
              s.clubCount,
              s.eventCount,
              s.teamRegistrations,
              s.tournamentInterests,
              s.engagementScore,
            ])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">30-Day Sport Trends</h3>
          <DataTable
            headers={["Sport", "Recent", "Previous", "Growth"]}
            rows={(sportTrends || []).map((t) => [
              t.sport,
              t.recentInterests,
              t.previousInterests,
              `${t.growthPercent > 0 ? "+" : ""}${t.growthPercent}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Sport Diversity by Country</h3>
          <DataTable
            headers={["Country", "Sports", "Top Sport", "Clubs"]}
            rows={(countryDiversity || [])
              .slice(0, 10)
              .map((c) => [c.country, c.sportCount, c.topSport, c.clubCount])}
          />
        </div>
      </div>
    </div>
  );
}

function ClubTripsReport({ data }: { data: Record<string, unknown> }) {
  const irelandSummary = data.irelandSummary as {
    totalClubs: number;
    clubsWithTrips: number;
    totalTrips: number;
    participationRate: number;
  };
  const internationalSummary = data.internationalSummary as {
    totalClubs: number;
    clubsWithBookings: number;
    totalCompletedBookings: number;
    hostingRate: number;
  };
  const topIrelandClubs = data.topIrelandClubs as {
    name: string;
    county: string;
    location: string;
    tripCount: number;
    lastTrip: string;
  }[];
  const topInternationalClubs = data.topInternationalClubs as {
    name: string;
    country: string;
    unit: string;
    bookingsCompleted: number;
    teamsHosted: number;
  }[];
  const tripsByCounty = data.tripsByCounty as {
    county: string;
    trips: number;
  }[];
  const bookingsByCountry = data.bookingsByCountry as {
    country: string;
    bookings: number;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>🇮🇪</span> Ireland - Trips Participated
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Clubs"
              value={irelandSummary?.totalClubs || 0}
            />
            <StatCard
              label="Clubs with Trips"
              value={irelandSummary?.clubsWithTrips || 0}
            />
            <StatCard
              label="Total Trips"
              value={irelandSummary?.totalTrips || 0}
            />
            <StatCard
              label="Participation Rate"
              value={`${irelandSummary?.participationRate || 0}%`}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>🌍</span> International - Bookings Hosted
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Clubs"
              value={internationalSummary?.totalClubs || 0}
            />
            <StatCard
              label="Clubs Hosting"
              value={internationalSummary?.clubsWithBookings || 0}
            />
            <StatCard
              label="Completed Bookings"
              value={internationalSummary?.totalCompletedBookings || 0}
            />
            <StatCard
              label="Hosting Rate"
              value={`${internationalSummary?.hostingRate || 0}%`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3 text-green-700">
            Top Ireland Clubs by Trips
          </h3>
          <DataTable
            headers={["Club", "County", "Trips", "Last Trip"]}
            rows={(topIrelandClubs || []).map((c) => [
              c.name,
              c.county,
              c.tripCount,
              c.lastTrip,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-blue-700">
            Top International Clubs by Hosting
          </h3>
          <DataTable
            headers={["Club", "Country", "Bookings", "Teams Hosted"]}
            rows={(topInternationalClubs || []).map((c) => [
              c.name,
              c.country,
              c.bookingsCompleted,
              c.teamsHosted,
            ])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Trips by County (Ireland)</h3>
          <DataTable
            headers={["County", "Trips"]}
            rows={(tripsByCounty || []).map((c) => [c.county, c.trips])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Bookings by Country</h3>
          <DataTable
            headers={["Country", "Bookings"]}
            rows={(bookingsByCountry || []).map((c) => [c.country, c.bookings])}
          />
        </div>
      </div>
    </div>
  );
}

function TripRequestsReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalResponses: number;
    withFeedback: number;
    linkedToEvent: number;
    withPreferredMonths: number;
    withSpecificDestination: number;
    feedbackRate: number;
    eventLinkRate: number;
  };
  const byRole = data.byRole as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byCountry = data.byCountry as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const bySportCode = data.bySportCode as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byPreferredMonth = data.byPreferredMonth as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const bySpecificDestination = data.bySpecificDestination as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byBudget = data.byBudget as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byTeamSize = data.byTeamSize as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byService = data.byService as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byChallenge = data.byChallenge as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byTravelTime = data.byTravelTime as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const byTraveledAbroad = data.byTraveledAbroad as {
    name: string;
    count: number;
    percentage: number;
  }[];
  const monthlyTrends = data.monthlyTrends as {
    month: string;
    count: number;
  }[];
  const recentSubmissions = data.recentSubmissions as {
    contactName: string;
    contactEmail: string;
    role: string;
    country: string;
    clubName: string | null;
    sportCode: string | null;
    specificDestination: string | null;
    budget: string | null;
    teamSize: string | null;
    submittedAt: string;
    eventTitle: string | null;
  }[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={summary?.totalResponses || 0} />
        <StatCard
          label="With Travel Dates"
          value={summary?.withPreferredMonths || 0}
        />
        <StatCard
          label="Specific Destination"
          value={summary?.withSpecificDestination || 0}
        />
        <StatCard label="With Feedback" value={summary?.withFeedback || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">By Role</h3>
          <DataTable
            headers={["Role", "Count", "%"]}
            rows={(byRole || []).map((r) => [
              r.name,
              r.count,
              `${r.percentage}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">By Country</h3>
          <DataTable
            headers={["Country", "Count", "%"]}
            rows={(byCountry || [])
              .slice(0, 10)
              .map((c) => [c.name, c.count, `${c.percentage}%`])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">By Sport Code</h3>
          <DataTable
            headers={["Sport", "Count", "%"]}
            rows={(bySportCode || []).map((s) => [
              s.name,
              s.count,
              `${s.percentage}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Preferred Travel Months</h3>
          <DataTable
            headers={["Month", "Count", "%"]}
            rows={(byPreferredMonth || []).map((m) => [
              m.name,
              m.count,
              `${m.percentage}%`,
            ])}
          />
        </div>
      </div>

      {(bySpecificDestination || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">
            Specific Destinations Mentioned
          </h3>
          <DataTable
            headers={["Destination", "Count", "%"]}
            rows={(bySpecificDestination || [])
              .slice(0, 15)
              .map((d) => [d.name, d.count, `${d.percentage}%`])}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Budget per Person</h3>
          <DataTable
            headers={["Budget Range", "Count", "%"]}
            rows={(byBudget || []).map((b) => [
              b.name,
              b.count,
              `${b.percentage}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Team Size</h3>
          <DataTable
            headers={["Team Size", "Count", "%"]}
            rows={(byTeamSize || []).map((t) => [
              t.name,
              t.count,
              `${t.percentage}%`,
            ])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Services Interested In</h3>
          <DataTable
            headers={["Service", "Count", "%"]}
            rows={(byService || []).map((s) => [
              s.name,
              s.count,
              `${s.percentage}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Biggest Challenges</h3>
          <DataTable
            headers={["Challenge", "Count", "%"]}
            rows={(byChallenge || []).map((c) => [
              c.name,
              c.count,
              `${c.percentage}%`,
            ])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Preferred Travel Time</h3>
          <DataTable
            headers={["Time", "Count", "%"]}
            rows={(byTravelTime || []).map((t) => [
              t.name,
              t.count,
              `${t.percentage}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Travel Experience</h3>
          <DataTable
            headers={["Has Traveled Abroad", "Count", "%"]}
            rows={(byTraveledAbroad || []).map((t) => [
              t.name,
              t.count,
              `${t.percentage}%`,
            ])}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Monthly Submission Trends</h3>
        <DataTable
          headers={["Month", "Submissions"]}
          rows={(monthlyTrends || []).map((m) => [m.month, m.count])}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Recent Submissions</h3>
        <DataTable
          headers={[
            "Contact",
            "Role",
            "Country",
            "Sport",
            "Destination",
            "Date",
          ]}
          rows={(recentSubmissions || []).map((r) => [
            r.contactName,
            r.role,
            r.country,
            r.sportCode || "-",
            r.specificDestination || "-",
            new Date(r.submittedAt).toLocaleDateString(),
          ])}
        />
      </div>
    </div>
  );
}

function EventApprovalsReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalSubmissions: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
    rejectionRate: number;
    avgApprovalTimeHours: number;
  };
  const appeals = data.appeals as {
    totalAppeals: number;
    pendingAppeals: number;
    deniedAppeals: number;
    approvedAppeals: number;
    appealRate: number;
    appealSuccessRate: number;
  };
  const marketingHighlight = data.marketingHighlight as {
    message: string;
    approvalRate: number;
    rejectionRate: number;
  };
  const monthlyTrends = data.monthlyTrends as {
    month: string;
    approved: number;
    rejected: number;
    total: number;
    approvalRate: number;
  }[];
  const byEventType = data.byEventType as {
    type: string;
    approved: number;
    rejected: number;
    total: number;
    approvalRate: number;
  }[];
  const rejectionReasons = data.rejectionReasons as {
    reason: string;
    count: number;
  }[];
  const recentRejections = data.recentRejections as {
    title: string;
    eventType: string;
    clubName: string;
    reason: string | null;
    hasAppeal: boolean;
    appealStatus: string | null;
    createdAt: string;
  }[];
  const recentAppeals = data.recentAppeals as {
    title: string;
    eventType: string;
    clubName: string;
    appealStatus: string;
    appealedAt: string | null;
    resolvedAt: string | null;
    resolution: string | null;
  }[];

  return (
    <div className="space-y-6">
      {/* Marketing Highlight Banner */}
      {marketingHighlight && (
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-6 text-white text-center">
          <p className="text-2xl font-bold">{marketingHighlight.message}</p>
          <p className="text-emerald-100 mt-2">
            Use this statistic in your marketing materials
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Submissions"
          value={summary?.totalSubmissions || 0}
        />
        <StatCard label="Approved" value={summary?.approved || 0} />
        <StatCard label="Rejected" value={summary?.rejected || 0} />
        <StatCard label="Pending" value={summary?.pending || 0} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Approval Rate"
          value={`${summary?.approvalRate || 0}%`}
          subtext="Events approved"
        />
        <StatCard
          label="Rejection Rate"
          value={`${summary?.rejectionRate || 0}%`}
          subtext="Events rejected"
        />
        <StatCard
          label="Avg Approval Time"
          value={`${summary?.avgApprovalTimeHours || 0}h`}
          subtext="Hours to approval"
        />
      </div>

      {/* Appeals Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">Appeal Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Appeals" value={appeals?.totalAppeals || 0} />
          <StatCard label="Pending" value={appeals?.pendingAppeals || 0} />
          <StatCard label="Denied" value={appeals?.deniedAppeals || 0} />
          <StatCard label="Approved" value={appeals?.approvedAppeals || 0} />
          <StatCard
            label="Appeal Rate"
            value={`${appeals?.appealRate || 0}%`}
            subtext="Of rejected events"
          />
          <StatCard
            label="Success Rate"
            value={`${appeals?.appealSuccessRate || 0}%`}
            subtext="Appeals approved"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Monthly Approval Trends</h3>
        <DataTable
          headers={["Month", "Total", "Approved", "Rejected", "Rate"]}
          rows={(monthlyTrends || []).map((m) => [
            m.month,
            m.total,
            m.approved,
            m.rejected,
            `${m.approvalRate}%`,
          ])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">By Event Type</h3>
          <DataTable
            headers={["Type", "Total", "Approved", "Rate"]}
            rows={(byEventType || []).map((e) => [
              e.type,
              e.total,
              e.approved,
              `${e.approvalRate}%`,
            ])}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Top Rejection Reasons</h3>
          <DataTable
            headers={["Reason", "Count"]}
            rows={(rejectionReasons || []).map((r) => [r.reason, r.count])}
          />
        </div>
      </div>

      {(recentRejections || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Recent Rejections</h3>
          <DataTable
            headers={["Event", "Type", "Club", "Has Appeal", "Status"]}
            rows={(recentRejections || [])
              .slice(0, 8)
              .map((r) => [
                r.title,
                r.eventType || "-",
                r.clubName,
                r.hasAppeal ? "Yes" : "No",
                r.appealStatus || "-",
              ])}
          />
        </div>
      )}

      {(recentAppeals || []).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Recent Appeals</h3>
          <DataTable
            headers={["Event", "Type", "Club", "Status", "Resolution"]}
            rows={(recentAppeals || [])
              .slice(0, 8)
              .map((a) => [
                a.title,
                a.eventType || "-",
                a.clubName,
                a.appealStatus,
                a.resolution || "-",
              ])}
          />
        </div>
      )}
    </div>
  );
}

function GGEInterestReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalRegistrations: number;
    recentRegistrations: number;
    uniqueCounties: number;
  };
  const eventTypeCounts = data.eventTypeCounts as {
    DADS_AND_LADS: number;
    GAELIC4MOTHERS_AND_OTHERS: number;
    SOCIAL_CAMOGIE: number;
  };
  const countyBreakdown = data.countyBreakdown as {
    county: string;
    count: number;
  }[];
  const playerBreakdown = data.playerBreakdown as Record<string, number>;
  const participationBreakdown = data.participationBreakdown as Record<
    string,
    number
  >;
  const monthlyTrend = data.monthlyTrend as Record<string, number>;
  const registrations = data.registrations as {
    id: string;
    clubName: string;
    county: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
    eventTypes: string[];
    estimatedPlayers: string | null;
    previousParticipation: string | null;
    additionalNotes: string | null;
    createdAt: string;
  }[];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Stats Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-2xl sm:text-4xl font-bold">
              {summary?.totalRegistrations || 0}
            </p>
            <p className="text-rose-100 text-[10px] sm:text-sm">
              Total Registrations
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-4xl font-bold">
              {summary?.recentRegistrations || 0}
            </p>
            <p className="text-rose-100 text-[10px] sm:text-sm">Last 7 Days</p>
          </div>
          <div>
            <p className="text-2xl sm:text-4xl font-bold">
              {summary?.uniqueCounties || 0}
            </p>
            <p className="text-rose-100 text-[10px] sm:text-sm">
              Counties Represented
            </p>
          </div>
        </div>
      </div>

      {/* Interest by Event Type */}
      <div>
        <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
          Interest by Event Type
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-pink-50 border border-pink-200 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-pink-600">
              {eventTypeCounts?.GAELIC4MOTHERS_AND_OTHERS || 0}
            </p>
            <p className="text-xs sm:text-sm text-pink-700 font-medium">G4MO</p>
            <p className="text-[10px] sm:text-xs text-pink-500 hidden sm:block">
              Gaelic for Mothers & Others
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-blue-600">
              {eventTypeCounts?.DADS_AND_LADS || 0}
            </p>
            <p className="text-xs sm:text-sm text-blue-700 font-medium">
              Dads & Lads
            </p>
            <p className="text-[10px] sm:text-xs text-blue-500 hidden sm:block">
              Fathers & Sons Events
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-purple-600">
              {eventTypeCounts?.SOCIAL_CAMOGIE || 0}
            </p>
            <p className="text-xs sm:text-sm text-purple-700 font-medium whitespace-nowrap">
              Social Camogie
            </p>
            <p className="text-[10px] sm:text-xs text-purple-500 hidden sm:block">
              Social Camogie Events
            </p>
          </div>
        </div>
      </div>

      {/* County Breakdown */}
      {countyBreakdown && countyBreakdown.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            Top Counties
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {countyBreakdown.slice(0, 10).map((county, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3">
                <span className="w-16 sm:w-24 text-xs sm:text-sm text-gray-600 truncate">
                  {county.county}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-4">
                  <div
                    className="bg-pink-500 h-3 sm:h-4 rounded-full transition-all"
                    style={{
                      width: `${(county.count / countyBreakdown[0].count) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-6 sm:w-8 text-xs sm:text-sm font-medium text-gray-700 text-right">
                  {county.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Estimates & Previous Participation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {playerBreakdown && Object.keys(playerBreakdown).length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              Estimated Players
            </h3>
            <div className="space-y-1.5 sm:space-y-2">
              {Object.entries(playerBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([range, count], idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-xs sm:text-sm text-gray-600">
                      {range}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {participationBreakdown &&
          Object.keys(participationBreakdown).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Previous Participation
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                {Object.entries(participationBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([participation, count], idx) => (
                    <div
                      key={idx}
                      className="flex justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-xs sm:text-sm text-gray-600">
                        {participation}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>

      {/* Monthly Trend */}
      {monthlyTrend && Object.keys(monthlyTrend).length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            Monthly Registration Trend
          </h3>
          <div className="flex items-end gap-1 sm:gap-2 h-24 sm:h-32">
            {Object.entries(monthlyTrend)
              .slice(-6)
              .map(([month, count], idx) => {
                const maxCount = Math.max(
                  ...Object.values(monthlyTrend).slice(-6)
                );
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1"
                  >
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                      {count}
                    </span>
                    <div
                      className="w-full bg-pink-500 rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                    />
                    <span className="text-[8px] sm:text-xs text-gray-500 whitespace-nowrap">
                      {month}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Registrations */}
      {registrations && registrations.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            Recent Registrations ({registrations.length} total)
          </h3>
          {/* Mobile: Card view */}
          <div className="sm:hidden space-y-2">
            {registrations.slice(0, 10).map((reg) => (
              <div key={reg.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {reg.clubName}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(reg.createdAt).toLocaleDateString("en-IE")}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">{reg.county}</div>
                <div className="flex flex-wrap gap-1">
                  {reg.eventTypes.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded"
                    >
                      {t === "GAELIC4MOTHERS_AND_OTHERS"
                        ? "G4MO"
                        : t === "DADS_AND_LADS"
                          ? "Dads & Lads"
                          : t === "SOCIAL_CAMOGIE"
                            ? "Social Camogie"
                            : t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: Table view */}
          <div className="hidden sm:block overflow-x-auto">
            <DataTable
              headers={[
                "Club",
                "County",
                "Contact",
                "Event Types",
                "Est. Players",
                "Date",
              ]}
              rows={registrations
                .slice(0, 15)
                .map((reg) => [
                  reg.clubName,
                  reg.county,
                  reg.contactName,
                  reg.eventTypes
                    .map((t) =>
                      t === "GAELIC4MOTHERS_AND_OTHERS"
                        ? "G4MO"
                        : t === "DADS_AND_LADS"
                          ? "Dads & Lads"
                          : t === "SOCIAL_CAMOGIE"
                            ? "Social Camogie"
                            : t
                    )
                    .join(", "),
                  reg.estimatedPlayers || "-",
                  new Date(reg.createdAt).toLocaleDateString("en-IE"),
                ])}
            />
          </div>
        </div>
      )}

      {/* Development Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-base sm:text-xl">🚧</span>
          <div>
            <h4 className="font-medium text-amber-800 text-sm sm:text-base">
              Feature In Development
            </h4>
            <p className="text-xs sm:text-sm text-amber-700 mt-1">
              This report tracks Social GAA interest registrations. Upcoming
              features include: applicant travel status tracking, fair
              allocation scoring based on participation history, and automated
              follow-up reminders for clubs who haven&apos;t yet travelled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function YouthGAAReport({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as {
    totalYouthEvents: number;
    upcomingYouthEvents: number;
    pastYouthEvents: number;
    totalYouthRegistrations: number;
    totalYouthInterests: number;
    activeCounties: number;
  };
  const demographics = data.demographics as {
    ageGroupBreakdown: {
      ageGroup: string;
      ageGroupKey: string;
      events: number;
      registrations: number;
    }[];
  };
  const countyAnalysis = data.countyAnalysis as {
    ranking: {
      county: string;
      trips: number;
      activeClubs: number;
      interests: number;
      score: number;
    }[];
    byTrips: { county: string; trips: number }[];
    byActiveClubs: { county: string; activeClubs: number }[];
    byInterests: { county: string; interests: number }[];
  };
  const topYouthClubs = data.topYouthClubs as {
    name: string;
    county: string;
    location: string;
    youthTrips: number;
    lastEvent: string;
  }[];
  const recentYouthEvents = data.recentYouthEvents as {
    id: string;
    title: string;
    location: string;
    startDate: string;
    hostClub: string;
    registrations: number;
    teamTypes: string[];
  }[];
  const monthlyTrend = data.monthlyTrend as {
    month: string;
    events: number;
    registrations: number;
  }[];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Stats Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-xl sm:text-3xl font-bold">
              {summary?.totalYouthEvents || 0}
            </p>
            <p className="text-emerald-100 text-[10px] sm:text-sm">
              Youth Events
            </p>
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-bold">
              {summary?.upcomingYouthEvents || 0}
            </p>
            <p className="text-emerald-100 text-[10px] sm:text-sm">Upcoming</p>
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-bold">
              {summary?.totalYouthRegistrations || 0}
            </p>
            <p className="text-emerald-100 text-[10px] sm:text-sm">
              Registrations
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xl sm:text-3xl font-bold">
              {summary?.totalYouthInterests || 0}
            </p>
            <p className="text-emerald-100 text-[10px] sm:text-sm">Interests</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xl sm:text-3xl font-bold">
              {summary?.activeCounties || 0}
            </p>
            <p className="text-emerald-100 text-[10px] sm:text-sm">
              Active Counties
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xl sm:text-3xl font-bold">
              {summary?.pastYouthEvents || 0}
            </p>
            <p className="text-emerald-100 text-[10px] sm:text-sm">Completed</p>
          </div>
        </div>
      </div>

      {/* Age Group Demographics */}
      {demographics?.ageGroupBreakdown &&
        demographics.ageGroupBreakdown.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              Age Group Demographics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {demographics.ageGroupBreakdown.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg sm:rounded-xl p-2 sm:p-4"
                >
                  <p className="text-lg sm:text-2xl font-bold text-emerald-700">
                    {group.registrations}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-600 font-medium">
                    {group.ageGroup}
                  </p>
                  <p className="text-[10px] sm:text-xs text-emerald-500">
                    {group.events} events
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* County Analysis - Three Tabs */}
      <div>
        <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
          County Analysis
        </h3>

        {/* Combined Ranking */}
        {countyAnalysis?.ranking && countyAnalysis.ranking.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden mb-4">
            <div className="bg-emerald-50 px-3 sm:px-4 py-2 border-b border-emerald-100">
              <h4 className="font-medium text-emerald-800 text-xs sm:text-sm">
                Overall County Rankings (Youth GAA Activity)
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-600">
                      Rank
                    </th>
                    <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-600">
                      County
                    </th>
                    <th className="text-center py-2 px-2 sm:px-3 font-medium text-gray-600">
                      Trips
                    </th>
                    <th className="text-center py-2 px-2 sm:px-3 font-medium text-gray-600">
                      Active Clubs
                    </th>
                    <th className="text-center py-2 px-2 sm:px-3 font-medium text-gray-600">
                      Interests
                    </th>
                    <th className="text-center py-2 px-2 sm:px-3 font-medium text-gray-600">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {countyAnalysis.ranking.slice(0, 15).map((county, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 ${idx < 3 ? "bg-emerald-50/50" : ""}`}
                    >
                      <td className="py-2 px-2 sm:px-3">
                        {idx === 0 ? (
                          <span className="text-amber-500">🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-gray-400">🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-700">🥉</span>
                        ) : (
                          <span className="text-gray-500">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-2 px-2 sm:px-3 font-medium text-gray-800">
                        {county.county}
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-center text-emerald-600">
                        {county.trips}
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-center text-blue-600">
                        {county.activeClubs}
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-center text-purple-600">
                        {county.interests}
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-center font-bold text-emerald-700">
                        {county.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Individual Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Most Trips */}
          {countyAnalysis?.byTrips && countyAnalysis.byTrips.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="font-medium text-emerald-800 mb-2 text-xs sm:text-sm flex items-center gap-1">
                <Plane className="w-3 h-3 sm:w-4 sm:h-4" />
                Most Trips
              </h4>
              <div className="space-y-1">
                {countyAnalysis.byTrips.slice(0, 8).map((county, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs sm:text-sm"
                  >
                    <span className="text-gray-700 truncate">
                      {county.county}
                    </span>
                    <span className="font-medium text-emerald-700">
                      {county.trips}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Active Clubs */}
          {countyAnalysis?.byActiveClubs &&
            countyAnalysis.byActiveClubs.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-medium text-blue-800 mb-2 text-xs sm:text-sm flex items-center gap-1">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Most Active Clubs
                </h4>
                <div className="space-y-1">
                  {countyAnalysis.byActiveClubs
                    .slice(0, 8)
                    .map((county, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-xs sm:text-sm"
                      >
                        <span className="text-gray-700 truncate">
                          {county.county}
                        </span>
                        <span className="font-medium text-blue-700">
                          {county.activeClubs}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Most Interests */}
          {countyAnalysis?.byInterests &&
            countyAnalysis.byInterests.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-medium text-purple-800 mb-2 text-xs sm:text-sm flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  Most Interests
                </h4>
                <div className="space-y-1">
                  {countyAnalysis.byInterests.slice(0, 8).map((county, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs sm:text-sm"
                    >
                      <span className="text-gray-700 truncate">
                        {county.county}
                      </span>
                      <span className="font-medium text-purple-700">
                        {county.interests}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Top Youth Clubs */}
      {topYouthClubs && topYouthClubs.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            Top Youth Clubs
          </h3>
          <DataTable
            headers={["Club", "County", "Trips", "Last Event"]}
            rows={topYouthClubs
              .slice(0, 10)
              .map((club) => [
                club.name,
                club.county,
                club.youthTrips,
                club.lastEvent.length > 25
                  ? club.lastEvent.substring(0, 25) + "..."
                  : club.lastEvent,
              ])}
          />
        </div>
      )}

      {/* Recent Youth Events */}
      {recentYouthEvents && recentYouthEvents.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            Recent Youth Events
          </h3>
          <div className="space-y-2">
            {recentYouthEvents.slice(0, 6).map((event, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-2 sm:p-3 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                    {event.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {event.location} • {event.hostClub}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.teamTypes.slice(0, 3).map((type, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {event.registrations} teams
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {new Date(event.startDate).toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trend */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
            Monthly Trend
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {monthlyTrend.slice(0, 6).map((month, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {month.month}
                </p>
                <p className="text-sm sm:text-lg font-bold text-emerald-600">
                  {month.events}
                </p>
                <p className="text-[10px] text-gray-400">
                  {month.registrations} reg
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
