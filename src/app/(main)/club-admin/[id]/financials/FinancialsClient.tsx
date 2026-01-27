"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Building2,
  CreditCard,
  Edit2,
  Save,
  X,
  Ticket,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface FinancialsData {
  earnings: {
    totalReleased: number;
    totalPending: number;
    totalWithheld: number;
    thisYearEarnings: number;
    thisMonthEarnings: number;
    lastMonthEarnings: number;
    growthPercent: number;
    teamTicketEarnings: number;
    dayPassEarnings: number;
    platformFeeShare: number;
  };
  potential: {
    totalPotential: number;
    unconvertedInterests: number;
    avgTeamSize: number;
    dayPassPrice: number;
    byEvent: {
      eventId: string;
      eventTitle: string;
      eventDate: string;
      interestCount: number;
      teamsRegistered: number;
      unconverted: number;
      potentialRevenue: number;
    }[];
  };
  bankDetails: {
    accountHolder: string | null;
    ibanMasked: string | null;
    ibanFull: string | null;
    bic: string | null;
    bankName: string | null;
    isComplete: boolean;
  };
  monthlyBreakdown: {
    month: string;
    year: number;
    earned: number;
    released: number;
    pending: number;
  }[];
  clubName: string;
}

interface FinancialsClientProps {
  clubId: string;
  clubName: string;
  canEditBankDetails: boolean;
}

