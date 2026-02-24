"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Pencil, Check, X, Newspaper } from "lucide-react";
import { useClubContent } from "../context/ClubContentContext";

export default function FeaturedArticle() {
  const { isAdmin, getContent, saveContent } = useClubContent();
  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const savedHeadline = getContent(
    "home",
    "featured_headline",
    "McDermott relieved after Amsterdam's Leinster win"
  );
  const savedDescription = getContent(
    "home",
    "featured_description",
    "Amsterdam's Leinster GAA celebrate a hard-fought victory in the 2025 season, as covered by RTE Sport."
  );
  const savedUrl = getContent(
    "home",
    "featured_url",
    "https://www.rte.ie/sport/hurling/2025/1124/1545513-mcdermott-relieved-after-amsterdams-leinster-win/"
  );
  const savedImageUrl = getContent(
    "home",
    "featured_image",
    "https://www.rte.ie/images/0023822a-1600.jpg"
  );

  if (!savedHeadline && !isAdmin) return null;

  const startEditing = () => {
    setHeadline(savedHeadline);
    setDescription(savedDescription);
    setUrl(savedUrl);
    setImageUrl(savedImageUrl);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      saveContent("home", "featured_headline", headline, 120),
      saveContent("home", "featured_description", description, 200),
      saveContent("home", "featured_url", url, 500),
      saveContent("home", "featured_image", imageUrl, 500),
    ]);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <section className="py-6 md:py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white border-2 border-[#2B9EB3] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Edit Featured Article
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2B9EB3] text-white text-sm rounded-lg hover:bg-[#238a9c] disabled:opacity-50"
                >
                  <Check size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Article headline..."
                  maxLength={120}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the article..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (leave empty for default style)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-400">
                Leave all fields empty to hide the featured article banner.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!savedHeadline) {
    return (
      <section className="py-6 md:py-10">
        <div className="max-w-6xl mx-auto px-4">
          <button
            type="button"
            onClick={startEditing}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-400 hover:border-[#2B9EB3] hover:text-[#2B9EB3] transition-colors flex items-center justify-center gap-2"
          >
            <Newspaper size={20} />
            Add Featured Article
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4">
        <a
          href={savedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="relative bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
            <div className="flex flex-col md:flex-row">
              {savedImageUrl && (
                <div className="relative w-full md:w-[420px] h-48 md:h-auto flex-shrink-0">
                  <Image
                    src={savedImageUrl}
                    alt={savedHeadline}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 p-5 md:p-12 flex flex-col justify-center text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                    <Newspaper size={14} />
                    Featured
                  </span>
                </div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
                  As seen on RTE
                </p>
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 group-hover:text-[#4ecde6] transition-colors">
                  {savedHeadline}
                </h3>
                {savedDescription && (
                  <p className="text-white/80 text-sm md:text-lg mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 max-w-2xl mx-auto">
                    {savedDescription}
                  </p>
                )}
                <span className="inline-flex items-center justify-center gap-1.5 text-[#4ecde6] text-base font-semibold group-hover:gap-2.5 transition-all">
                  Read Article on RTE.ie
                  <ExternalLink size={16} />
                </span>
              </div>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startEditing();
                }}
                className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
              >
                <Pencil size={16} className="text-white" />
              </button>
            )}
          </div>
        </a>
      </div>
    </section>
  );
}
