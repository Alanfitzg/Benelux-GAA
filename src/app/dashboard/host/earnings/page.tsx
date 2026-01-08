"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Ticket,
  Calendar,
  ChevronDown,
  ChevronUp,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Download,
  FileSpreadsheet,
} from "lucide-react";

interface EarningsOverview {
  totalEarnings: number;
  totalReleased: number;
  totalPending: number;
  totalWithheld: number;
  platformFeesGenerated: number;
  hostPlatformFeeShare: number;
  teamTicketEarnings: number;
  dayPassEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  thisYearEarnings: number;
}

interface PaymentRecord {
  id: string;
  type: "TEAM_TICKET" | "DAY_PASS" | "DEPOSIT" | "FULL_PAYMENT";
  status: "PENDING" | "RELEASED" | "WITHHELD" | "COMPLETED";
  amount: number;
  hostEarnings: number;
  platformFee: number;
  platformFeeShare: number;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  releasedAt: string | null;
  withheldReason: string | null;
  booking: {
    id: string;
    teamName: string;
    arrivalDate: string;
    departureDate: string;
    club: {
      name: string;
    };
  };
}

interface MonthlyBreakdown {
  month: string;
  year: number;
  teamTickets: number;
  dayPasses: number;
  total: number;
  released: number;
  pending: number;
}

interface EventBreakdown {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  teamTicketRevenue: number;
  dayPassRevenue: number;
  totalRevenue: number;
  teamsHosted: number;
  playersHosted: number;
}

type ExportPeriod = "weekly" | "monthly" | "quarterly" | "annually" | "all";

