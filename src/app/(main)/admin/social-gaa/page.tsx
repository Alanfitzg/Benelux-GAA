"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Trophy,
  Plus,
  Search,
  Eye,
  Edit,
  PartyPopper,
  Heart,
  Info,
} from "lucide-react";

interface SocialEvent {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationCount: number;
  maxTeams: number | null;
  status: string;
  acceptedTeamTypes: string[];
  club: {
    name: string;
    country?: { name: string };
  } | null;
}

const TYPE_CONFIG = {
  G4MO: {
    label: "Gaelic for Mothers & Others",
    shortLabel: "G4MO",
    icon: Heart,
    color: "pink",
    bgClass: "bg-pink-100",
    textClass: "text-pink-700",
    borderClass: "border-pink-200",
  },
  DADS_AND_LADS: {
    label: "Dads & Lads",
    shortLabel: "Dads & Lads",
    icon: Users,
    color: "blue",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  SOCIAL: {
    label: "Social GAA",
    shortLabel: "Social",
    icon: PartyPopper,
    color: "amber",
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
};

export default function SocialGAAPage() {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    g4mo: 0,
    dadsAndLads: 0,
    social: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    fetchSocialEvents();
  }, []);

  const fetchSocialEvents = async () => {
    try {
      const response = await fetch("/api/admin/social-gaa/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Failed to fetch social events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.club?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || event.acceptedTeamTypes.includes(selectedType);

    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventTypeConfig = (teamTypes: string[]) => {
    if (teamTypes.includes("G4MO")) return TYPE_CONFIG.G4MO;
    if (teamTypes.includes("DADS_AND_LADS")) return TYPE_CONFIG.DADS_AND_LADS;
    return TYPE_CONFIG.SOCIAL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-800">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Back Button */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>

        {/* Header with Info */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Social GAA Events
              </h1>
              <p className="text-xs sm:text-base text-gray-600 truncate sm:whitespace-normal">
                Manage G4MO, Dads & Lads, and social tournaments
              </p>
            </div>
          </div>
          <div className="bg-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-pink-100 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Social GAA</strong> is the
              busiest department for travel. This section manages all
              non-competitive social events including{" "}
              <strong>Gaelic for Mothers & Others (G4MO)</strong>,{" "}
              <strong>Dads & Lads</strong>, and other social GAA tournaments.
              These events focus on participation, fun, and community rather
              than competition.
            </p>
          </div>

          {/* Development Notice */}
          <div className="bg-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm sm:text-lg">🚧</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-amber-800 mb-1">
                  Feature In Development
                </h3>
                <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">
                  This section is currently under development. When complete,
                  applicants will be automatically categorised into separate
                  databases based on their event type:{" "}
                  <strong>G4MO Database</strong>,{" "}
                  <strong>Dads & Lads Database</strong>, and{" "}
                  <strong>Social Camogie Database</strong>. You&apos;ll be able
                  to filter and track applicants who have applied but not yet
                  successfully travelled, helping you follow up with interested
                  teams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-4 sm:overflow-visible sm:pb-0">
          <div className="bg-white p-3 sm:p-5 rounded-xl shadow-lg border border-gray-100 group relative min-w-[140px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    Total Events
                  </p>
                  <div className="relative hidden sm:block">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      All social GAA events in the system
                    </div>
                  </div>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-xl shadow-lg border border-gray-100 group relative min-w-[140px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    G4MO
                  </p>
                  <div className="relative hidden sm:block">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Gaelic for Mothers & Others events
                    </div>
                  </div>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {stats.g4mo}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-xl shadow-lg border border-gray-100 group relative min-w-[140px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    Dads & Lads
                  </p>
                  <div className="relative hidden sm:block">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Social events for fathers and sons
                    </div>
                  </div>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {stats.dadsAndLads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-xl shadow-lg border border-gray-100 group relative min-w-[140px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    Social
                  </p>
                  <div className="relative hidden sm:block">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Social Camogie & other social tournaments
                    </div>
                  </div>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {stats.social}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-xl shadow-lg border border-gray-100 group relative min-w-[160px] sm:min-w-0 flex-shrink-0 sm:flex-shrink sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    Registrations
                  </p>
                  <div className="relative hidden sm:block">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Total team registrations across all social events
                    </div>
                  </div>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {stats.totalRegistrations}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, locations, or clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Type Filter - Horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedType === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("G4MO")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedType === "G4MO"
                    ? "bg-pink-600 text-white"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                }`}
              >
                G4MO
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("DADS_AND_LADS")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedType === "DADS_AND_LADS"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Dads & Lads
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("SOCIAL")}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedType === "SOCIAL"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Social
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm sm:text-base">
                Loading social events...
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                No Social Events Found
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                {searchTerm || selectedType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Social GAA events will appear here when created"}
              </p>
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-xs sm:text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Create Social Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEvents.map((event) => {
                const typeConfig = getEventTypeConfig(event.acceptedTeamTypes);
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={event.id}
                    className="p-3 sm:p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-2 sm:gap-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${typeConfig.bgClass} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <TypeIcon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${typeConfig.textClass}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate sm:whitespace-normal">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                <span className="truncate max-w-[100px] sm:max-w-none">
                                  {event.location}
                                </span>
                              </span>
                              <span className="text-gray-300 hidden sm:inline">
                                •
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                {formatDate(event.startDate)}
                              </span>
                              {event.club && (
                                <>
                                  <span className="text-gray-300 hidden sm:inline">
                                    •
                                  </span>
                                  <span className="hidden sm:inline">
                                    {event.club.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span
                              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${typeConfig.bgClass} ${typeConfig.textClass}`}
                            >
                              {typeConfig.shortLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <span className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span>{event.registrationCount}</span>
                              <span className="hidden sm:inline">
                                registered
                              </span>
                              {event.maxTeams && (
                                <span className="text-gray-400 hidden sm:inline">
                                  / {event.maxTeams} max
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-2">
                            <Link
                              href={`/events/${event.id}`}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Event"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Link>
                            <Link
                              href={`/events/${event.id}/edit`}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Event"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Feature: Applicant Databases - Horizontal scroll on mobile */}
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-pink-200 relative overflow-hidden min-w-[260px] sm:min-w-0 flex-shrink-0 md:flex-shrink">
            <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
              Coming Soon
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                G4MO Database
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
              Track all G4MO applicants and their travel status. Filter by
              applied, travelling, or completed.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>0 applicants</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-blue-200 relative overflow-hidden min-w-[260px] sm:min-w-0 flex-shrink-0 md:flex-shrink">
            <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
              Coming Soon
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Dads & Lads Database
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
              Manage Dads & Lads team applications. See who has applied but not
              yet travelled.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>0 applicants</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-purple-200 relative overflow-hidden min-w-[260px] sm:min-w-0 flex-shrink-0 md:flex-shrink">
            <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
              Coming Soon
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Social Camogie Database
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
              Track Social Camogie team registrations and follow up with
              interested clubs.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>0 applicants</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/events/create"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-medium shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Social Event
          </Link>
          <Link
            href="/admin/gaa-fixtures"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-lg border border-gray-200 text-sm sm:text-base"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Manage Blackout Dates
          </Link>
        </div>
      </div>
    </div>
  );
}
