"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface Club {
  id: string
  name: string
  location: string | null
  imageUrl: string | null
}

interface S3Image {
  key: string
  url: string
  lastModified: string
  size: number
}

export default function ImageManagement() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [s3Images, setS3Images] = useState<S3Image[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClub, setSelectedClub] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load clubs
      const clubsResponse = await fetch("/api/clubs")
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json()
        setClubs(clubsData)
      }

      // Load S3 images
      const imagesResponse = await fetch("/api/admin/images")
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json()
        setS3Images(imagesData.images)
      }
    } catch {
      console.error("Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const handleLinkImage = async () => {
    if (!selectedClub || !selectedImage) {
      setMessage("Please select both a club and an image")
      return
    }

    try {
      const response = await fetch(`/api/admin/clubs/${selectedClub}/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: selectedImage }),
      })

      if (response.ok) {
        setMessage("Image linked successfully!")
        setSelectedClub("")
        setSelectedImage("")
        await loadData() // Reload to update the UI
      } else {
        const data = await response.json()
        setMessage(data.error || "Failed to link image")
      }
    } catch {
      setMessage("An error occurred")
    }
  }

  const clubsWithImages = clubs.filter(club => club.imageUrl)
  const clubsWithoutImages = clubs.filter(club => !club.imageUrl)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Management</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Clubs</h3>
          <p className="text-2xl font-bold text-primary">{clubs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">With Images</h3>
          <p className="text-2xl font-bold text-green-600">{clubsWithImages.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Without Images</h3>
          <p className="text-2xl font-bold text-red-600">{clubsWithoutImages.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">S3 Images</h3>
          <p className="text-2xl font-bold text-blue-600">{s3Images.length}</p>
        </div>
      </div>

      {/* Link Images Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Link Image to Club</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Club Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Club (without image)
            </label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a club...</option>
              {clubsWithoutImages.map(club => (
                <option key={club.id} value={club.id}>
                  {club.name} {club.location ? `(${club.location})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <select
              value={selectedImage}
              onChange={(e) => setSelectedImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose an image...</option>
              {s3Images.map(image => (
                <option key={image.key} value={image.url}>
                  {image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")} ({(image.size / 1024).toFixed(1)}KB)
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
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleLinkImage}
          disabled={!selectedClub || !selectedImage}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Link Image to Club
        </button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clubs with Images */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Clubs with Images ({clubsWithImages.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {clubsWithImages.map(club => (
              <div key={club.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-12 h-12 relative flex-shrink-0">
                  <Image
                    src={club.imageUrl!}
                    alt={club.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{club.name}</p>
                  <p className="text-sm text-gray-500 truncate">{club.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available S3 Images */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available S3 Images ({s3Images.length})</h2>
          <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {s3Images.map(image => (
              <div key={image.key} className="relative group">
                <div className="w-full h-20 relative border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary">
                  <Image
                    src={image.url}
                    alt={image.key}
                    fill
                    className="object-cover"
                    onClick={() => setSelectedImage(image.url)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate" title={image.key}>
                  {image.key.replace(/^\d{4}-\d{2}-\d{2}-/, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}