export default function EarningsPage() {
  const { status } = useSession();
  const [overview, setOverview] = useState<EarningsOverview | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>(
    []
  );
  const [eventBreakdown, setEventBreakdown] = useState<EventBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "events" | "monthly"
  >("overview");
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(
    new Set()
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchEarningsData();
    }
  }, [status]);

  const fetchEarningsData = async () => {
    try {
      const [overviewRes, paymentsRes, monthlyRes, eventsRes] =
        await Promise.all([
          fetch("/api/dashboard/host/earnings/overview"),
          fetch("/api/dashboard/host/earnings/transactions"),
          fetch("/api/dashboard/host/earnings/monthly"),
          fetch("/api/dashboard/host/earnings/events"),
        ]);

      if (overviewRes.ok) {
        setOverview(await overviewRes.json());
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }
      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyBreakdown(data.breakdown || []);
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEventBreakdown(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch earnings data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RELEASED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Released
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "WITHHELD":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Withheld
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "TEAM_TICKET":
        return (
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            <Ticket className="w-3 h-3 mr-1" /> Team Ticket
          </Badge>
        );
      case "DAY_PASS":
        return (
          <Badge
            variant="outline"
            className="text-purple-700 border-purple-300"
          >
            <Users className="w-3 h-3 mr-1" /> Day Pass
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const togglePaymentExpanded = (id: string) => {
    const newExpanded = new Set(expandedPayments);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPayments(newExpanded);
  };

  const getMonthChange = () => {
    if (!overview || overview.lastMonthEarnings === 0) return null;
    const change =
      ((overview.thisMonthEarnings - overview.lastMonthEarnings) /
        overview.lastMonthEarnings) *
      100;
    return Math.round(change);
  };

  const getDateRangeForPeriod = (
    period: ExportPeriod
  ): { start: Date; end: Date; label: string } => {
    const now = new Date();
    const end = new Date(now);
    let start: Date;
    let label: string;

    switch (period) {
      case "weekly":
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        label = "Last 7 Days";
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        label = now.toLocaleDateString("en-IE", {
          month: "long",
          year: "numeric",
        });
        break;
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        label = `Q${quarter + 1} ${now.getFullYear()}`;
        break;
      case "annually":
        start = new Date(now.getFullYear(), 0, 1);
        label = `${now.getFullYear()}`;
        break;
      case "all":
      default:
        start = new Date(2020, 0, 1);
        label = "All Time";
        break;
    }

    return { start, end, label };
  };

  const exportToCSV = async (period: ExportPeriod) => {
    setExporting(true);
    setShowExportMenu(false);

    try {
      const { start, end, label } = getDateRangeForPeriod(period);

      const filteredPayments = payments.filter((p) => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end;
      });

      if (filteredPayments.length === 0 && period !== "all") {
        alert(`No transactions found for ${label}`);
        setExporting(false);
        return;
      }

      const dataToExport = period === "all" ? payments : filteredPayments;

      const headers = [
        "Date",
        "Team Name",
        "Type",
        "Status",
        "Total Amount",
        "Your Earnings",
        "Platform Fee",
        "Platform Fee Share",
        "Quantity",
        "Arrival Date",
        "Departure Date",
      ];

      const rows = dataToExport.map((p) => [
        formatDate(p.createdAt),
        p.booking.teamName,
        p.type.replace("_", " "),
        p.status,
        p.amount.toFixed(2),
        p.hostEarnings.toFixed(2),
        p.platformFee.toFixed(2),
        p.platformFeeShare.toFixed(2),
        p.quantity.toString(),
        formatDate(p.booking.arrivalDate),
        formatDate(p.booking.departureDate),
      ]);

      const totals = dataToExport.reduce(
        (acc, p) => ({
          amount: acc.amount + p.amount,
          hostEarnings: acc.hostEarnings + p.hostEarnings,
          platformFee: acc.platformFee + p.platformFee,
          platformFeeShare: acc.platformFeeShare + p.platformFeeShare,
        }),
        { amount: 0, hostEarnings: 0, platformFee: 0, platformFeeShare: 0 }
      );

      rows.push([]);
      rows.push([
        "TOTALS",
        "",
        "",
        "",
        totals.amount.toFixed(2),
        totals.hostEarnings.toFixed(2),
        totals.platformFee.toFixed(2),
        totals.platformFeeShare.toFixed(2),
        "",
        "",
        "",
      ]);

      const csvContent = [
        `Earnings Report - ${label}`,
        `Generated: ${new Date().toLocaleDateString("en-IE")}`,
        "",
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `earnings-${period}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please sign in to view earnings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/host">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
              <p className="text-sm text-gray-500">
                Financial overview of your hosting revenue
              </p>
            </div>
          </div>

          {/* Export Button */}
          <div className="relative">
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Export Period
                    </p>
                  </div>
                  {[
                    {
                      id: "weekly" as ExportPeriod,
                      label: "Last 7 Days",
                      icon: Calendar,
                    },
                    {
                      id: "monthly" as ExportPeriod,
                      label: "This Month",
                      icon: Calendar,
                    },
                    {
                      id: "quarterly" as ExportPeriod,
                      label: "This Quarter",
                      icon: BarChart3,
                    },
                    {
                      id: "annually" as ExportPeriod,
                      label: "This Year",
                      icon: BarChart3,
                    },
                    {
                      id: "all" as ExportPeriod,
                      label: "All Time",
                      icon: Download,
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => exportToCSV(option.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <option.icon className="w-4 h-4 text-gray-400" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Stats Hero */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <p className="text-emerald-100 text-sm font-medium mb-1">
                Total Earnings
              </p>
              <p className="text-5xl font-bold tracking-tight">
                {overview ? formatCurrency(overview.totalEarnings) : "€0.00"}
              </p>
              <p className="text-emerald-100 mt-2">
                All-time revenue from hosting
              </p>

              {getMonthChange() !== null && (
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                  {getMonthChange()! >= 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {getMonthChange()}% vs last month
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {Math.abs(getMonthChange()!)}% vs last month
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100 text-sm">This Month</span>
                  <Calendar className="w-4 h-4 text-emerald-200" />
                </div>
                <p className="text-2xl font-bold mt-1">
                  {overview
                    ? formatCurrency(overview.thisMonthEarnings)
                    : "€0.00"}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100 text-sm">This Year</span>
                  <BarChart3 className="w-4 h-4 text-emerald-200" />
                </div>
                <p className="text-2xl font-bold mt-1">
                  {overview
                    ? formatCurrency(overview.thisYearEarnings)
                    : "€0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Released</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {overview
                      ? formatCurrency(overview.totalReleased)
                      : "€0.00"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Paid out to you</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {overview ? formatCurrency(overview.totalPending) : "€0.00"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Awaiting trip completion
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Withheld</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {overview
                      ? formatCurrency(overview.totalWithheld)
                      : "€0.00"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Under review</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Revenue */}
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Wallet className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Your Revenue</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Ticket className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Team Tickets</p>
                      <p className="text-xs text-gray-500">
                        From team registrations
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {overview
                      ? formatCurrency(overview.teamTicketEarnings)
                      : "€0.00"}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Day Passes</p>
                      <p className="text-xs text-gray-500">
                        Per-player revenue
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {overview
                      ? formatCurrency(overview.dayPassEarnings)
                      : "€0.00"}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Platform Fee Share
                      </p>
                      <p className="text-xs text-gray-500">
                        50% of day pass fees
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    +
                    {overview
                      ? formatCurrency(overview.hostPlatformFeeShare)
                      : "€0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Revenue (GGE) */}
          <Card className="bg-slate-800 text-white shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold">Platform Revenue (GGE)</h3>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                Revenue generated for Gaelic Games Europe through your hosting
                activities
              </p>

              <div className="bg-slate-700/50 rounded-xl p-6">
                <p className="text-slate-400 text-sm">Total Platform Fees</p>
                <p className="text-3xl font-bold mt-1">
                  {overview
                    ? formatCurrency(overview.platformFeesGenerated)
                    : "€0.00"}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  From team tickets & day passes
                </p>
              </div>

              <div className="mt-4 p-4 bg-slate-700/30 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">
                    Your share returned
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {overview
                      ? formatCurrency(overview.hostPlatformFeeShare)
                      : "€0.00"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6">
            <nav className="flex gap-6">
              {[
                { id: "transactions", label: "Transactions", icon: Wallet },
                { id: "events", label: "By Event", icon: Calendar },
                { id: "monthly", label: "Monthly", icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <>
                {payments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Transactions will appear here when teams book your hosting
                      services
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors"
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer"
                          onClick={() => togglePaymentExpanded(payment.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {getTypeBadge(payment.type)}
                                {getStatusBadge(payment.status)}
                              </div>
                              <p className="font-medium text-gray-900">
                                {payment.booking.teamName}
                              </p>
                              <p className="text-sm text-gray-400">
                                {formatDate(payment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-emerald-600">
                                +{formatCurrency(payment.hostEarnings)}
                              </p>
                              <p className="text-xs text-gray-400">
                                of {formatCurrency(payment.amount)}
                              </p>
                            </div>
                            {expandedPayments.has(payment.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </div>

                        {expandedPayments.has(payment.id) && (
                          <div className="bg-gray-50 p-4 border-t border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Total Collected</p>
                                <p className="font-medium text-gray-900">
                                  {formatCurrency(payment.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Your Earnings</p>
                                <p className="font-medium text-emerald-600">
                                  {formatCurrency(payment.hostEarnings)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Platform Fee</p>
                                <p className="font-medium text-gray-900">
                                  {formatCurrency(payment.platformFee)}
                                </p>
                              </div>
                              {payment.type === "DAY_PASS" && (
                                <div>
                                  <p className="text-gray-400">
                                    Your Fee Share
                                  </p>
                                  <p className="font-medium text-emerald-600">
                                    +{formatCurrency(payment.platformFeeShare)}
                                  </p>
                                </div>
                              )}
                              {payment.quantity > 0 && (
                                <div>
                                  <p className="text-gray-400">
                                    {payment.type === "TEAM_TICKET"
                                      ? "Teams"
                                      : "Players"}
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {payment.quantity}
                                  </p>
                                </div>
                              )}
                              {payment.releasedAt && (
                                <div>
                                  <p className="text-gray-400">Released On</p>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(payment.releasedAt)}
                                  </p>
                                </div>
                              )}
                              {payment.withheldReason && (
                                <div className="col-span-2">
                                  <p className="text-gray-400">
                                    Withheld Reason
                                  </p>
                                  <p className="font-medium text-red-600">
                                    {payment.withheldReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <>
                {eventBreakdown.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No event data yet
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Host tournaments to see revenue breakdown by event
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventBreakdown.map((event) => (
                      <div
                        key={event.eventId}
                        className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {event.eventTitle}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {formatDate(event.eventDate)}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(event.totalRevenue)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                              Team Tickets
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {formatCurrency(event.teamTicketRevenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                              Day Passes
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {formatCurrency(event.dayPassRevenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                              Teams
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {event.teamsHosted}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                              Players
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {event.playersHosted}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Monthly Tab */}
            {activeTab === "monthly" && (
              <>
                {monthlyBreakdown.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No monthly data yet
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Monthly earnings will appear here as you host teams
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                          <th className="pb-4 font-medium">Month</th>
                          <th className="pb-4 font-medium text-right">
                            Team Tickets
                          </th>
                          <th className="pb-4 font-medium text-right">
                            Day Passes
                          </th>
                          <th className="pb-4 font-medium text-right">Total</th>
                          <th className="pb-4 font-medium text-right">
                            Released
                          </th>
                          <th className="pb-4 font-medium text-right">
                            Pending
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {monthlyBreakdown.map((month, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-4 font-medium text-gray-900">
                              {month.month} {month.year}
                            </td>
                            <td className="py-4 text-right text-gray-600">
                              {formatCurrency(month.teamTickets)}
                            </td>
                            <td className="py-4 text-right text-gray-600">
                              {formatCurrency(month.dayPasses)}
                            </td>
                            <td className="py-4 text-right font-semibold text-gray-900">
                              {formatCurrency(month.total)}
                            </td>
                            <td className="py-4 text-right text-emerald-600 font-medium">
                              {formatCurrency(month.released)}
                            </td>
                            <td className="py-4 text-right text-amber-600 font-medium">
                              {formatCurrency(month.pending)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
