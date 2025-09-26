"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/ui/DeleteButton";

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
  country?: {
    name: string;
  } | null;
  internationalUnit?: {
    name: string;
  } | null;
  regionRecord?: {
    name: string;
  } | null;
};

type Props = {
  initialClubs: ClubListItem[];
  deleteClub: (formData: FormData) => Promise<void>;
};

export default function ClubsManagementClient({ initialClubs, deleteClub }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dataQualityFilter, setDataQualityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const clubs = initialClubs;

  // Extract unique regions for filter dropdown
  const regions = useMemo(() => {
    const regionSet = new Set<string>();

    clubs.forEach(club => {
      // Priority order: internationalUnit > country > regionRecord > legacy region field
      if (club.internationalUnit?.name) {
        regionSet.add(club.internationalUnit.name);
      } else if (club.country?.name) {
        regionSet.add(club.country.name);
      } else if (club.regionRecord?.name) {
        regionSet.add(club.regionRecord.name);
      } else if (club.region) {
        regionSet.add(club.region);
      }
    });

    return Array.from(regionSet).sort();
  }, [clubs]);

  // Filter clubs based on selected region, search term, location filter, and data quality
  const filteredClubs = useMemo(() => {
    let filtered = clubs.filter(club => {
      // Region filter
      if (selectedRegion !== "all") {
        const clubRegion = club.internationalUnit?.name ||
                          club.country?.name ||
                          club.regionRecord?.name ||
                          club.region || "";

        if (clubRegion !== selectedRegion) {
          return false;
        }
      }

      // Location filter (dedicated field)
      if (locationFilter) {
        const locationLower = locationFilter.toLowerCase();
        const clubLocation = club.location?.toLowerCase() || "";
        if (!clubLocation.includes(locationLower)) {
          return false;
        }
      }

      // Search filter (name, region, subRegion)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = (
          club.name.toLowerCase().includes(searchLower) ||
          club.region?.toLowerCase().includes(searchLower) ||
          club.subRegion?.toLowerCase().includes(searchLower) ||
          club.country?.name.toLowerCase().includes(searchLower)
        );
        if (!matches) return false;
      }

      // Data quality filter
      if (dataQualityFilter !== "all") {
        switch (dataQualityFilter) {
          case "missing-location":
            if (club.location && club.location.trim() !== "") return false;
            break;
          case "missing-region":
            if (club.internationalUnit?.name || club.country?.name || club.regionRecord?.name || club.region) return false;
            break;
          case "missing-both":
            if ((club.location && club.location.trim() !== "") || club.internationalUnit?.name || club.country?.name || club.regionRecord?.name || club.region) return false;
            break;
          case "no-image":
            if (club.imageUrl) return false;
            break;
          case "no-website":
            if (club.website || club.facebook || club.instagram) return false;
            break;
          case "incomplete":
            const hasLocation = club.location && club.location.trim() !== "";
            const hasRegion = !!(club.internationalUnit?.name || club.country?.name || club.regionRecord?.name || club.region);
            const hasImage = !!club.imageUrl;
            if (hasLocation && hasRegion && hasImage) return false;
            break;
        }
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "location":
          return (a.location || "zzz").localeCompare(b.location || "zzz");
        case "region":
          const regionA = a.internationalUnit?.name || a.country?.name || a.regionRecord?.name || a.region || "zzz";
          const regionB = b.internationalUnit?.name || b.country?.name || b.regionRecord?.name || b.region || "zzz";
          return regionA.localeCompare(regionB);
        case "completeness":
          const scoreA = calculateCompletenessScore(a);
          const scoreB = calculateCompletenessScore(b);
          return scoreA - scoreB; // Ascending (least complete first)
        default:
          return 0;
      }
    });

    return filtered;
  }, [clubs, selectedRegion, searchTerm, locationFilter, dataQualityFilter, sortBy]);

  // Helper function to calculate completeness score
  const calculateCompletenessScore = (club: ClubListItem): number => {
    let score = 0;
    if (club.location && club.location.trim() !== "") score++;
    if (club.internationalUnit?.name || club.country?.name || club.regionRecord?.name || club.region) score++;
    if (club.imageUrl) score++;
    if (club.website || club.facebook || club.instagram) score++;
    return score;
  };


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Clubs</h1>
        <div className="flex items-center space-x-3">
          <Link
            href="/clubs/register"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
          >
            Register Club
          </Link>
          <Link
            href="/admin"
            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Region Filter */}
          <div>
            <label htmlFor="region-filter" className="block text-sm font-semibold text-gray-700 mb-2">
              🌍 International Unit / Region
            </label>
            <select
              id="region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
            >
              <option value="all">All Regions ({initialClubs.length})</option>
              {regions.map(region => {
                const count = initialClubs.filter(club => {
                  const clubRegion = club.internationalUnit?.name ||
                                    club.country?.name ||
                                    club.regionRecord?.name ||
                                    club.region || "";
                  return clubRegion === region;
                }).length;

                return (
                  <option key={region} value={region}>
                    {region} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search Filter */}
          <div>
            <label htmlFor="search-filter" className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Search by Name / Country
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="e.g., Kilmacud, Cork, Ireland..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="location-filter" className="block text-sm font-semibold text-gray-700 mb-2">
              📍 Filter by Location
            </label>
            <input
              id="location-filter"
              type="text"
              placeholder="e.g., Dublin, Cork..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Data Quality Filter */}
          <div>
            <label htmlFor="quality-filter" className="block text-sm font-semibold text-gray-700 mb-2">
              ⚠️ Data Quality
            </label>
            <select
              id="quality-filter"
              value={dataQualityFilter}
              onChange={(e) => setDataQualityFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            >
              <option value="all">All Clubs</option>
              <option value="missing-location">🚫 No Location</option>
              <option value="missing-region">🚫 No Region/Unit</option>
              <option value="missing-both">🚫 No Location & Region</option>
              <option value="no-image">🖼️ No Image/Crest</option>
              <option value="no-website">🌐 No Website/Social</option>
              <option value="incomplete">⚡ Incomplete Data</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-semibold text-gray-700 mb-2">
              🔽 Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
            >
              <option value="name">Name (A-Z)</option>
              <option value="location">Location (A-Z)</option>
              <option value="region">Region (A-Z)</option>
              <option value="completeness">Completeness (Low→High)</option>
            </select>
          </div>
        </div>

        {/* Active Filters & Results */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedRegion !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Region: {selectedRegion}
                <button
                  type="button"
                  onClick={() => setSelectedRegion("all")}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition"
                  aria-label="Clear region filter"
                >
                  ✕
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                Search: {searchTerm}
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="hover:bg-blue-100 rounded-full p-0.5 transition"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              </span>
            )}
            {locationFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                Location: {locationFilter}
                <button
                  type="button"
                  onClick={() => setLocationFilter("")}
                  className="hover:bg-green-100 rounded-full p-0.5 transition"
                  aria-label="Clear location filter"
                >
                  ✕
                </button>
              </span>
            )}
            {dataQualityFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                Quality: {dataQualityFilter.replace(/-/g, " ")}
                <button
                  type="button"
                  onClick={() => setDataQualityFilter("all")}
                  className="hover:bg-orange-100 rounded-full p-0.5 transition"
                  aria-label="Clear quality filter"
                >
                  ✕
                </button>
              </span>
            )}
            {(selectedRegion !== "all" || searchTerm || locationFilter || dataQualityFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion("all");
                  setSearchTerm("");
                  setLocationFilter("");
                  setDataQualityFilter("all");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline ml-2"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="px-4 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {filteredClubs.length} of {initialClubs.length} clubs
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Types</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClubs.length > 0 ? (
                filteredClubs.map((club: ClubListItem) => {
                  const displayRegion = club.internationalUnit?.name ||
                                      club.country?.name ||
                                      club.regionRecord?.name ||
                                      club.region ||
                                      "-";

                  return (
                    <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {club.imageUrl && (
                            <Image
                              src={club.imageUrl}
                              alt={club.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-contain bg-gray-100 mr-3"
                              unoptimized
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900">{club.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {club.location ? (
                          <span>📍 {club.location}</span>
                        ) : (
                          <span className="text-red-500 font-medium">⚠️ Missing</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {displayRegion === "-" ? (
                          <span className="text-red-500 font-medium">⚠️ Missing</span>
                        ) : (
                          displayRegion
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {club.teamTypes.length > 0 ?
                            club.teamTypes.map((type, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                {type}
                              </span>
                            )) : "-"
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/clubs/${club.id}/edit`}
                          className="text-primary hover:text-primary/80 transition"
                        >
                          Edit
                        </Link>
                        <span className="text-gray-300">|</span>
                        <DeleteButton id={club.id} onDelete={deleteClub} itemType="club" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No clubs found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}