"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  ChevronDown,
  Flame,
  BarChart3,
  Loader2,
  Plus,
  Mail,
  Clock,
} from "lucide-react";

interface EventInsight {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  sportTypes: string[];
  interestCount: number;
  teamCount: number;
  conversionRate: number;
}

interface RecentInterest {
  id: string;
  name: string;
  email: string;
  clubName: string | null;
  eventTitle: string;
  sportTypes: string[];
  submittedAt: string;
  message: string | null;
}

interface HotWeekend {
  weekend: string;
  interestCount: number;
  eventsScheduled: number;
  demandGap: number;
  isOpportunity: boolean;
}

interface MonthPattern {
  month: string;
  interestCount: number;
  percentOfTotal?: number;
}

interface TrendingDestination {
  location: string;
  country: string;
  recentInterests: number;
  growthPercent: number;
}

interface RegionStats {
  region: string;
  totalInterests: number;
  yourShare: number;
  competitorCount: number;
}

interface DemandData {
  clubInsights: {
    totalInterests: number;
    thisMonthInterests: number;
    lastMonthInterests: number;
    growthPercent: number;
    byEvent: EventInsight[];
    recentInterests: RecentInterest[];
  };
  platformInsights: {
    selectedSport: string | null;
    availableSports: string[];
    hotWeekends: HotWeekend[];
    historicalPatterns: MonthPattern[];
    peakMonths: MonthPattern[];
    trendingDestinations: TrendingDestination[];
    yourRegionStats: RegionStats;
  };
}

interface DemandInsightsClientProps {
  clubId: string;
  clubName: string;
}

