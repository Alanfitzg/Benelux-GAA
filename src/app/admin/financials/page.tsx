"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface FinancialData {
  grossRevenue: number;
  platformCommission: number;
  hostPayouts: number;
  platformFeeShareToHosts: number;
  playAwayNetRevenue: number;
  estimatedStripeFees: number;
  netAfterProcessorFees: number;
  owedToClubs: number;
  pendingPaymentsCount: number;
  releasedToClubs: number;
  thisMonthGross: number;
  thisMonthCommission: number;
  lastMonthCommission: number;
  thisYearCommission: number;
  monthOverMonthChange: number;
  pipeline: {
    confirmed: number;
    confirmedValue: number;
    depositPaid: number;
    fullPaid: number;
    completed: number;
  };
  topPerformingClubs: Array<{
    clubId: string;
    clubName: string;
    country: string;
    totalRevenue: number;
    platformFees: number;
    bookingCount: number;
  }>;
  totalTransactions: number;
}

export default function AdminFinancialsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFinancials();
    }
  }, [status]);

  const fetchFinancials = async () => {
    try {
      const res = await fetch("/api/admin/financials");
      if (!res.ok) {
        throw new Error("Failed to fetch financials");
      }
      const financialData = await res.json();
      setData(financialData);
    } catch (err) {
      setError("Failed to load financial data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-white/10 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-white/60">
            Only Super Admins can access the Financial Command Center.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl sm:text-4xl">💰</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white">
                  Financial Command Center
                </h1>
                <p className="text-sm sm:text-base text-white/60">
                  PlayAway Business Overview
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-white/20 transition text-center text-sm sm:text-base border border-white/20"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Hero Revenue Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 mb-6 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <p className="text-emerald-100 text-sm font-medium mb-1">
                PlayAway Net Revenue
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {data ? formatCurrency(data.playAwayNetRevenue) : "€0.00"}
              </p>
              <p className="text-emerald-100 mt-2 text-sm">
                Platform commission after host fee shares
              </p>
              {data && data.monthOverMonthChange !== 0 && (
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                  <span
                    className={`text-sm font-medium ${data.monthOverMonthChange >= 0 ? "text-white" : "text-red-200"}`}
                  >
                    {formatPercent(data.monthOverMonthChange)} vs last month
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <span className="text-emerald-100 text-xs uppercase tracking-wider">
                  This Month
                </span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {data ? formatCurrency(data.thisMonthCommission) : "€0.00"}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <span className="text-emerald-100 text-xs uppercase tracking-wider">
                  This Year
                </span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {data ? formatCurrency(data.thisYearCommission) : "€0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Money In */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-500">↓</span> Money Coming In
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Gross Revenue</p>
                  <p className="text-sm text-gray-500">
                    Total collected from bookings
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {data ? formatCurrency(data.grossRevenue) : "€0.00"}
                </p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    Platform Commission
                  </p>
                  <p className="text-sm text-gray-500">PlayAway&apos;s cut</p>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  {data ? formatCurrency(data.platformCommission) : "€0.00"}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-500">
                    Fee Share to Hosts (deducted)
                  </p>
                  <p className="text-sm text-gray-400">
                    50% of day pass fees returned
                  </p>
                </div>
                <p className="text-lg font-medium text-red-500">
                  -
                  {data
                    ? formatCurrency(data.platformFeeShareToHosts)
                    : "€0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Money Out / Obligations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-500">↑</span> Obligations & Costs
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    Owed to Host Clubs
                  </p>
                  <p className="text-sm text-gray-500">
                    {data?.pendingPaymentsCount || 0} pending payouts
                  </p>
                </div>
                <p className="text-xl font-bold text-amber-600">
                  {data ? formatCurrency(data.owedToClubs) : "€0.00"}
                </p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    Stripe Fees (Est. 2%)
                  </p>
                  <p className="text-sm text-gray-500">Payment processing</p>
                </div>
                <p className="text-xl font-bold text-gray-700">
                  {data ? formatCurrency(data.estimatedStripeFees) : "€0.00"}
                </p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Released to Clubs</p>
                  <p className="text-sm text-gray-500">Already paid out</p>
                </div>
                <p className="text-xl font-bold text-gray-600">
                  {data ? formatCurrency(data.releasedToClubs) : "€0.00"}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">
                    Net After Stripe
                  </p>
                  <p className="text-sm text-gray-500">Your actual take-home</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {data ? formatCurrency(data.netAfterProcessorFees) : "€0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Pipeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Pipeline
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {data?.pipeline.confirmed || 0}
              </p>
              <p className="text-sm text-yellow-700 font-medium">Confirmed</p>
              <p className="text-xs text-yellow-600 mt-1">
                {data ? formatCurrency(data.pipeline.confirmedValue) : "€0"}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {data?.pipeline.depositPaid || 0}
              </p>
              <p className="text-sm text-blue-700 font-medium">Deposit Paid</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {data?.pipeline.fullPaid || 0}
              </p>
              <p className="text-sm text-indigo-700 font-medium">Fully Paid</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {data?.pipeline.completed || 0}
              </p>
              <p className="text-sm text-green-700 font-medium">Completed</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-600">
                {data?.totalTransactions || 0}
              </p>
              <p className="text-sm text-gray-700 font-medium">Transactions</p>
            </div>
          </div>
        </div>

        {/* Top Performing Host Clubs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing European Host Clubs
          </h2>
          {data?.topPerformingClubs && data.topPerformingClubs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 font-medium">Rank</th>
                    <th className="pb-3 font-medium">Club</th>
                    <th className="pb-3 font-medium">Country</th>
                    <th className="pb-3 font-medium text-right">Bookings</th>
                    <th className="pb-3 font-medium text-right">
                      Gross Revenue
                    </th>
                    <th className="pb-3 font-medium text-right">
                      Platform Fees
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.topPerformingClubs.map((club, index) => (
                    <tr key={club.clubId} className="hover:bg-gray-50">
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                                ? "bg-gray-200 text-gray-700"
                                : index === 2
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-gray-900">
                        {club.clubName}
                      </td>
                      <td className="py-3 text-gray-600">{club.country}</td>
                      <td className="py-3 text-right text-gray-600">
                        {club.bookingCount}
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(club.totalRevenue)}
                      </td>
                      <td className="py-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(club.platformFees)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Once European host clubs start receiving bookings from Irish and
                British teams, the leaderboard will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {data?.totalTransactions || 0}
            </p>
            <p className="text-xs sm:text-sm text-white/60">
              Total Transactions
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {data?.topPerformingClubs?.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-white/60">
              Active Host Clubs
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {data ? formatCurrency(data.thisMonthGross) : "€0"}
            </p>
            <p className="text-xs sm:text-sm text-white/60">This Month Gross</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-400">
              {data?.pendingPaymentsCount || 0}
            </p>
            <p className="text-xs sm:text-sm text-white/60">Pending Payouts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
