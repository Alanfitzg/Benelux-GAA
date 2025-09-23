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

  // Filter clubs based on selected region and search term
  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
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

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          club.name.toLowerCase().includes(searchLower) ||
          club.location?.toLowerCase().includes(searchLower) ||
          club.region?.toLowerCase().includes(searchLower) ||
          club.subRegion?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [clubs, selectedRegion, searchTerm]);


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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Region Filter */}
          <div className="flex-1">
            <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Region
            </label>
            <select
              id="region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
          <div className="flex-1">
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Search Clubs
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search by name, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">
                Showing {filteredClubs.length} of {initialClubs.length} clubs
              </span>
            </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        📍 {club.location || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {displayRegion}
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