export function DemandInsightsClient({
  clubId,
  clubName,
}: DemandInsightsClientProps) {
  const [data, setData] = useState<DemandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [showAllInterests, setShowAllInterests] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedSport, clubId]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const url = selectedSport
        ? `/api/clubs/${clubId}/demand-insights?sport=${encodeURIComponent(selectedSport)}`
        : `/api/clubs/${clubId}/demand-insights`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white/60">Loading demand insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href={`/club-admin/${clubId}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-2 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Command Center
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Demand Insights
              </h1>
              <p className="text-xs md:text-sm text-white/60">{clubName}</p>
            </div>
          </div>
        </div>

        {/* Sport Filter */}
        <div className="relative">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="appearance-none bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
          >
            <option value="" className="bg-slate-800">
              All Sports
            </option>
            {data.platformInsights.availableSports.map((sport) => (
              <option key={sport} value={sport} className="bg-slate-800">
                {sport}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
        </div>
      </div>

      {/* Section 1: Your Club Performance */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Your Club Performance
        </h2>
        <p className="text-xs text-white/50 mb-4">
          Track how many Irish clubs have expressed interest in your events and
          monitor your month-over-month growth.
        </p>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">Total Interests</p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {data.clubInsights.totalInterests}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">This Month</p>
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">
              {data.clubInsights.thisMonthInterests}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">Last Month</p>
            <p className="text-2xl md:text-3xl font-bold text-white/80">
              {data.clubInsights.lastMonthInterests}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">Growth</p>
            <p
              className={`text-2xl md:text-3xl font-bold ${data.clubInsights.growthPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {data.clubInsights.growthPercent >= 0 ? "+" : ""}
              {data.clubInsights.growthPercent}%
            </p>
          </div>
        </div>

        {/* Events Breakdown */}
        {data.clubInsights.byEvent.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white/80 mb-3">
              Interest by Event
            </h3>
            <div className="space-y-2">
              {data.clubInsights.byEvent.map((event) => (
                <Link
                  key={event.eventId}
                  href={`/events/${event.eventId}`}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                      {event.eventTitle}
                    </p>
                    <p className="text-xs text-white/50">
                      {formatDate(event.eventDate)}
                      {event.sportTypes.length > 0 && (
                        <span className="ml-2">
                          • {event.sportTypes.join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-lg font-bold text-cyan-400">
                        {event.interestCount}
                      </p>
                      <p className="text-[10px] text-white/50">interested</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white/80">
                        {event.teamCount}
                      </p>
                      <p className="text-[10px] text-white/50">registered</p>
                    </div>
                    <div className="hidden md:block">
                      <p
                        className={`text-lg font-bold ${event.conversionRate >= 50 ? "text-emerald-400" : "text-amber-400"}`}
                      >
                        {event.conversionRate}%
                      </p>
                      <p className="text-[10px] text-white/50">conversion</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Interests */}
        {data.clubInsights.recentInterests.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">
                Recent Inquiries
              </h3>
              {data.clubInsights.recentInterests.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllInterests(!showAllInterests)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {showAllInterests ? "Show less" : "Show all"}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {(showAllInterests
                ? data.clubInsights.recentInterests
                : data.clubInsights.recentInterests.slice(0, 5)
              ).map((interest) => (
                <div
                  key={interest.id}
                  className="flex items-start gap-3 bg-white/5 rounded-lg p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {interest.name}
                      </p>
                      {interest.clubName && (
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          {interest.clubName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 truncate">
                      {interest.eventTitle}
                    </p>
                    {interest.message && (
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">
                        &ldquo;{interest.message}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-white/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(interest.submittedAt)}
                    </span>
                    <a
                      href={`mailto:${interest.email}`}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Send email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.clubInsights.totalInterests === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Users className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60">No interests recorded yet</p>
            <p className="text-sm text-white/40 mt-1">
              Create events to start receiving interest
            </p>
          </div>
        )}
      </section>

      {/* Section 2: Market Intelligence */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Market Intelligence
          {selectedSport && (
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
              {selectedSport}
            </span>
          )}
        </h2>
        <p className="text-xs text-white/50 mb-4">
          Platform-wide demand data showing when Irish clubs want to travel. Use
          the sport filter above to see demand for specific sports like LGFA or
          Hurling.
        </p>

        {/* Hot Weekends */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Top 3 Hot Weekends
          </h3>
          <p className="text-xs text-white/40 mb-3">
            Weekends with the most interest from travelling clubs.
            &quot;Opportunity&quot; means demand exceeds the number of events
            scheduled - consider hosting!
          </p>

          {data.platformInsights.hotWeekends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.platformInsights.hotWeekends.map((weekend, index) => (
                <div
                  key={weekend.weekend}
                  className={`relative rounded-xl p-4 border ${
                    weekend.isOpportunity
                      ? "bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  {weekend.isOpportunity && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      Opportunity!
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-white/50">#{index + 1}</p>
                      <p className="text-sm font-semibold text-white">
                        {weekend.weekend}
                      </p>
                    </div>
                    <Calendar className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-xl font-bold text-cyan-400">
                        {weekend.interestCount}
                      </span>
                      <span className="text-xs text-white/50 ml-1">
                        interested
                      </span>
                    </div>
                    <div className="text-white/30">•</div>
                    <div>
                      <span className="text-lg font-bold text-white/70">
                        {weekend.eventsScheduled}
                      </span>
                      <span className="text-xs text-white/50 ml-1">events</span>
                    </div>
                  </div>
                  {weekend.isOpportunity && (
                    <Link
                      href={`/events/create?date=${encodeURIComponent(weekend.weekend)}`}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <Calendar className="w-8 h-8 text-white/30 mx-auto mb-2" />
              <p className="text-white/50 text-sm">
                No weekend demand data available
              </p>
            </div>
          )}
        </div>

        {/* Peak Months */}
        {data.platformInsights.peakMonths.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white/80 mb-2">
              Peak Travel Months
            </h3>
            <p className="text-xs text-white/40 mb-3">
              Months with the highest travel demand historically. The percentage
              shows each month&apos;s share of total annual interest.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.platformInsights.peakMonths.map((month, index) => (
                <div
                  key={month.month}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    index === 0
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-white/5 text-white/70"
                  }`}
                >
                  <span className="font-medium">{month.month}</span>
                  <span className="text-xs ml-2 opacity-70">
                    {month.percentOfTotal}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Patterns */}
        {data.platformInsights.historicalPatterns.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-2">
              12-Month Interest Trend
            </h3>
            <p className="text-xs text-white/40 mb-3">
              Monthly interest submissions over the past year. Taller bars
              indicate higher demand - use this to identify seasonal patterns.
            </p>
            <div className="overflow-x-auto -mx-2 px-2">
              <div className="flex gap-1 min-w-max">
                {data.platformInsights.historicalPatterns.map((pattern) => {
                  const maxCount = Math.max(
                    ...data.platformInsights.historicalPatterns.map(
                      (p) => p.interestCount
                    )
                  );
                  const heightPercent =
                    maxCount > 0
                      ? Math.max(10, (pattern.interestCount / maxCount) * 100)
                      : 10;
                  return (
                    <div
                      key={pattern.month}
                      className="flex flex-col items-center"
                    >
                      <div className="h-20 w-8 flex items-end">
                        <div
                          className="w-full bg-cyan-500/60 rounded-t hover:bg-cyan-500 transition-colors"
                          style={{ height: `${heightPercent}%` }}
                          title={`${pattern.month}: ${pattern.interestCount} interests`}
                        />
                      </div>
                      <p className="text-[10px] text-white/50 mt-1 whitespace-nowrap">
                        {pattern.month.split(" ")[0].slice(0, 3)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Regional Position */}
      <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Your Regional Position
        </h2>
        <p className="text-xs text-white/50 mb-4">
          See how your club compares to others in your region. Market share
          shows what percentage of regional interest your events capture.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">Region</p>
            <p className="text-lg font-bold text-white">
              {data.platformInsights.yourRegionStats.region}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">Regional Interests</p>
            <p className="text-2xl font-bold text-white">
              {data.platformInsights.yourRegionStats.totalInterests}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">Your Market Share</p>
            <p className="text-2xl font-bold text-emerald-400">
              {data.platformInsights.yourRegionStats.yourShare}%
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/60">Active Competitors</p>
            <p className="text-2xl font-bold text-white/80">
              {data.platformInsights.yourRegionStats.competitorCount}
            </p>
          </div>
        </div>

        {/* Trending Destinations */}
        {data.platformInsights.trendingDestinations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white/80 mb-2">
              Trending Destinations
            </h3>
            <p className="text-xs text-white/40 mb-3">
              Locations receiving the most interest in the last 30 days. These
              are the places Irish clubs want to visit most.
            </p>
            <div className="space-y-2">
              {data.platformInsights.trendingDestinations.map((dest, index) => (
                <div
                  key={`${dest.location}-${index}`}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-4">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {dest.location}
                      </p>
                      <p className="text-xs text-white/50">{dest.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyan-400">
                      {dest.recentInterests}
                    </p>
                    <p className="text-[10px] text-white/50">interests</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <div className="text-center py-4">
        <Link
          href="/events/create"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </Link>
      </div>
    </div>
  );
}
