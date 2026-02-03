"use client";

import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NewsManager from "../components/NewsManager";
import GalleryManager from "../components/GalleryManager";
import HistorySubmissions from "../components/HistorySubmissions";
import { Lock } from "lucide-react";
import InternalLink from "../components/InternalLink";

export default function AdminPage() {
  const { data: session, status } = useSession();

  const isAdmin =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "CLUB_ADMIN";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
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
      <div className="min-h-screen bg-white flex flex-col">
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Admin" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Logged in as{" "}
              <span className="font-medium">{session?.user?.email}</span>
            </p>
          </div>

          {/* News Management Section */}
          <div className="mb-8">
            <NewsManager />
          </div>

          {/* Gallery Management Section */}
          <div className="mb-8">
            <GalleryManager />
          </div>

          {/* History Submissions */}
          <HistorySubmissions />
        </div>
      </main>

      <Footer />
    </div>
  );
}
