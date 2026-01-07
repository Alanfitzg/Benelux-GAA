"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ClubPhoto } from "@/types";

interface ClubCoverPhotoBannerProps {
  clubId: string;
}

export default function ClubCoverPhotoBanner({
  clubId,
}: ClubCoverPhotoBannerProps) {
  const [coverPhoto, setCoverPhoto] = useState<ClubPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoverPhoto() {
      try {
        const response = await fetch(`/api/clubs/${clubId}/photos`);
        if (response.ok) {
          const data = await response.json();
          const cover = data.photos.find((p: ClubPhoto) => p.isCoverPhoto);
          setCoverPhoto(cover || null);
        }
      } catch (error) {
        console.error("Error fetching cover photo:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoverPhoto();
  }, [clubId]);

  if (loading || !coverPhoto) {
    return null;
  }

  return (
    <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
      <Image
        src={coverPhoto.url}
        alt={coverPhoto.caption || "Club cover photo"}
        fill
        className="object-cover"
        priority
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      {coverPhoto.caption && (
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white text-sm font-medium drop-shadow-lg">
            {coverPhoto.caption}
          </p>
        </div>
      )}
    </div>
  );
}
