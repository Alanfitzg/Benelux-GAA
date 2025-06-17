"use client";

import { useState } from 'react';
import Image from "next/image";

interface ClubFormData {
  name: string;
  region?: string;
  subRegion?: string;
  map?: string;
  city?: string;
  country?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  codes?: string;
  imageUrl?: string;
}

export default function RegisterClubPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setUploading(false);
    setImageUrl(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('image') as File;
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
      name: formData.get('name') as string,
      region: (formData.get('region') as string) || undefined,
      subRegion: (formData.get('subRegion') as string) || undefined,
      map: (formData.get('map') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
      facebook: (formData.get('facebook') as string) || undefined,
      instagram: (formData.get('instagram') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      codes: (formData.get('codes') as string) || undefined,
      imageUrl: uploadedImageUrl || undefined,
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
    } else {
      setError('Failed to register club.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-2">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Side */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200 bg-white">
          <div className="mb-6">
            {/* GAA/Club Shield Icon */}
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="10" width="70" height="80" rx="16" fill="#166534" stroke="#14532d" strokeWidth="4" />
              <circle cx="50" cy="50" r="18" fill="#fff" stroke="#14532d" strokeWidth="3" />
              <rect x="46" y="30" width="8" height="40" rx="4" fill="#166534" />
              <rect x="38" y="60" width="24" height="6" rx="3" fill="#166534" />
            </svg>
          </div>
          <div className="text-center">
            <span className="text-xl font-bold tracking-widest text-green-800">Welcome!</span>
            <span className="block mt-2 text-gray-500 tracking-wide text-base">Register your club</span>
          </div>
        </div>
        {/* Right Side (Form) */}
        <div className="md:w-1/2 w-full p-8">
          <h1 className="text-3xl font-bold tracking-wide mb-8 text-green-800 text-center">Club Registration</h1>
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Club registered successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Club Name</label>
                <input name="name" placeholder="Club Name" required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
                <input name="region" placeholder="Region" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Sub Region</label>
                <input name="subRegion" placeholder="Sub Region" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Map Link</label>
                <input name="map" placeholder="Map Link" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input name="city" placeholder="City" required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                <input name="country" placeholder="Country" required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
                <input name="facebook" placeholder="Facebook URL" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Instagram URL</label>
                <input name="instagram" placeholder="Instagram URL" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                <input name="website" placeholder="Website" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Codes</label>
                <input name="codes" placeholder="Codes" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400::placeholder" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
              <input name="image" type="file" accept="image/*" className="w-full text-gray-700" />
            </div>
            {uploading && <div className="text-blue-700">Uploading image...</div>}
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="Uploaded club"
                width={128}
                height={128}
                className="max-h-32 mt-2 object-contain rounded"
              />
            )}
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded-lg transition mt-2 tracking-widest">Register Club</button>
          </form>
        </div>
      </div>
    </div>
  );
} 