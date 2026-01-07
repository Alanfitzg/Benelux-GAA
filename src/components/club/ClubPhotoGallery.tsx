"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ClubPhoto } from "@/types";

interface ClubPhotoGalleryProps {
  clubId: string;
  isAdmin?: boolean;
  onCoverPhotoChange?: (photo: ClubPhoto | null) => void;
}

export default function ClubPhotoGallery({
  clubId,
  isAdmin = false,
  onCoverPhotoChange,
}: ClubPhotoGalleryProps) {
  const [photos, setPhotos] = useState<ClubPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ClubPhoto | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [settingCover, setSettingCover] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch(`/api/clubs/${clubId}/photos`);
        if (response.ok) {
          const data = await response.json();
          setPhotos(data.photos);
          // Notify parent of cover photo
          const coverPhoto = data.photos.find((p: ClubPhoto) => p.isCoverPhoto);
          onCoverPhotoChange?.(coverPhoto || null);
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [clubId, onCoverPhotoChange]);

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(
        `/api/clubs/${clubId}/photos?photoId=${photoId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setPhotos(photos.filter((p) => p.id !== photoId));
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
      } else {
        alert("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
    }
  };

  const handleSetCover = async (photoId: string) => {
    setSettingCover(photoId);
    try {
      const response = await fetch(`/api/clubs/${clubId}/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isCoverPhoto: true }),
      });

      if (response.ok) {
        const updatedPhoto = await response.json();
        setPhotos(
          photos.map((p) => ({
            ...p,
            isCoverPhoto: p.id === photoId,
          }))
        );
        onCoverPhotoChange?.(updatedPhoto);
      } else {
        alert("Failed to set cover photo");
      }
    } catch (error) {
      console.error("Error setting cover photo:", error);
      alert("Failed to set cover photo");
    } finally {
      setSettingCover(null);
    }
  };

  if (loading) {
    return (
      <section id="gallery" className="scroll-mt-24">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-gray-200 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <section id="gallery" className="scroll-mt-24">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Photo Gallery
          </h2>
          {isAdmin && photos.length < 3 && (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              {showAddForm ? "Cancel" : "Add Photo"}
            </button>
          )}
        </div>

        {showAddForm && isAdmin && (
          <AddPhotoForm
            clubId={clubId}
            onAdded={(newPhoto) => {
              setPhotos([...photos, newPhoto]);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No photos yet
            </h3>
            <p className="text-gray-500">
              {isAdmin
                ? "Add up to 3 photos to showcase your club."
                : "No photos have been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className={`w-full aspect-video relative rounded-lg overflow-hidden bg-gray-100 ${photo.isCoverPhoto ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || "Club photo"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                  {photo.isCoverPhoto && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs font-medium rounded">
                      Cover Photo
                    </span>
                  )}
                </button>
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!photo.isCoverPhoto && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(photo.id)}
                        disabled={settingCover === photo.id}
                        className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50"
                        title="Set as cover photo"
                      >
                        {settingCover === photo.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
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
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(photo.id)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                      title="Delete photo"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                {photo.caption && (
                  <p className="mt-2 text-sm text-gray-600 truncate">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || "Club photo"}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh] w-auto mx-auto"
              unoptimized
            />
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-4">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

interface AddPhotoFormProps {
  clubId: string;
  onAdded: (photo: ClubPhoto) => void;
  onCancel: () => void;
}

function AddPhotoForm({ clubId, onAdded, onCancel }: AddPhotoFormProps) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url) {
      setError("Photo URL is required");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: caption || null }),
      });

      if (response.ok) {
        const photo = await response.json();
        onAdded(photo);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add photo");
      }
    } catch (err) {
      console.error("Error adding photo:", err);
      setError("Failed to add photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caption (optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g., Tournament final 2024"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Photo"}
          </button>
        </div>
      </div>
    </form>
  );
}
