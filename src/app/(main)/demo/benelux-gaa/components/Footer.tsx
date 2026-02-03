"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import InternalLink from "./InternalLink";

const CLUB_ID = "benelux-gaa";

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

const memberClubs = [
  "Amsterdam GAA",
  "Antwerp GAA",
  "Belgium GAA",
  "Brussels GAA",
  "Den Haag GAA",
  "Luxembourg GAA",
  "Rotterdam GAA",
];

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
      key: "twitter",
      href: socialLinks.twitter,
      icon: Twitter,
      className: "bg-black",
    },
  ];

  const activeSocialButtons = socialButtons.filter((btn) => btn.href);

  return (
    <footer className="bg-[#0d1f28] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-4">
              <Image
                src="/benelux-gaa-crest.png"
                alt="Benelux GAA"
                width={80}
                height={80}
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Promoting Gaelic Games across Belgium, Netherlands, and Luxembourg
              since 2022.
            </p>
          </div>

          {/* Member Clubs */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-[#2B9EB3] mb-4 uppercase text-sm tracking-wider">
              Member Clubs
            </h4>
            <ul className="space-y-2">
              {memberClubs.slice(0, 5).map((club) => (
                <li key={club}>
                  <span className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                    {club}
                  </span>
                </li>
              ))}
              <li>
                <InternalLink
                  href="/clubs"
                  className="text-[#2B9EB3] text-sm hover:text-white transition-colors"
                >
                  View all clubs →
                </InternalLink>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-[#2B9EB3] mb-4 uppercase text-sm tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <InternalLink
                  href="/fixtures"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Fixtures
                </InternalLink>
              </li>
              <li>
                <InternalLink
                  href="/standings"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Standings
                </InternalLink>
              </li>
              <li>
                <InternalLink
                  href="/roll-of-honor"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Roll of Honor
                </InternalLink>
              </li>
              <li>
                <InternalLink
                  href="/timeline"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Timeline
                </InternalLink>
              </li>
              <li>
                <InternalLink
                  href="/faq"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  What are Gaelic Games?
                </InternalLink>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-[#2B9EB3] mb-4 uppercase text-sm tracking-wider">
              Connect With Us
            </h4>
            {activeSocialButtons.length > 0 && (
              <div className="flex gap-3 justify-center sm:justify-start mb-4">
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
                      <Icon size={18} className="text-white" />
                    </a>
                  );
                })}
              </div>
            )}
            <p className="text-gray-400 text-sm">
              Email us at{" "}
              <a
                href="mailto:secretary.benelux.europe@gaa.ie"
                className="text-[#2B9EB3] hover:text-white transition-colors"
              >
                secretary.benelux.europe@gaa.ie
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2B9EB3]/20 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Benelux GAA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-sm">
              Powered by{" "}
              <InternalLink
                href="/powered-by"
                className="text-[#2B9EB3] hover:text-white transition-colors font-medium"
              >
                PlayAway
              </InternalLink>
            </p>
            <span className="hidden sm:inline text-gray-700">•</span>
            <InternalLink
              href="/admin"
              className="hidden sm:inline text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              Admin
            </InternalLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
