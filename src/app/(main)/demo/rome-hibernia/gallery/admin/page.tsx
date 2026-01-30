"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Image from "next/image";
import {
  Upload,
  Trash2,
  GripVertical,
  X,
  Check,
  ImageIcon,
  Loader2,
} from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export default function GalleryAdminPage() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "CLUB_ADMIN";

  const fetchImages = useCallback(async () => {
    const res = await fetch("/api/gallery?clubId=rome-hibernia");
    const data = await res.json();
    setImages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status !== "loading") {
      fetchImages();
    }
  }, [status, fetchImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clubId", "rome-hibernia");

      await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });
    }

    await fetchImages();
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;

    await fetch(`/api/gallery?id=${id}`, {
      method: "DELETE",
    });

    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleCaptionSave = async (id: string) => {
    await fetch("/api/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, caption: captionValue }),
    });

    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, caption: captionValue } : img
      )
    );
    setEditingCaption(null);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = images.findIndex((img) => img.id === draggedId);
    const targetIndex = images.findIndex((img) => img.id === targetId);

    const newImages = [...images];
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, removed);

    setImages(newImages);
  };

  const handleDragEnd = async () => {
    if (!draggedId) return;

    const imageIds = images.map((img) => img.id);
    await fetch("/api/gallery/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds }),
    });

    setDraggedId(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage="Gallery" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#c41e3a]" size={48} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage="Gallery" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Access Required
            </h1>
            <p className="text-gray-600">
              You need to be logged in as an admin to manage the gallery.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Gallery" />

      <main className="flex-1">
        <section className="py-8 sm:py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Gallery Manager
                </h1>
                <p className="text-gray-600 mt-1">
                  Upload, reorder, and manage gallery photos
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#c41e3a] hover:bg-[#a01830] text-white"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Photos
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Tip:</strong> Drag and drop images to reorder them.
                Click on an image caption to edit it.
              </p>
            </div>

            {images.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg mb-2">No photos yet</p>
                <p className="text-gray-400">
                  Click &quot;Upload Photos&quot; to add images to the gallery
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(image.id)}
                    onDragOver={(e) => handleDragOver(e, image.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group ${
                      draggedId === image.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={image.caption || "Gallery image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                          <GripVertical className="text-white" size={24} />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(image.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 rounded-full hover:bg-red-700"
                        >
                          <Trash2 className="text-white" size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      {editingCaption === image.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={captionValue}
                            onChange={(e) => setCaptionValue(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#c41e3a]"
                            placeholder="Add a caption..."
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleCaptionSave(image.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCaption(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCaption(image.id);
                            setCaptionValue(image.caption || "");
                          }}
                          className="w-full text-left text-sm text-gray-600 hover:text-gray-900 truncate"
                        >
                          {image.caption || (
                            <span className="text-gray-400 italic">
                              Add caption...
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
