"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NewsManager from "../components/NewsManager";
import GalleryManager from "../components/GalleryManager";
import HistorySubmissions from "../components/HistorySubmissions";
import { Lock, Newspaper, Image, History, ChevronDown } from "lucide-react";
import InternalLink from "../components/InternalLink";

type SectionKey = "news" | "gallery" | "history" | null;

const sections = [
  {
    key: "news" as const,
    title: "News Management",
    description: "Create, edit, and manage news articles",
    icon: Newspaper,
    color: "bg-blue-500",
  },
  {
    key: "gallery" as const,
    title: "Gallery Management",
    description: "Upload and organize photos",
    icon: Image,
    color: "bg-purple-500",
  },
  {
    key: "history" as const,
    title: "History Submissions",
    description: "Review community-submitted history content",
    icon: History,
    color: "bg-amber-500",
  },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [openSection, setOpenSection] = useState<SectionKey>(null);

  const isAdmin =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "CLUB_ADMIN";

  const toggleSection = (key: SectionKey) => {
    setOpenSection(openSection === key ? null : key);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header currentPage="Admin" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header currentPage="Admin" />
        <main className="flex-1 pt-32 pb-16">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Access Required
            </h1>
            <p className="text-gray-600 mb-8">
              You need to be logged in as a site administrator to access this
              page.
            </p>
            <InternalLink
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#1a3a4a] text-white rounded-lg font-semibold hover:bg-[#0d2530] transition-colors"
            >
              Sign In
            </InternalLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="Admin" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base truncate">
              Logged in as{" "}
              <span className="font-medium">{session?.user?.email}</span>
            </p>
          </div>

          {/* Collapsible Tiles */}
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const isOpen = openSection === section.key;

              return (
                <div
                  key={section.key}
                  className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                >
                  {/* Tile Header - Always visible */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={20} className="text-white sm:hidden" />
                      <Icon size={24} className="text-white hidden sm:block" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        {section.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {section.description}
                      </p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Tile Content - Expandable */}
                  {isOpen && (
                    <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 overflow-x-auto">
                      {section.key === "news" && <NewsManager />}
                      {section.key === "gallery" && <GalleryManager />}
                      {section.key === "history" && <HistorySubmissions />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
