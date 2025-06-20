"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from '../../../../components/ImageUpload';
import LocationAutocomplete from '../../../../events/create/LocationAutocomplete';
import TeamTypeMultiSelect from '@/components/forms/TeamTypeMultiSelect';

type ClubDetails = {
  id: string;
  name: string;
  location: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  region: string | null;
  subRegion: string | null;
  map: string | null;
  imageUrl: string | null;
  teamTypes: string[];
};

export default function EditClubPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params?.id as string;
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [teamTypes, setTeamTypes] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/clubs/${clubId}`)
      .then((res) => res.json())
      .then((data) => {
        setClub(data);
        setImageUrl(data.imageUrl || null);
        setTeamTypes(data.teamTypes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [clubId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(false);
    const form = event.currentTarget;
    const file = imageFile;
    let uploadedImageUrl = imageUrl || "";
    if (file && file.size > 0) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        setError("Image upload failed.");
        return;
      }
      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.url;
      setImageUrl(uploadedImageUrl);
    }
    const data = {
      name: form.name,
      location: club?.location || "",
      facebook: form.facebook,
      instagram: form.instagram,
      website: form.website,
      codes: form.codes,
      imageUrl: uploadedImageUrl || undefined,
      teamTypes,
    };
    const res = await fetch(`/api/clubs/${clubId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      setError("Failed to update club.");
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!club) return <div className="p-8 text-red-600">Club not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-2">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-[#032572] text-center">Edit Club</h1>
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Club updated successfully!
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
              <input name="name" defaultValue={club.name} required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400::placeholder" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <LocationAutocomplete value={club.location || ""} onChange={val => setClub({ ...club, location: val })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Team Types</label>
            <TeamTypeMultiSelect value={teamTypes} onChange={setTeamTypes} />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
              <input name="facebook" defaultValue={club.facebook || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400::placeholder" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Instagram URL</label>
              <input name="instagram" defaultValue={club.instagram || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400::placeholder" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
              <input name="website" defaultValue={club.website || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400::placeholder" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Codes</label>
              <input name="codes" defaultValue={club.codes || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400::placeholder" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
            <ImageUpload
              value={imageUrl}
              onChange={file => setImageFile(file)}
              uploading={uploading}
              error={error}
            />
          </div>
          <button type="submit" className="w-full bg-[#032572] hover:bg-blue-900 text-white font-bold py-2 rounded-lg transition mt-2 tracking-widest">Update Club</button>
        </form>
      </div>
    </div>
  );
} 