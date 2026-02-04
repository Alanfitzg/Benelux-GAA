"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Instagram, Facebook, Youtube } from "lucide-react";
import InternalLink from "./InternalLink";
import { getAssetUrl } from "../constants";

const CLUB_ID = "benelux-gaa";

// X (Twitter) icon
const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  twitter: string;
}

const defaultSocialLinks: SocialLinks = {
  instagram: "https://www.instagram.com/beneluxgaa/",
  facebook: "https://www.facebook.com/BeneluxGAA/",
  youtube: "",
  twitter: "https://twitter.com/BeneluxGAA",
};

export default function Footer() {
  const [socialLinks, setSocialLinks] =
    useState<SocialLinks>(defaultSocialLinks);

  useEffect(() => {
    fetch(`/api/club-content?clubId=${CLUB_ID}&pageKey=settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          const links = { ...defaultSocialLinks };
          Object.entries(data.content).forEach(([key, val]) => {
            const platform = key.replace("social_", "") as keyof SocialLinks;
            if (platform in links) {
              const value = (val as { value: string }).value;
              if (value) {
                links[platform] = value;
              }
            }
          });
          setSocialLinks(links);
        }
      })
      .catch(() => {});
  }, []);

  const socialButtons = [
    {
      key: "instagram",
      href: socialLinks.instagram,
      icon: Instagram,
      style: {
        background:
          "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      },
    },
    {
      key: "facebook",
      href: socialLinks.facebook,
      icon: Facebook,
      className: "bg-[#1877f2]",
    },
    {
      key: "twitter",
      href: socialLinks.twitter,
      icon: XIcon,
      className: "bg-black",
    },
    {
      key: "youtube",
      href: socialLinks.youtube,
      icon: Youtube,
      className: "bg-[#ff0000]",
    },
  ];

  const activeSocialButtons = socialButtons.filter((btn) => btn.href);

  return (
    <footer className="bg-[#0d1f28] text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <InternalLink href="/">
            <Image
              src={getAssetUrl("/benelux-gaa-crest.png")}
              alt="Benelux GAA"
              width={60}
              height={60}
              className="object-contain"
              unoptimized
            />
          </InternalLink>

          {/* Social Icons */}
          {activeSocialButtons.length > 0 && (
            <div className="flex gap-3">
              {activeSocialButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <a
                    key={btn.key}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity ${btn.className || ""}`}
                    style={btn.style}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Bottom Line */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-gray-500 pt-2">
            <span>&copy; {new Date().getFullYear()} Benelux GAA</span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span>
              Powered by{" "}
              <InternalLink
                href="/powered-by"
                className="text-[#2B9EB3] hover:text-white transition-colors font-medium"
              >
                PlayAway
              </InternalLink>
            </span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <InternalLink
              href="/admin"
              className="text-gray-600 hover:text-gray-400 transition-colors"
            >
              Admin
            </InternalLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
