"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

const CLUB_ID = "benelux-gaa";

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await fetch(`/api/gallery?clubId=${CLUB_ID}`);
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clubId", CLUB_ID);

      try {
        const res = await fetch("/api/gallery", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const newImage = await res.json();
          setImages((prev) => [...prev, newImage]);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
            <ImageIcon size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gallery Images
          </h3>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
          <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No gallery images yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Click Upload to add images
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-video bg-gray-200 rounded-lg overflow-hidden"
            >
              <Image
                src={image.url}
                alt={image.caption || "Gallery image"}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                disabled={deleting === image.id}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
              >
                {deleting === image.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Images appear in the homepage gallery carousel. Recommended: landscape,
        min 1920x1080px.
      </p>
    </div>
  );
}
