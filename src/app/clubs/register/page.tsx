"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from "next/image";
import ImageUpload from '../../components/ImageUpload';
import LocationAutocomplete from '../../events/create/LocationAutocomplete';
import TeamTypeMultiSelect from '@/components/forms/TeamTypeMultiSelect';
import type { Club } from '@/types';

type ClubFormData = Omit<Club, 'id' | 'latitude' | 'longitude'>;

type SocialMediaPlatform = {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  baseUrl: string;
};

const SOCIAL_PLATFORMS: SocialMediaPlatform[] = [
  { id: 'facebook', name: 'Facebook', icon: '📘', placeholder: 'facebook.com/yourclub', baseUrl: 'https://facebook.com/' },
  { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'instagram.com/yourclub', baseUrl: 'https://instagram.com/' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', placeholder: 'twitter.com/yourclub', baseUrl: 'https://twitter.com/' },
  { id: 'website', name: 'Website', icon: '🌐', placeholder: 'www.yourclub.com', baseUrl: 'https://' },
];

export default function RegisterClubPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [teamTypes, setTeamTypes] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState<{[key: string]: string}>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const router = useRouter();

  const addSocialPlatform = (platformId: string) => {
    if (!selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
      setSocialMedia({...socialMedia, [platformId]: ''});
    }
  };

  const removeSocialPlatform = (platformId: string) => {
    setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId));
    const newSocialMedia = {...socialMedia};
    delete newSocialMedia[platformId];
    setSocialMedia(newSocialMedia);
  };

  const updateSocialMedia = (platformId: string, value: string) => {
    setSocialMedia({...socialMedia, [platformId]: value});
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setUploading(false);
    setImageUrl(null);
    const form = event.currentTarget;
    const file = imageFile;
    let uploadedImageUrl = '';
    
    if (file && file.size > 0) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        setError('Image upload failed.');
        return;
      }
      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.url;
      setImageUrl(uploadedImageUrl);
    }
    
    // Prepare club data
    const data: ClubFormData = {
      name: (form.elements.namedItem('name') as HTMLInputElement)?.value || '',
      location,
      region: (form.elements.namedItem('region') as HTMLInputElement)?.value || null,
      subRegion: (form.elements.namedItem('subRegion') as HTMLInputElement)?.value || null,
      facebook: socialMedia.facebook || null,
      instagram: socialMedia.instagram || null,
      website: socialMedia.website || null,
      codes: (form.elements.namedItem('codes') as HTMLInputElement)?.value || null,
      imageUrl: uploadedImageUrl || null,
      map: null,
      teamTypes
    };
    
    const res = await fetch('/api/clubs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      setSuccess(true);
      form.reset();
      setImageUrl(null);
      router.push('/clubs');
    } else {
      setError('Failed to register club.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Register Your Club
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join the global Gaelic community and connect with players and clubs worldwide.
            </p>
          </motion.div>
        </div>
        {/* Animated background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Form Section */}
      <div className="relative -mt-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-professional-lg border border-gray-200/50 overflow-hidden">
            <div className="p-8 md:p-12">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-green-500">✅</span>
                  <span>Club registered successfully!</span>
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
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Club Name */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Club Name
                    </label>
                    <input
                      name="name"
                      placeholder="Enter your club name"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Location */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Location
                    </label>
                    <LocationAutocomplete value={location} onChange={setLocation} />
                  </motion.div>

                  {/* Team Types */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Team Types
                    </label>
                    <TeamTypeMultiSelect value={teamTypes} onChange={setTeamTypes} />
                  </motion.div>

                  {/* Region */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Region <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      name="region"
                      placeholder="e.g., Europe, North America"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Sub Region */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sub Region <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      name="subRegion"
                      placeholder="e.g., Western Europe, East Coast"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Codes */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Club Codes <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      name="codes"
                      placeholder="Enter any club identification codes"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Social Media Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Social Media & Website <span className="text-gray-400">(Optional)</span>
                    </label>
                    
                    {/* Add Platform Buttons */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {SOCIAL_PLATFORMS.filter(platform => !selectedPlatforms.includes(platform.id)).map((platform) => (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => addSocialPlatform(platform.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-primary/10 text-gray-700 rounded-lg border border-gray-200 hover:border-primary/30 transition-all duration-200"
                        >
                          <span>{platform.icon}</span>
                          <span className="text-sm font-medium">Add {platform.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Selected Platform Inputs */}
                    <div className="space-y-4">
                      {selectedPlatforms.map((platformId, index) => {
                        const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
                        if (!platform) return null;
                        
                        return (
                          <motion.div
                            key={platformId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <span className="text-2xl">{platform.icon}</span>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                {platform.name}
                              </label>
                              <input
                                type="url"
                                value={socialMedia[platformId] || ''}
                                onChange={(e) => updateSocialMedia(platformId, e.target.value)}
                                placeholder={platform.placeholder}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSocialPlatform(platformId)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              ✕
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Club Image */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Club Logo/Image <span className="text-gray-400">(Optional)</span>
                    </label>
                    <ImageUpload
                      value={imageUrl}
                      onChange={file => setImageFile(file)}
                      uploading={uploading}
                      error={error}
                    />
                    {imageUrl && (
                      <div className="mt-4 flex justify-center">
                        <Image
                          src={imageUrl}
                          alt="Uploaded club logo"
                          width={128}
                          height={128}
                          className="max-h-32 object-contain rounded-xl border border-gray-200"
                        />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="pt-8 border-t border-gray-200"
                >
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Registering Club...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>Register Club</span>
                        <span>→</span>
                      </span>
                    )}
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}