"use client";

import { useState } from 'react';

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
    <div className="container mx-auto max-w-xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Register a New Club</h1>
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Club Name" required className="w-full border px-3 py-2 rounded" />
        <input name="region" placeholder="Region" className="w-full border px-3 py-2 rounded" />
        <input name="subRegion" placeholder="Sub Region" className="w-full border px-3 py-2 rounded" />
        <input name="map" placeholder="Map Link" className="w-full border px-3 py-2 rounded" />
        <input name="city" placeholder="City" className="w-full border px-3 py-2 rounded" />
        <input name="country" placeholder="Country" className="w-full border px-3 py-2 rounded" />
        <input name="facebook" placeholder="Facebook URL" className="w-full border px-3 py-2 rounded" />
        <input name="instagram" placeholder="Instagram URL" className="w-full border px-3 py-2 rounded" />
        <input name="website" placeholder="Website" className="w-full border px-3 py-2 rounded" />
        <input name="codes" placeholder="Codes" className="w-full border px-3 py-2 rounded" />
        <input name="image" type="file" accept="image/*" className="w-full border px-3 py-2 rounded" />
        {uploading && <div className="text-blue-700">Uploading image...</div>}
        {imageUrl && <img src={imageUrl} alt="Uploaded club" className="max-h-32 mt-2" />}
        <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">Register Club</button>
      </form>
    </div>
  );
} 