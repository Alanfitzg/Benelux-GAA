"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Upload, MapPin, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClubVerificationCard from "./ClubVerificationCard";

interface Club {
  id: string;
  name: string;
  region?: string | null;
  subRegion?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  website?: string | null;
  codes?: string | null;
  teamTypes: string[];
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactCountryCode?: string | null;
  isContactWilling: boolean;
  verificationStatus?: string;
  bio?: string | null;
  foundedYear?: number | null;
  isOpenToVisitors?: boolean | null;
  preferredWeekends?: unknown;
}

const TEAM_TYPES = [
  "Men's Football",
  "Ladies Football",
  "Men's Hurling",
  "Camogie",
  "Handball",
  "Rounders",
  "Youth/Juvenile",
];

export default function ClubEditForm({ club }: { club: Club }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: club.name || "",
    region: club.region || "",
    subRegion: club.subRegion || "",
    location: club.location || "",
    imageUrl: club.imageUrl || "",
    facebook: club.facebook || "",
    instagram: club.instagram || "",
    twitter: club.twitter || "",
    tiktok: club.tiktok || "",
    website: club.website || "",
    codes: club.codes || "",
    teamTypes: club.teamTypes || [],
    contactFirstName: club.contactFirstName || "",
    contactLastName: club.contactLastName || "",
    contactEmail: club.contactEmail || "",
    contactPhone: club.contactPhone || "",
    contactCountryCode: club.contactCountryCode || "",
    isContactWilling: club.isContactWilling || false,
    bio: club.bio || "",
    foundedYear: club.foundedYear ?? "",
    isOpenToVisitors: club.isOpenToVisitors ?? false,
    preferredWeekends: Array.isArray(club.preferredWeekends)
      ? club.preferredWeekends
      : [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTeamTypeChange = (teamType: string) => {
    setFormData((prev) => ({
      ...prev,
      teamTypes: prev.teamTypes.includes(teamType)
        ? prev.teamTypes.filter((t) => t !== teamType)
        : [...prev.teamTypes, teamType],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "club-crest");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch("/api/clubs/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const data = await response.json();
        return { latitude: data.latitude, longitude: data.longitude };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return { latitude: null, longitude: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Geocode location if it changed
      let updateData = { ...formData };
      if (formData.location !== club.location) {
        const coords = await geocodeLocation(formData.location);
        updateData = { ...updateData, ...coords };
      }

      // Convert empty strings to null for optional fields
      let foundedYearValue: number | null = null;
      if (
        updateData.foundedYear !== "" &&
        updateData.foundedYear !== null &&
        updateData.foundedYear !== undefined
      ) {
        const parsed = parseInt(String(updateData.foundedYear), 10);
        foundedYearValue = isNaN(parsed) ? null : parsed;
      }

      const sanitizedData = {
        ...updateData,
        foundedYear: foundedYearValue,
        bio: updateData.bio || null,
        twitter: updateData.twitter || null,
        tiktok: updateData.tiktok || null,
        facebook: updateData.facebook || null,
        instagram: updateData.instagram || null,
        website: updateData.website || null,
        codes: updateData.codes || null,
        preferredWeekends: (updateData.preferredWeekends as string[]).filter(
          (d) => d !== ""
        ),
      };

      const response = await fetch(`/api/clubs/${club.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update club";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response wasn't JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Club updated successfully");
      router.push(`/club-admin/${club.id}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update club"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Verification Card */}
      <ClubVerificationCard clubId={club.id} />

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Dublin, Ireland"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  placeholder="e.g., Leinster"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Region
                </label>
                <input
                  type="text"
                  name="subRegion"
                  value={formData.subRegion}
                  onChange={handleInputChange}
                  placeholder="e.g., North Dublin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Founded Year
                </label>
                <input
                  type="number"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 1985"
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Club Bio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About Your Club
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell visitors about your club's history, achievements, and what makes it special..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed on your public club page.
              </p>
            </div>
          </div>

          {/* Club Image */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Club Logo/Image
            </h3>
            <div className="space-y-4">
              {formData.imageUrl && (
                <div className="flex justify-center">
                  <Image
                    src={formData.imageUrl}
                    alt="Club logo"
                    width={200}
                    height={200}
                    className="w-32 h-32 object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image
                </label>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {imageUploading ? "Uploading..." : "Choose File"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Team Types */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Team Types <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TEAM_TYPES.map((teamType) => (
                <label key={teamType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.teamTypes.includes(teamType)}
                    onChange={() => handleTeamTypeChange(teamType)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{teamType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactFirstName"
                  required
                  value={formData.contactFirstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactLastName"
                  required
                  value={formData.contactLastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isContactWilling"
                  checked={formData.isContactWilling}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Contact person is willing to help visiting teams
                </span>
              </label>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Social Media & Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourclub"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourclub"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter/X
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/yourclub"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TikTok
                </label>
                <input
                  type="url"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  placeholder="https://tiktok.com/@yourclub"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourclub.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club Codes
                </label>
                <input
                  type="text"
                  name="codes"
                  value={formData.codes}
                  onChange={handleInputChange}
                  placeholder="e.g., Training times, special codes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Visitor Availability */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Visitor Availability
            </h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isOpenToVisitors"
                    checked={formData.isOpenToVisitors}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Our club is open to hosting visiting teams
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  This helps travelling teams find clubs that welcome visitors.
                </p>
              </div>

              {formData.isOpenToVisitors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Weekends
                  </label>
                  <div className="space-y-2">
                    {(formData.preferredWeekends as string[]).map(
                      (date, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                              const newDates = [
                                ...(formData.preferredWeekends as string[]),
                              ];
                              newDates[index] = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                preferredWeekends: newDates,
                              }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newDates = (
                                formData.preferredWeekends as string[]
                              ).filter((_, i) => i !== index);
                              setFormData((prev) => ({
                                ...prev,
                                preferredWeekends: newDates,
                              }));
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove date"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          preferredWeekends: [
                            ...(prev.preferredWeekends as string[]),
                            "",
                          ],
                        }));
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Available Weekend
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Add dates when your club is available to host visiting
                    teams.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Link
              href={`/club-admin/${club.id}`}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              type="submit"
              disabled={loading || formData.teamTypes.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
