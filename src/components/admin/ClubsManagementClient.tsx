"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/ui/DeleteButton";
import { Building2, Monitor, GraduationCap } from "lucide-react";

type ClubListItem = {
  id: string;
  name: string;
  map: string | null;
  imageUrl: string | null;
  region: string | null;
  subRegion: string | null;
  location: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  teamTypes: string[];
  clubType: "CLUB" | "UNIVERSITY" | "SCHOOL" | "COUNTY";
  country?: {
    name: string;
  } | null;
  internationalUnit?: {
    name: string;
  } | null;
  regionRecord?: {
    name: string;
  } | null;
  tripsParticipated?: number;
  bookingsCompleted?: number;
};

interface County {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
}

interface InternationalUnit {
  id: string;
  code: string;
  name: string;
}

interface Country {
  id: string;
  code: string;
  name: string;
}

// Irish provinces with their counties
const IRISH_PROVINCES = [
  { id: "LEINSTER", name: "Leinster" },
  { id: "MUNSTER", name: "Munster" },
  { id: "CONNACHT", name: "Connacht" },
  { id: "ULSTER", name: "Ulster" },
];

type Props = {
  initialClubs: ClubListItem[];
  deleteClub: (formData: FormData) => Promise<void>;
};

export default function ClubsManagementClient({
  initialClubs,
  deleteClub,
}: Props) {
  // View mode: "ireland" or "international"
  const [viewMode, setViewMode] = useState<"ireland" | "international">(
    "ireland"
  );

  // Ireland filters
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [counties, setCounties] = useState<County[]>([]);
  const [loadingCounties, setLoadingCounties] = useState(false);

  // International filters
  const [internationalUnits, setInternationalUnits] = useState<
    InternationalUnit[]
  >([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Common filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dataQualityFilter, setDataQualityFilter] = useState<string>("all");
  const [universitiesOnly, setUniversitiesOnly] = useState(false);
  const [codeFilter, setCodeFilter] = useState<string>("all");
  const [hasTripsFilter, setHasTripsFilter] = useState(false);

  const clubs = initialClubs;

  // Load international units on mount (for international view)
  useEffect(() => {
    const loadUnits = async () => {
      setLoadingUnits(true);
      try {
        const response = await fetch("/api/clubs/international-units");
        if (response.ok) {
          const data = await response.json();
          // Filter out Ireland from international units
          setInternationalUnits(
            data.filter((u: InternationalUnit) => u.code !== "IRE")
          );
        }
      } catch (error) {
        console.error("Error loading international units:", error);
      } finally {
        setLoadingUnits(false);
      }
    };
    loadUnits();
  }, []);

  // Load counties when province is selected
  useEffect(() => {
    if (selectedProvince && selectedProvince !== "all") {
      const loadCounties = async () => {
        setLoadingCounties(true);
        try {
          const response = await fetch(
            `/api/clubs/ireland-counties?provinceCode=${selectedProvince}`
          );
          if (response.ok) {
            const data = await response.json();
            setCounties(data);
          }
        } catch (error) {
          console.error("Error loading counties:", error);
        } finally {
          setLoadingCounties(false);
        }
      };
      loadCounties();
      setSelectedCounty("all");
    } else {
      setCounties([]);
      setSelectedCounty("all");
    }
  }, [selectedProvince]);

  // Load countries when international unit is selected
  useEffect(() => {
    if (selectedUnit && selectedUnit !== "all") {
      const loadCountriesForUnit = async () => {
        setLoadingCountries(true);
        try {
          const response = await fetch(
            `/api/clubs/countries-sql?unitId=${selectedUnit}`
          );
          if (response.ok) {
            const data = await response.json();
            setCountries(data);
          }
        } catch (error) {
          console.error("Error loading countries:", error);
        } finally {
          setLoadingCountries(false);
        }
      };
      loadCountriesForUnit();
      setSelectedCountry("all");
    } else {
      setCountries([]);
      setSelectedCountry("all");
    }
  }, [selectedUnit]);

  // Reset filters when view mode changes
  useEffect(() => {
    setSelectedProvince("all");
    setSelectedCounty("all");
    setSelectedUnit("all");
    setSelectedCountry("all");
  }, [viewMode]);

  // Filter clubs based on selected filters
  const filteredClubs = useMemo(() => {
    let filtered = clubs.filter((club) => {
      // View mode filter
      if (viewMode === "ireland") {
        // For Ireland view, only show clubs with Ireland international unit
        const isIrish = club.internationalUnit?.name === "Ireland";
        if (!isIrish) return false;

        // Province filter (based on region field which contains province name)
        if (selectedProvince !== "all") {
          const provinceName = IRISH_PROVINCES.find(
            (p) => p.id === selectedProvince
          )?.name;
          // Check if club's region matches selected province
          if (provinceName && club.region !== provinceName) {
            return false;
          }
        }

        // County filter (based on subRegion field)
        if (selectedCounty !== "all") {
          const county = counties.find((c) => c.code === selectedCounty);
          if (county && club.subRegion !== county.name) {
            return false;
          }
        }
      } else {
        // International view - exclude Ireland clubs
        const isIrish = club.internationalUnit?.name === "Ireland";
        if (isIrish) return false;

        // International Unit filter
        if (selectedUnit !== "all") {
          const unit = internationalUnits.find((u) => u.id === selectedUnit);
          if (unit && club.internationalUnit?.name !== unit.name) {
            return false;
          }
        }

        // Country filter
        if (selectedCountry !== "all") {
          const country = countries.find((c) => c.id === selectedCountry);
          if (country && club.country?.name !== country.name) {
            return false;
          }
        }
      }

      // Universities only filter
      if (universitiesOnly && club.clubType !== "UNIVERSITY") {
        return false;
      }

      // Search filter (name, location)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          club.name.toLowerCase().includes(searchLower) ||
          club.location?.toLowerCase().includes(searchLower) ||
          club.subRegion?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Data quality filter
      if (dataQualityFilter !== "all") {
        switch (dataQualityFilter) {
          case "missing-location":
            if (club.location && club.location.trim() !== "") return false;
            break;
          case "missing-region":
            if (
              club.internationalUnit?.name ||
              club.country?.name ||
              club.regionRecord?.name ||
              club.region
            )
              return false;
            break;
          case "no-image":
            if (club.imageUrl) return false;
            break;
          case "no-website":
            if (club.website || club.facebook || club.instagram) return false;
            break;
          case "incomplete":
            const hasLocation = club.location && club.location.trim() !== "";
            const hasRegion = !!(
              club.internationalUnit?.name ||
              club.country?.name ||
              club.regionRecord?.name ||
              club.region
            );
            const hasImage = !!club.imageUrl;
            if (hasLocation && hasRegion && hasImage) return false;
            break;
        }
      }

      // Code filter (based on team types)
      if (codeFilter !== "all") {
        const teamTypesLower = club.teamTypes.map((t) => t.toLowerCase());
        const hasHurling = teamTypesLower.some(
          (t) => t.includes("hurling") || t.includes("camogie")
        );
        const hasFootball = teamTypesLower.some(
          (t) =>
            t.includes("football") || t.includes("lgfa") || t.includes("ladies")
        );

        switch (codeFilter) {
          case "dual":
            if (!hasHurling || !hasFootball) return false;
            break;
          case "hurling-camogie":
            if (!hasHurling) return false;
            break;
          case "football":
            if (!hasFootball) return false;
            break;
          case "g4mo":
            if (!teamTypesLower.some((t) => t.includes("g4mo"))) return false;
            break;
          case "rounders":
            if (!teamTypesLower.some((t) => t.includes("rounders")))
              return false;
            break;
          case "youth":
            if (!teamTypesLower.some((t) => t.includes("youth"))) return false;
            break;
          case "dads-lads":
            if (
              !teamTypesLower.some(
                (t) => t.includes("dads") || t.includes("lads")
              )
            )
              return false;
            break;
          case "higher-education":
            if (!teamTypesLower.some((t) => t.includes("higher education")))
              return false;
            break;
          case "elite-training":
            if (
              !teamTypesLower.some(
                (t) => t.includes("elite") || t.includes("training camp")
              )
            )
              return false;
            break;
          case "beach-gaelic":
            if (!teamTypesLower.some((t) => t.includes("beach"))) return false;
            break;
        }
      }

      return true;
    });

    // Filter and sort by busiest if active
    if (hasTripsFilter) {
      // Filter to only clubs with activity > 0
      filtered = filtered.filter((club) => {
        if (viewMode === "ireland") {
          return (club.tripsParticipated || 0) > 0;
        } else {
          return (club.bookingsCompleted || 0) > 0;
        }
      });
      // Sort by activity (descending)
      filtered.sort((a, b) => {
        if (viewMode === "ireland") {
          return (b.tripsParticipated || 0) - (a.tripsParticipated || 0);
        } else {
          return (b.bookingsCompleted || 0) - (a.bookingsCompleted || 0);
        }
      });
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [
    clubs,
    viewMode,
    selectedProvince,
    selectedCounty,
    selectedUnit,
    selectedCountry,
    counties,
    internationalUnits,
    countries,
    universitiesOnly,
    searchTerm,
    dataQualityFilter,
    codeFilter,
    hasTripsFilter,
  ]);

  // Count clubs by view mode
  const irelandClubCount = useMemo(
    () => clubs.filter((c) => c.internationalUnit?.name === "Ireland").length,
    [clubs]
  );
  const internationalClubCount = useMemo(
    () => clubs.filter((c) => c.internationalUnit?.name !== "Ireland").length,
    [clubs]
  );

  // Count clubs with activity (for the button display)
  const irelandActiveCount = useMemo(
    () =>
      clubs.filter(
        (c) =>
          c.internationalUnit?.name === "Ireland" &&
          (c.tripsParticipated || 0) > 0
      ).length,
    [clubs]
  );
  const internationalActiveCount = useMemo(
    () =>
      clubs.filter(
        (c) =>
          c.internationalUnit?.name !== "Ireland" &&
          (c.bookingsCompleted || 0) > 0
      ).length,
    [clubs]
  );

  // Clear all filters
  const clearFilters = () => {
    setSelectedProvince("all");
    setSelectedCounty("all");
    setSelectedUnit("all");
    setSelectedCountry("all");
    setSearchTerm("");
    setDataQualityFilter("all");
    setUniversitiesOnly(false);
    setCodeFilter("all");
    setHasTripsFilter(false);
  };

  const hasActiveFilters =
    selectedProvince !== "all" ||
    selectedCounty !== "all" ||
    selectedUnit !== "all" ||
    selectedCountry !== "all" ||
    searchTerm ||
    dataQualityFilter !== "all" ||
    universitiesOnly ||
    codeFilter !== "all" ||
    hasTripsFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 relative">
      {/* Mobile Block Message */}
      <div className="md:hidden min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Desktop Required
          </h2>
          <p className="text-gray-600 mb-4">
            Club Management requires a larger screen for the best experience.
            Please access this page from a desktop or tablet device.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-800/50 to-indigo-800/50 border-b border-white/10">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-white">
                    Club Management
                  </h1>
                  <p className="text-sm md:text-base text-white/90 mt-1">
                    Browse, edit & manage all registered clubs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/clubs/register"
                  className="text-center bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
                >
                  Register Club
                </Link>
                <Link
                  href="/admin"
                  className="text-center bg-white/10 text-white px-6 py-2.5 rounded-lg hover:bg-white/20 transition border border-white/20"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
            {/* Ireland / International Toggle */}
            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => setViewMode("ireland")}
                className={`px-5 py-2.5 rounded-lg font-medium transition ${
                  viewMode === "ireland"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🇮🇪 Ireland ({irelandClubCount})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("international")}
                className={`px-5 py-2.5 rounded-lg font-medium transition ${
                  viewMode === "international"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🌍 International ({internationalClubCount})
              </button>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {viewMode === "ireland" ? (
                <>
                  {/* Province Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Province
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="all">All Provinces</option>
                      {IRISH_PROVINCES.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* County Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      County
                    </label>
                    <select
                      value={selectedCounty}
                      onChange={(e) => setSelectedCounty(e.target.value)}
                      disabled={selectedProvince === "all" || loadingCounties}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="all">
                        {loadingCounties
                          ? "Loading..."
                          : selectedProvince === "all"
                            ? "Select province first"
                            : "All Counties"}
                      </option>
                      {counties.map((county) => (
                        <option key={county.code} value={county.code}>
                          {county.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* International Unit Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      International Unit
                    </label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      disabled={loadingUnits}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="all">All Units</option>
                      {internationalUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      disabled={selectedUnit === "all" || loadingCountries}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="all">
                        {loadingCountries
                          ? "Loading..."
                          : selectedUnit === "all"
                            ? "Select unit first"
                            : "All Countries"}
                      </option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Search Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Club name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Data Quality Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Quality
                </label>
                <select
                  value={dataQualityFilter}
                  onChange={(e) => setDataQualityFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="all">All Clubs</option>
                  <option value="missing-location">No Location</option>
                  <option value="missing-region">No Region</option>
                  <option value="no-image">No Image</option>
                  <option value="no-website">No Website</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>

            {/* Active Filters & Results */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Universities Only Toggle */}
                <button
                  type="button"
                  onClick={() => setUniversitiesOnly(!universitiesOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                    universitiesOnly
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Universities Only
                </button>

                {/* Code Filter Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    value={codeFilter}
                    onChange={(e) => setCodeFilter(e.target.value)}
                    className={`appearance-none pl-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer border ${
                      codeFilter !== "all"
                        ? "bg-slate-800 text-white border-slate-800 pr-8"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 pr-8"
                    }`}
                  >
                    <option value="all">Code Filter</option>
                    <option value="dual">Dual Clubs</option>
                    <option value="hurling-camogie">Hurling & Camogie</option>
                    <option value="football">Football Clubs</option>
                    <option value="g4mo">G4MO</option>
                    <option value="rounders">Rounders</option>
                    <option value="youth">Youth</option>
                    <option value="dads-lads">Dads & Lads</option>
                    <option value="higher-education">Higher Education</option>
                    <option value="elite-training">Elite Training Camp</option>
                    <option value="beach-gaelic">Beach Gaelic</option>
                  </select>
                  {codeFilter !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setCodeFilter("all")}
                      className="absolute right-1.5 p-0.5 rounded-full hover:bg-slate-700 transition"
                      title="Clear filter"
                    >
                      <svg
                        className="h-4 w-4 text-white"
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
                  ) : (
                    <div className="pointer-events-none absolute right-2 flex items-center text-gray-500">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Sort by Busiest Toggle */}
                <button
                  type="button"
                  onClick={() => setHasTripsFilter(!hasTripsFilter)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                    hasTripsFilter
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  {viewMode === "ireland" ? "Has Trips" : "Has Hosted"}{" "}
                  <span
                    className={`text-xs ${hasTripsFilter ? "text-white/80" : "text-gray-500"}`}
                  >
                    (
                    {viewMode === "ireland"
                      ? irelandActiveCount
                      : internationalActiveCount}
                    )
                  </span>
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 underline ml-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="px-4 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {hasActiveFilters ? (
                    <>
                      <span className="font-bold text-primary">
                        {filteredClubs.length}
                      </span>
                      {" of "}
                      {viewMode === "ireland"
                        ? irelandClubCount
                        : internationalClubCount}
                      {" clubs"}
                    </>
                  ) : (
                    `${filteredClubs.length} clubs`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Club
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {viewMode === "ireland" ? "County" : "Country"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Types
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {viewMode === "ireland" ? "Trips" : "Hosted"}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClubs.length > 0 ? (
                    filteredClubs.map((club: ClubListItem) => {
                      const displayRegion =
                        viewMode === "ireland"
                          ? club.subRegion || "-"
                          : club.country?.name || "-";

                      return (
                        <tr
                          key={club.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {club.imageUrl && (
                                <Image
                                  src={club.imageUrl}
                                  alt={club.name}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-lg object-contain bg-gray-100 flex-shrink-0"
                                  unoptimized
                                />
                              )}
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {club.name}
                                </span>
                                {club.clubType === "UNIVERSITY" && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                    Uni
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {club.location ? (
                              <span
                                className="max-w-xs truncate block"
                                title={club.location}
                              >
                                {club.location}
                              </span>
                            ) : (
                              <span className="text-red-500 font-medium">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {displayRegion === "-" ? (
                              <span className="text-red-500 font-medium">
                                Missing
                              </span>
                            ) : (
                              displayRegion
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {club.teamTypes.length > 0
                              ? club.teamTypes.join(", ")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                            {viewMode === "ireland" ? (
                              club.tripsParticipated &&
                              club.tripsParticipated > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {club.tripsParticipated}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )
                            ) : club.bookingsCompleted &&
                              club.bookingsCompleted > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {club.bookingsCompleted}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Link
                              href={`/admin/clubs/${club.id}/edit`}
                              className="text-primary hover:text-primary/80 transition"
                            >
                              Edit
                            </Link>
                            <span className="text-gray-300">|</span>
                            <DeleteButton
                              id={club.id}
                              onDelete={deleteClub}
                              itemType="club"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        No clubs found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
