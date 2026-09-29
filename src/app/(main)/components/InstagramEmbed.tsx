"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SCRIPT_ID = "instagram-embed-script";

export function extractInstagramPermalink(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/
  );
  if (!match) return null;
  const type = match[1] === "reels" ? "reel" : match[1];
  return `https://www.instagram.com/${type}/${match[2]}/`;
}

export default function InstagramEmbed({
  permalink,
  caption,
}: {
  permalink: string;
  caption?: string;
}) {
  useEffect(() => {
    const process = () => window.instgrm?.Embeds.process();

    if (window.instgrm) {
      process();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", process);
      return () => existing.removeEventListener("load", process);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.addEventListener("load", process);
    document.body.appendChild(script);
    return () => script.removeEventListener("load", process);
  }, [permalink]);

  const html = `<blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14" style="background:#fff;border:1px solid #dbdbdb;border-radius:12px;margin:0;max-width:540px;min-width:280px;width:100%;padding:16px;text-align:center;"><a href="${permalink}" target="_blank" rel="noopener noreferrer" style="color:#2B9EB3;font-weight:500;">Watch this video on Instagram</a></blockquote>`;

  return (
    <figure className="my-8 flex flex-col items-center">
      <div
        key={permalink}
        className="w-full flex justify-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {caption && caption !== "image" && (
        <figcaption className="text-center text-sm text-gray-400 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