export function FinancialsClient({
  clubId,
  clubName,
  canEditBankDetails,
}: FinancialsClientProps) {
  const [data, setData] = useState<FinancialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBank, setEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [showPotentialBreakdown, setShowPotentialBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"type" | "monthly">("type");

  // Bank details form
  const [bankForm, setBankForm] = useState({
    bankAccountHolder: "",
    bankIban: "",
    bankBic: "",
    bankName: "",
  });

  useEffect(() => {
    fetchFinancials();
  }, [clubId]);

  async function fetchFinancials() {
    setLoading(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}/financials`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result);

      // Initialize bank form with existing data
      if (result.bankDetails) {
        setBankForm({
          bankAccountHolder: result.bankDetails.accountHolder || "",
          bankIban: result.bankDetails.ibanFull || "",
          bankBic: result.bankDetails.bic || "",
          bankName: result.bankDetails.bankName || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function saveBankDetails() {
    setSavingBank(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}/financials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      // Update local data
      if (data) {
        setData({
          ...data,
          bankDetails: result.bankDetails,
        });
      }

      setEditingBank(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save bank details");
    } finally {
      setSavingBank(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">
          {error || "Failed to load financial data"}
        </p>
        <button
          type="button"
          onClick={fetchFinancials}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href={`/club-admin/${clubId}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="w-7 h-7 text-emerald-400" />
            Financials
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Track earnings, potential revenue, and manage payouts for {clubName}
          </p>
        </div>
      </div>

      {/* Section 1: Earnings Overview */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          {currentYear} Earnings
        </h2>
        <p className="text-xs text-white/50 mb-4">
          Your confirmed and pending revenue from hosting teams this year.
        </p>

        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl p-5 mb-4 border border-emerald-500/20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-emerald-300 text-sm font-medium mb-1">
                Year-to-Date Earnings
              </p>
              <p className="text-4xl md:text-5xl font-bold text-white">
                {formatCurrency(data.earnings.thisYearEarnings)}
              </p>
              {data.earnings.growthPercent !== 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5">
                  {data.earnings.growthPercent > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      data.earnings.growthPercent > 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {data.earnings.growthPercent > 0 ? "+" : ""}
                    {data.earnings.growthPercent}% vs last month
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-white/50">This Month</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(data.earnings.thisMonthEarnings)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50">Last Month</p>
                <p className="text-xl font-bold text-white/70">
                  {formatCurrency(data.earnings.lastMonthEarnings)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-emerald-300 font-medium">Released</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">
              {formatCurrency(data.earnings.totalReleased)}
            </p>
            <p className="text-xs text-white/40 mt-1">Paid out to you</p>
          </div>

          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-amber-300 font-medium">Pending</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">
              {formatCurrency(data.earnings.totalPending)}
            </p>
            <p className="text-xs text-white/40 mt-1">
              Awaiting trip completion
            </p>
          </div>

          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-red-300 font-medium">Withheld</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">
              {formatCurrency(data.earnings.totalWithheld)}
            </p>
            <p className="text-xs text-white/40 mt-1">Under review</p>
          </div>
        </div>
      </section>

      {/* Section 2: Potential Revenue */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Potential Revenue
        </h2>
        <p className="text-xs text-white/50 mb-4">
          What you could earn if you converted all interested clubs into
          bookings.
        </p>

        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl p-5 border border-amber-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-amber-300 text-sm font-medium mb-1">
                Unrealized Potential
              </p>
              <p className="text-4xl md:text-5xl font-bold text-white">
                {formatCurrency(data.potential.totalPotential)}
              </p>
              <p className="text-sm text-white/60 mt-2">
                From {data.potential.unconvertedInterests} unconverted interest
                {data.potential.unconvertedInterests !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-sm">
              <p className="text-white/60 mb-2">Calculation:</p>
              <p className="text-white font-mono">
                {data.potential.unconvertedInterests} interests ×{" "}
                {data.potential.avgTeamSize} players ×{" "}
                {formatCurrency(data.potential.dayPassPrice)}
              </p>
            </div>
          </div>

          {data.potential.byEvent.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  setShowPotentialBreakdown(!showPotentialBreakdown)
                }
                className="flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200 transition-colors"
              >
                {showPotentialBreakdown ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                View by event
              </button>

              {showPotentialBreakdown && (
                <div className="mt-3 space-y-2">
                  {data.potential.byEvent.map((event) => (
                    <div
                      key={event.eventId}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {event.eventTitle}
                        </p>
                        <p className="text-xs text-white/50">
                          {formatDate(event.eventDate)} • {event.unconverted}{" "}
                          unconverted of {event.interestCount} interests
                        </p>
                      </div>
                      <p className="text-amber-300 font-bold ml-4">
                        {formatCurrency(event.potentialRevenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {data.potential.unconvertedInterests > 0 && (
            <Link
              href={`/club-admin/${clubId}/inquiries`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View Inquiries
            </Link>
          )}
        </div>
      </section>

      {/* Section 3: Bank Details */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Bank Details
            </h2>
            <p className="text-xs text-white/50">
              Your account details for receiving payouts.
            </p>
          </div>

          {canEditBankDetails && !editingBank && (
            <button
              type="button"
              onClick={() => setEditingBank(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-cyan-300 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {!data.bankDetails.isComplete && !editingBank && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium text-sm">
                  Bank details incomplete
                </p>
                <p className="text-amber-200/60 text-xs mt-1">
                  Please add your bank details to receive payouts for your
                  hosting revenue.
                </p>
              </div>
            </div>
          </div>
        )}

        {editingBank ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={bankForm.bankAccountHolder}
                  onChange={(e) =>
                    setBankForm({
                      ...bankForm,
                      bankAccountHolder: e.target.value,
                    })
                  }
                  placeholder="Name on bank account"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankName: e.target.value })
                  }
                  placeholder="e.g., Bank of Ireland"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">
                  IBAN
                </label>
                <input
                  type="text"
                  value={bankForm.bankIban}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankIban: e.target.value })
                  }
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">
                  BIC/SWIFT
                </label>
                <input
                  type="text"
                  value={bankForm.bankBic}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankBic: e.target.value })
                  }
                  placeholder="COBADEFFXXX"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={saveBankDetails}
                disabled={savingBank}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
              >
                {savingBank ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBank(false);
                  // Reset form to current values
                  if (data.bankDetails) {
                    setBankForm({
                      bankAccountHolder: data.bankDetails.accountHolder || "",
                      bankIban: data.bankDetails.ibanFull || "",
                      bankBic: data.bankDetails.bic || "",
                      bankName: data.bankDetails.bankName || "",
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Account Holder</p>
              <p className="text-white font-medium">
                {data.bankDetails.accountHolder || "—"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Bank</p>
              <p className="text-white font-medium">
                {data.bankDetails.bankName || "—"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">IBAN</p>
              <p className="text-white font-medium font-mono">
                {data.bankDetails.ibanMasked || "—"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">BIC/SWIFT</p>
              <p className="text-white font-medium font-mono">
                {data.bankDetails.bic || "—"}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Section 4: Revenue Breakdown */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          Revenue Breakdown
        </h2>
        <p className="text-xs text-white/50 mb-4">
          Detailed breakdown of your revenue by type and over time.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("type")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "type"
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            By Type
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "monthly"
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Monthly
          </button>
        </div>

        {activeTab === "type" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Ticket className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Team Tickets</p>
                  <p className="text-xs text-white/50">
                    From team registrations
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(data.earnings.teamTicketEarnings)}
              </p>
            </div>

            <div className="flex items-center justify-between bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Day Passes</p>
                  <p className="text-xs text-white/50">Per-player revenue</p>
                </div>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(data.earnings.dayPassEarnings)}
              </p>
            </div>

            <div className="flex items-center justify-between bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Platform Fee Share</p>
                  <p className="text-xs text-white/50">
                    50% of day pass fees returned to you
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-400">
                +{formatCurrency(data.earnings.platformFeeShare)}
              </p>
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <>
            {data.monthlyBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/50">No monthly data yet</p>
                <p className="text-white/30 text-sm mt-1">
                  Monthly breakdown will appear as you receive payments
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="text-left text-xs text-white/50 uppercase tracking-wider">
                      <th className="pb-3 font-medium">Month</th>
                      <th className="pb-3 font-medium text-right">Earned</th>
                      <th className="pb-3 font-medium text-right">Released</th>
                      <th className="pb-3 font-medium text-right">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.monthlyBreakdown.map((month, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="py-3 text-white font-medium">
                          {month.month} {month.year}
                        </td>
                        <td className="py-3 text-right text-white">
                          {formatCurrency(month.earned)}
                        </td>
                        <td className="py-3 text-right text-emerald-400">
                          {formatCurrency(month.released)}
                        </td>
                        <td className="py-3 text-right text-amber-400">
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
      </section>
    </div>
  );
}
