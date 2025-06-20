"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageUpload from '../../../../components/ImageUpload';
import LocationAutocomplete from '../../../../events/create/LocationAutocomplete';
import { TEAM_TYPES } from "@/lib/constants/teams";
import { URLS, MESSAGES } from "@/lib/constants";

interface ClubData {
  name: string;
  location: string;
  map?: string;
  imageUrl?: string;
  region?: string;
  subRegion?: string;
  codes?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  teamTypes: string[];
}

interface SocialLink {
  platform: string;
  url: string;
}

export default function EditClubPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params?.id as string;

  const [club, setClub] = useState<ClubData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [selectedTeamTypes, setSelectedTeamTypes] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newPlatform, setNewPlatform] = useState("");

  const socialPlatforms = ["Facebook", "Instagram", "Twitter", "YouTube", "Website", "Other"];

  useEffect(() => {
    fetch(`${URLS.API.CLUBS}/${clubId}`)
      .then((res) => res.json())
      .then((data) => {
        setClub(data);
        setLocation(data.location || "");
        setImageUrl(data.imageUrl || null);
        setSelectedTeamTypes(data.teamTypes || []);
        
        // Convert existing social links to array format
        const links: SocialLink[] = [];
        if (data.facebook) links.push({ platform: "Facebook", url: data.facebook });
        if (data.instagram) links.push({ platform: "Instagram", url: data.instagram });
        if (data.website) links.push({ platform: "Website", url: data.website });
        setSocialLinks(links);
      });
  }, [clubId]);

  const handleTeamTypeToggle = (type: string) => {
    setSelectedTeamTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const addSocialLink = () => {
    if (newPlatform && !socialLinks.some(link => link.platform === newPlatform)) {
      setSocialLinks([...socialLinks, { platform: newPlatform, url: "" }]);
      setNewPlatform("");
    }
  };

  const updateSocialLink = (index: number, url: string) => {
    const newLinks = [...socialLinks];
    newLinks[index].url = url;
    setSocialLinks(newLinks);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  async function handleSubmit(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(false);
    const form = eventForm.target as HTMLFormElement;
    const file = imageFile;
    let uploadedImageUrl = "";
    
    if (file && file.size > 0) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch(URLS.API.UPLOAD, {
        method: "POST",
        body: uploadData,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        setError(MESSAGES.ERROR.UPLOAD_FAILED);
        return;
      }
      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.url;
      setImageUrl(uploadedImageUrl);
    }
    
    // Convert social links back to individual fields
    const socialFields: Record<string, string> = {};
    socialLinks.forEach(link => {
      if (link.url) {
        const fieldName = link.platform.toLowerCase();
        socialFields[fieldName] = link.url;
      }
    });
    
    const data = {
      name: (form.clubName as unknown as HTMLInputElement).value,
      location,
      map: (form.map as unknown as HTMLInputElement)?.value || undefined,
      region: (form.region as unknown as HTMLInputElement)?.value || undefined,
      subRegion: (form.subRegion as unknown as HTMLInputElement)?.value || undefined,
      codes: (form.codes as unknown as HTMLInputElement)?.value || undefined,
      imageUrl: uploadedImageUrl || imageUrl || undefined,
      teamTypes: selectedTeamTypes,
      ...socialFields,
    };
    
    const res = await fetch(`${URLS.API.CLUBS}/${clubId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/admin/clubs'), 2000);
    } else {
      setError(MESSAGES.ERROR.GENERIC);
    }
  }

  if (!club) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/admin/clubs"
              className="text-primary hover:text-primary/80 transition mb-4 inline-block"
            >
              ← Back to Clubs
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Club</h1>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-8 md:p-12">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-green-500">✅</span>
                  <span>Club updated successfully! Redirecting...</span>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-red-500">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Club Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Club Name
                    </label>
                    <input
                      type="text"
                      name="clubName"
                      defaultValue={club.name}
                      placeholder="Enter club name"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Location
                    </label>
                    <LocationAutocomplete value={location} onChange={setLocation} />
                  </div>

                  {/* Map URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Map URL <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="map"
                      defaultValue={club.map}
                      placeholder="https://maps.google.com/..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Region <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="region"
                      defaultValue={club.region}
                      placeholder="e.g., Munster"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>

                  {/* Sub Region */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sub Region <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="subRegion"
                      defaultValue={club.subRegion}
                      placeholder="e.g., County Cork"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>

                  {/* Club Codes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Club Codes <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="codes"
                      defaultValue={club.codes}
                      placeholder="e.g., BKS, BLA"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>

                  {/* Team Types */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Team Types
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {TEAM_TYPES.map((type) => (
                        <label
                          key={type}
                          className={`
                            flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${selectedTeamTypes.includes(type)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeamTypes.includes(type)}
                            onChange={() => handleTeamTypeToggle(type)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Social Media Links <span className="text-gray-400">(Optional)</span>
                    </label>
                    
                    {/* Add Platform Button */}
                    <div className="flex gap-3 mb-4">
                      <select
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                      >
                        <option value="">Select Platform</option>
                        {socialPlatforms
                          .filter(p => !socialLinks.some(link => link.platform === p))
                          .map(platform => (
                            <option key={platform} value={platform}>{platform}</option>
                          ))
                        }
                      </select>
                      <button
                        type="button"
                        onClick={addSocialLink}
                        disabled={!newPlatform}
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Platform
                      </button>
                    </div>

                    {/* Social Links List */}
                    <div className="space-y-3">
                      {socialLinks.map((link, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-32 flex items-center px-4 py-3 bg-gray-100 rounded-xl">
                            <span className="text-sm font-medium">{link.platform}</span>
                          </div>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, e.target.value)}
                            placeholder={`${link.platform} URL`}
                            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Club Logo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Club Logo <span className="text-gray-400">(Optional)</span>
                    </label>
                    <ImageUpload
                      value={imageUrl}
                      onChange={(file) => setImageFile(file)}
                      uploading={uploading}
                      error={error}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 border-t border-gray-200 flex justify-between">
                  <Link
                    href="/admin/clubs"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </span>
                    ) : (
                      "Update Club"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 