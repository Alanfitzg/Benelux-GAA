"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";
import ImageUpload from '../../components/ImageUpload';
import LocationAutocomplete from '../../events/create/LocationAutocomplete';
import TeamTypeMultiSelect from '@/components/forms/TeamTypeMultiSelect';
import CountryCodeSelector from '@/components/CountryCodeSelector';
import type { Club } from '@/types';
import { toast } from 'react-hot-toast';

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
  const { data: session, status } = useSession();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [teamTypes, setTeamTypes] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState<{[key: string]: string}>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCountryCode, setContactCountryCode] = useState('+353');
  const [isContactWilling, setIsContactWilling] = useState(false);
  const router = useRouter();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/signin?callbackUrl=/clubs/register');
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to register a club. This helps us verify club authenticity and reduces fraud.
          </p>
          <Link
            href="/signin?callbackUrl=/clubs/register"
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

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
      uploadData.append('type', 'club-crest');
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        const errorMsg = 'Image upload failed.';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.url;
      setImageUrl(uploadedImageUrl);
      toast.success('Image uploaded successfully!');
    }
    
    // Prepare club data
    const data: ClubFormData = {
      name: (form.elements.namedItem('name') as HTMLInputElement)?.value || '',
      location,
      internationalUnit: (form.elements.namedItem('internationalUnit') as HTMLInputElement)?.value || '',
      region: (form.elements.namedItem('region') as HTMLInputElement)?.value || null,
      subRegion: (form.elements.namedItem('subRegion') as HTMLInputElement)?.value || null,
      facebook: socialMedia.facebook || null,
      instagram: socialMedia.instagram || null,
      website: socialMedia.website || null,
      codes: null,
      imageUrl: uploadedImageUrl || null,
      map: null,
      teamTypes,
      contactFirstName: contactFirstName || null,
      contactLastName: contactLastName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      contactCountryCode: contactCountryCode || null,
      isContactWilling
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
      toast.success('Club registered successfully! Your club will be reviewed and approved shortly.');
      // Don't redirect - let user see the success message about approval
    } else {
      const errorData = await res.json();
      const errorMsg = errorData.error || 'Failed to register club.';
      setError(errorMsg);
      toast.error(`Failed to register club: ${errorMsg}`);
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
                  className="bg-green-50 border border-green-200 text-green-700 px-6 py-6 rounded-xl mb-8"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-0.5">✅</span>
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">Club Registration Submitted!</h3>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>Your club registration has been submitted successfully and is now <strong>pending approval</strong>.</p>
                        <p>Our admin team will review your submission and notify you once it&apos;s approved.</p>
                        <p className="mt-3">
                          <Link href="/clubs" className="underline hover:no-underline">
                            Browse existing clubs
                          </Link>
                          {" "}while you wait, or{" "}
                          <Link href="/events" className="underline hover:no-underline">
                            explore tournaments
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
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

                  {/* International Unit */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      International Unit <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="internationalUnit"
                      placeholder="e.g., Europe, North America, Asia"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Region (within International Unit) */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Region <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      name="region"
                      placeholder="e.g., Western Europe, East Coast"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Sub Region */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sub Region <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      name="subRegion"
                      placeholder="e.g., County Cork, New York State"
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

                {/* Contact Person Section - Separate Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="mt-12 pt-12 border-t-2 border-gray-300"
                >
                  <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Contact Person Information
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Please provide details of the person we can contact about this club
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={contactFirstName}
                          onChange={(e) => setContactFirstName(e.target.value)}
                          placeholder="Enter first name"
                          required
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={contactLastName}
                          onChange={(e) => setContactLastName(e.target.value)}
                          placeholder="Enter last name"
                          required
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                        />
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Enter email address"
                          required
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                        />
                      </div>

                      {/* Phone */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Phone Number <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="flex space-x-3">
                          <CountryCodeSelector
                            value={contactCountryCode}
                            onChange={setContactCountryCode}
                          />
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-4 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                          />
                        </div>
                      </div>

                      {/* Contact Willing Checkbox */}
                      <div className="md:col-span-2">
                        <div className="bg-blue-100 rounded-xl p-4">
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isContactWilling}
                              onChange={(e) => setIsContactWilling(e.target.checked)}
                              className="mt-1 w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-primary focus:ring-offset-2"
                            />
                            <span className="text-sm text-gray-700 leading-relaxed">
                              <strong>I am willing to be the Point of Contact</strong> for this club and consent to being contacted about club-related matters, tournament opportunities, and platform updates.
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="pt-8 mt-8"
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