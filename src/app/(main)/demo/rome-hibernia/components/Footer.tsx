"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import InternalLink from "./InternalLink";

const CLUB_ID = "rome-hibernia";

interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
}

const defaultSocialLinks: SocialLinks = {
  instagram: "https://www.instagram.com/romehiberniagaa/",
  facebook: "https://www.facebook.com/RomeHiberniaGAA/",
  youtube: "",
  linkedin: "",
  tiktok: "",
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
      key: "youtube",
      href: socialLinks.youtube,
      icon: Youtube,
      className: "bg-[#ff0000]",
    },
    {
      key: "linkedin",
      href: socialLinks.linkedin,
      icon: Linkedin,
      className: "bg-[#0077b5]",
    },
    {
      key: "tiktok",
      href: socialLinks.tiktok,
      icon: LinkIcon,
      className: "bg-black border border-white",
    },
  ];

  const activeSocialButtons = socialButtons.filter((btn) => btn.href);

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Where we train */}
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-4">
              <Image
                src="/club-crests/rome-hibernia-NEW.png"
                alt="Rome Hibernia GAA"
                width={60}
                height={60}
                className="object-contain"
                unoptimized
              />
            </div>
            <h4 className="font-medium mb-2">Where we train</h4>
            <p className="text-gray-400 text-sm">Stadio delle Tre Fontane</p>
            <p className="text-gray-400 text-sm">Via delle Tre Fontane, 5</p>
            <p className="text-gray-400 text-sm">00144 Roma RM, Italy</p>
            <a
              href="https://maps.google.com/?q=Stadio+delle+Tre+Fontane,+Via+delle+Tre+Fontane,+5,+00144+Roma+RM,+Italy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-sm underline hover:text-[#c41e3a] transition-colors mt-2 inline-block"
            >
              Show on Google Maps
            </a>
          </div>

          {/* Social Media */}
          <div className="text-center sm:text-right">
            <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">
              Contact us on social media
            </h4>
            {activeSocialButtons.length > 0 && (
              <div className="flex gap-2 sm:gap-3 justify-center sm:justify-end md:justify-end mb-3 sm:mb-4 flex-wrap">
                {activeSocialButtons.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <a
                      key={btn.key}
                      href={btn.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity ${btn.className || ""}`}
                      style={btn.style}
                    >
                      <Icon size={20} className="text-white" />
                    </a>
                  );
                })}
              </div>
            )}
            <p className="text-gray-400 text-sm">
              Email us at{" "}
              <a
                href="mailto:secretary.rome.europe@gaa.ie"
                className="underline hover:text-white"
              >
                secretary.rome.europe@gaa.ie
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Powered by PlayAway */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
          <p className="text-gray-500 text-sm">
            Powered by{" "}
            <Link
              href="/"
              className="text-[#c41e3a] hover:text-white transition-colors font-medium"
            >
              PlayAway
            </Link>
          </p>
          <span className="text-gray-700">•</span>
          <InternalLink
            href="/admin"
            className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
          >
            Admin
          </InternalLink>
        </div>
      </div>
    </footer>
  );
}
