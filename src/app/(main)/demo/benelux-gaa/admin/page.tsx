"use client";

import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Settings,
  Users,
  FileText,
  Calendar,
  Lock,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

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
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#1a3a4a] text-white rounded-lg font-semibold hover:bg-[#0d2530] transition-colors"
            >
              Sign In
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const adminLinks = [
    {
      title: "Content Management",
      description:
        "Edit page content, titles, and descriptions across the site.",
      icon: FileText,
      href: "#",
      color: "bg-blue-500",
    },
    {
      title: "Gallery Management",
      description:
        "Upload and manage images for the homepage gallery carousel.",
      icon: ImageIcon,
      href: "#gallery",
      color: "bg-pink-500",
    },
    {
      title: "Fixtures Management",
      description: "Add, edit, and manage fixtures and competition schedules.",
      icon: Calendar,
      href: "#",
      color: "bg-green-500",
    },
    {
      title: "User Management",
      description: "Manage site administrators and user permissions.",
      icon: Users,
      href: "#",
      color: "bg-purple-500",
    },
    {
      title: "Site Settings",
      description:
        "Configure social links, contact details, and site preferences.",
      icon: Settings,
      href: "#",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Admin" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Logged in as{" "}
              <span className="font-medium">{session?.user?.email}</span>
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-[#1a3a4a] rounded-xl p-4 text-center text-white">
              <div className="text-2xl font-bold">16</div>
              <div className="text-sm text-white/60">Clubs</div>
            </div>
            <div className="bg-[#2B9EB3] rounded-xl p-4 text-center text-white">
              <div className="text-2xl font-bold">22</div>
              <div className="text-sm text-white/60">Fixtures</div>
            </div>
            <div className="bg-green-500 rounded-xl p-4 text-center text-white">
              <div className="text-2xl font-bold">6</div>
              <div className="text-sm text-white/60">News Articles</div>
            </div>
            <div className="bg-purple-500 rounded-xl p-4 text-center text-white">
              <div className="text-2xl font-bold">18</div>
              <div className="text-sm text-white/60">Timeline Events</div>
            </div>
          </div>

          {/* Admin Links */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.title}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {link.description}
                      </p>
                      <span className="text-gray-400 text-sm italic">
                        Coming soon
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gallery Management Section */}
          <div
            id="gallery"
            className="mb-10 bg-gray-50 rounded-xl p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                <ImageIcon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gallery Management
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Upload images to display in the homepage gallery carousel. Add
              images to the{" "}
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
                /public/benelux-gallery/
              </code>{" "}
              folder on your server.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-3">
                Expected image filenames:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  •{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    gallery-1.jpg
                  </code>
                </li>
                <li>
                  •{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    gallery-2.jpg
                  </code>
                </li>
                <li>
                  •{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    gallery-3.jpg
                  </code>
                </li>
                <li>
                  •{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    gallery-4.jpg
                  </code>
                </li>
                <li>
                  •{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    gallery-5.jpg
                  </code>
                </li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">
                Recommended: landscape orientation, minimum 1920x1080px
              </p>
            </div>
          </div>

          {/* PlayAway Admin Link */}
          <div className="bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">
                  PlayAway Platform Admin
                </h3>
                <p className="text-white/70">
                  Access the full PlayAway admin dashboard for advanced
                  features.
                </p>
              </div>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1a3a4a] rounded-lg font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Go to PlayAway Admin
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
