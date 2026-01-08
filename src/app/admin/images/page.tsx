"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/Skeleton";

interface Club {
  id: string;
  name: string;
  location: string | null;
  imageUrl: string | null;
}

interface S3Image {
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

interface ClubImageMatch {
  club: Club;
  suggestedImages: S3Image[];
  confidence: number;
}

interface CityDefaultImage {
  id: string;
  city: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function ImageManagement() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [s3Images, setS3Images] = useState<S3Image[]>([]);
  const [cityImages, setCityImages] = useState<CityDefaultImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState<"simple" | "smart" | "cities">(
    "smart"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [processingLinks, setProcessingLinks] = useState<Set<string>>(
    new Set()
  );
  const [showClubsWithoutImages, setShowClubsWithoutImages] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load clubs
      const clubsResponse = await fetch("/api/clubs");
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        setClubs(clubsData.clubs || []);
      }

      // Load S3 images
      const imagesResponse = await fetch("/api/admin/images");
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setS3Images(imagesData.images);
      }

      // Load city default images
      const cityImagesResponse = await fetch("/api/admin/city-images");
      if (cityImagesResponse.ok) {
        const cityImagesData = await cityImagesResponse.json();
        setCityImages(cityImagesData.data || []);
      }
    } catch {
      console.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCityImage = async () => {
    if (!selectedCity || !selectedImage) {
      setMessage("Please select both a city and an image");
      return;
    }

    try {
      const response = await fetch("/api/admin/city-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: selectedCity,
          imageUrl: selectedImage,
        }),
      });

      if (response.ok) {
        setMessage("City default image saved successfully!");
        setSelectedCity("");
        setSelectedImage("");
        await loadData();
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to save city image");
      }
    } catch {
      setMessage("An error occurred");
    }
  };

  const handleDeleteCityImage = async (city: string) => {
    if (!confirm(`Remove default image for ${city}?`)) return;

    try {
      const response = await fetch(
        `/api/admin/city-images/${encodeURIComponent(city)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMessage("City image removed successfully!");
        await loadData();
      } else {
        setMessage("Failed to remove city image");
      }
    } catch {
      setMessage("An error occurred");
    }
  };

  const handleLinkImage = async (clubId?: string, imageUrl?: string) => {
    const targetClubId = clubId || selectedClub;
    const targetImageUrl = imageUrl || selectedImage;

    if (!targetClubId || !targetImageUrl) {
      setMessage("Please select both a club and an image");
      return;
    }

    setProcessingLinks((prev) => new Set(prev).add(targetClubId));

    try {
      const response = await fetch(`/api/admin/clubs/${targetClubId}/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: targetImageUrl }),
      });

      if (response.ok) {
        setMessage("Image linked successfully!");
        if (clubId && imageUrl) {
          // This was a direct link, don't clear selections
        } else {
          setSelectedClub("");
          setSelectedImage("");
        }
        await loadData(); // Reload to update the UI
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to link image");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setProcessingLinks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetClubId);
        return newSet;
      });
    }
  };

  // Smart matching logic
  const smartMatches = useMemo((): ClubImageMatch[] => {
    if (!clubs.length || !s3Images.length) return [];

    const clubsWithoutImages = clubs.filter((club) => !club.imageUrl);

    return clubsWithoutImages
      .map((club) => {
        const clubWords = club.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 2);

        const locationWords =
          club.location
            ?.toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 2) || [];

        const allSearchWords = [...clubWords, ...locationWords];

        const imageMatches = s3Images
          .map((image) => {
            const imageName = image.key
              .toLowerCase()
              .replace(/^\d{4}-\d{2}-\d{2}-/, "");
            let score = 0;

            // Direct name matching (highest score)
            allSearchWords.forEach((word) => {
              if (imageName.includes(word)) {
                score += word.length > 4 ? 10 : 5;
              }
            });

            // Partial matching
            const imageWords = imageName
              .replace(/[^a-z0-9\s]/g, " ")
              .split(/\s+/);
            allSearchWords.forEach((searchWord) => {
              imageWords.forEach((imageWord) => {
                if (
                  imageWord.includes(searchWord) ||
                  searchWord.includes(imageWord)
                ) {
                  score += 2;
                }
              });
            });

            return { image, score };
          })
          .filter((match) => match.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        return {
          club,
          suggestedImages: imageMatches.map((m) => m.image),
          confidence:
            imageMatches.length > 0
              ? Math.min(imageMatches[0].score * 10, 100)
              : 0,
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }, [clubs, s3Images]);

  const clubsWithImages = clubs.filter((club) => club.imageUrl);
  const clubsWithoutImages = clubs.filter((club) => !club.imageUrl);

  const filteredMatches = useMemo(() => {
    if (!searchTerm) return smartMatches;
    return smartMatches.filter(
      (match) =>
        match.club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (match.club.location &&
          match.club.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [smartMatches, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-8 w-64 mb-8" />

        {/* Statistics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>

        {/* Form skeleton */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Images grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crest Management</h1>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("smart")}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === "smart"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Smart Matching
          </button>
          <button
            onClick={() => setViewMode("simple")}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === "simple"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Simple Mode
          </button>
          <button
            onClick={() => setViewMode("cities")}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === "cities"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            City Defaults
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Clubs</h3>
          <p className="text-2xl font-bold text-primary">{clubs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">With Crests</h3>
          <p className="text-2xl font-bold text-green-600">
            {clubsWithImages.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Without Crests
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {clubsWithoutImages.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">S3 Crests</h3>
          <p className="text-2xl font-bold text-blue-600">{s3Images.length}</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {viewMode === "smart" ? (
        /* Smart Matching View */
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search clubs by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredMatches.length} clubs without crests
              </div>
            </div>
          </div>

          {/* Smart Matches */}
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div
                key={match.club.id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {match.club.name}
                    </h3>
                    <p className="text-gray-600">{match.club.location}</p>
                    {match.confidence > 0 && (
                      <div className="flex items-center mt-2">
                        <div className="text-sm text-gray-500 mr-2">
                          Match confidence:
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            match.confidence > 70
                              ? "bg-green-100 text-green-800"
                              : match.confidence > 30
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {match.confidence}%
                        </div>
                      </div>
                    )}
                  </div>
                  {processingLinks.has(match.club.id) && (
                    <div className="text-sm text-blue-600">Processing...</div>
                  )}
                </div>

                {match.suggestedImages.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Suggested crests:
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {match.suggestedImages.map((image, index) => (
                        <div key={image.key} className="relative group">
                          <div className="w-full h-20 relative border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary cursor-pointer transition-colors">
                            <Image
                              src={image.url}
                              alt={`Suggested image: ${image.key}`}
                              fill
                              className="object-cover"
                            />
                            {index === 0 && match.confidence > 50 && (
                              <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                                Best
                              </div>
                            )}
                          </div>
                          <p
                            className="text-xs text-gray-500 mt-1 truncate"
                            title={image.key}
                          >
                            {image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")}
                          </p>
                          <button
                            onClick={() =>
                              handleLinkImage(match.club.id, image.url)
                            }
                            disabled={processingLinks.has(match.club.id)}
                            className="w-full mt-2 px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary-600 transition-colors disabled:opacity-50"
                          >
                            Link This
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No matching crests found. Try using Simple Mode.
                  </div>
                )}
              </div>
            ))}

            {filteredMatches.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm
                  ? "No clubs match your search."
                  : "All clubs have crests assigned!"}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Simple Mode - Original UI */
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Link Crest to Club</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Club Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Club (without crest)
              </label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose a club...</option>
                {clubsWithoutImages.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name} {club.location ? `(${club.location})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Crest Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Crest
              </label>
              <select
                value={selectedImage}
                onChange={(e) => setSelectedImage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose a crest...</option>
                {s3Images.map((image) => (
                  <option key={image.key} value={image.url}>
                    {image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")} (
                    {(image.size / 1024).toFixed(1)}KB)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="w-24 h-24 relative border rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Selected club logo preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => handleLinkImage()}
            disabled={!selectedClub || !selectedImage}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Link Crest to Club
          </button>
        </div>
      )}

      {/* Current Status - Only show in simple mode */}
      {viewMode === "simple" && (
        <div className="space-y-8">
          {/* Clubs Without Images - Collapsible Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              type="button"
              onClick={() => setShowClubsWithoutImages(!showClubsWithoutImages)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-xl font-semibold text-red-600">
                Clubs Without Crests ({clubsWithoutImages.length})
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-500 transition-transform ${showClubsWithoutImages ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showClubsWithoutImages && (
              <div className="space-y-2 max-h-96 overflow-y-auto mt-4">
                {clubsWithoutImages.map((club) => (
                  <div
                    key={club.id}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedClub === club.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => setSelectedClub(club.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{club.name}</p>
                        <p className="text-sm text-gray-500">
                          {club.location || "No location"}
                        </p>
                      </div>
                    </div>
                    {selectedClub === club.id && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Clubs with Images */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Clubs with Crests ({clubsWithImages.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {clubsWithImages.map((club) => (
                  <div
                    key={club.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={club.imageUrl!}
                        alt={club.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {club.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {club.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available S3 Images */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Available S3 Crests ({s3Images.length})
              </h2>
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {s3Images.map((image) => (
                  <div key={image.key} className="relative group">
                    <div className="w-full h-20 relative border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary">
                      <Image
                        src={image.url}
                        alt={`Club logo: ${image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")}`}
                        fill
                        className="object-cover"
                        onClick={() => setSelectedImage(image.url)}
                      />
                    </div>
                    <p
                      className="text-xs text-gray-500 mt-1 truncate"
                      title={image.key}
                    >
                      {image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* City Defaults View */}
      {viewMode === "cities" && (
        <div className="space-y-6">
          {/* Add City Default Image Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Set City Default Crest
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City Name
                </label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="e.g., Dublin, London, Barcelona"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Crest Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Crest
                </label>
                <select
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a crest...</option>
                  {s3Images.map((image) => (
                    <option key={image.key} value={image.url}>
                      {image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")} (
                      {(image.size / 1024).toFixed(1)}KB)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Crest Preview */}
            {selectedImage && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div className="w-24 h-24 relative border rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Selected city image preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleLinkCityImage}
              disabled={!selectedCity || !selectedImage}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save City Default Crest
            </button>
          </div>

          {/* Existing City Default Images */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              City Default Crests ({cityImages.length})
            </h2>

            {cityImages.length === 0 ? (
              <p className="text-gray-500">No city default crests set yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cityImages.map((cityImage) => (
                  <div
                    key={cityImage.id}
                    className="relative bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={cityImage.imageUrl}
                          alt={`${cityImage.city} default image`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg capitalize">
                          {cityImage.city}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Added:{" "}
                          {new Date(cityImage.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleDeleteCityImage(cityImage.city)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available S3 Crests Gallery */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Available S3 Crests</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {s3Images.map((image) => (
                <div key={image.key} className="relative group">
                  <div
                    className="w-full h-20 relative border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <Image
                      src={image.url}
                      alt={`City image: ${image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p
                    className="text-xs text-gray-500 mt-1 truncate"
                    title={image.key}
                  >
                    {image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
