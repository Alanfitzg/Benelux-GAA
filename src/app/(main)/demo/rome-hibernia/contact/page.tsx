"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";

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

export default function ContactPage() {
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
      className: "bg-black border border-gray-300",
    },
  ];

  const activeSocialButtons = socialButtons.filter((btn) => btn.href);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Contact" />

      <main className="flex-1 pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            <EditableText
              pageKey="contact"
              contentKey="title"
              defaultValue="Get in Touch"
              maxLength={40}
            />
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            <EditableText
              pageKey="contact"
              contentKey="subtitle"
              defaultValue="The quickest way to reach us is through social media or email."
              maxLength={100}
            />
          </p>

          {activeSocialButtons.length > 0 && (
            <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
              {activeSocialButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <a
                    key={btn.key}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${btn.className || ""}`}
                    style={btn.style}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </a>
                );
              })}
            </div>
          )}

          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            <EditableText
              pageKey="contact"
              contentKey="email_intro"
              defaultValue="Or email us at"
              maxLength={30}
            />{" "}
            <a
              href="mailto:secretary.rome.europe@gaa.ie"
              className="text-[#c41e3a] font-medium hover:underline"
            >
              secretary.rome.europe@gaa.ie
            </a>
          </p>

          <h2 className="text-2xl sm:text-3xl font-light text-[#c41e3a] mb-6 sm:mb-8">
            <EditableText
              pageKey="contact"
              contentKey="form_title"
              defaultValue="Send us a message"
              maxLength={40}
            />
          </h2>

          <form
            className="space-y-4 sm:space-y-6 max-w-xl"
            action={`mailto:secretary.rome.europe@gaa.ie`}
            method="POST"
            encType="text/plain"
          >
            {/* Honeypot field - hidden from users, bots will fill it */}
            <input
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              className="absolute -left-[9999px]"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                Your question
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#c41e3a] text-white py-2.5 sm:py-3 font-medium text-sm sm:text-base rounded-lg hover:bg-[#a01830] transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
