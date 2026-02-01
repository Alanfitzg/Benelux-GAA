"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Instagram, Play, Images, ExternalLink } from "lucide-react";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instagram/feed?clubId=rome-hibernia")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts.slice(0, 6));
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load Instagram feed");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Instagram className="text-[#c41e3a]" size={24} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Follow Us on Instagram
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return (
      <section className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram className="text-[#c41e3a]" size={24} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Follow Us on Instagram
            </h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Stay up to date with our latest news, matches, and events
          </p>
          <a
            href="https://www.instagram.com/romehiberniagaa/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            <Instagram size={18} />
            @romehiberniagaa
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Instagram className="text-[#c41e3a]" size={24} />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Latest from Instagram
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden rounded-lg group"
            >
              <Image
                src={
                  post.media_type === "VIDEO"
                    ? post.thumbnail_url || post.media_url
                    : post.media_url
                }
                alt={post.caption?.slice(0, 100) || "Instagram post"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                <ExternalLink
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  size={32}
                />
              </div>

              {/* Media type indicator */}
              {post.media_type === "VIDEO" && (
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                  <Play className="text-white" size={16} fill="white" />
                </div>
              )}
              {post.media_type === "CAROUSEL_ALBUM" && (
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                  <Images className="text-white" size={16} />
                </div>
              )}
            </a>
          ))}
        </div>

        <div className="text-center mt-6">
          <a
            href="https://www.instagram.com/romehiberniagaa/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-[#c41e3a] text-[#c41e3a] px-5 py-2 rounded-lg font-semibold hover:bg-[#c41e3a] hover:text-white transition-colors text-sm"
          >
            <Instagram size={18} />
            Follow @romehiberniagaa
          </a>
        </div>
      </div>
    </section>
  );
}
