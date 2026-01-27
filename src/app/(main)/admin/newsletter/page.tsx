"use client";

import Link from "next/link";

export default function NewsletterAdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl sm:text-4xl">📰</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white">
                  Newsletter
                </h1>
                <p className="text-sm sm:text-base text-gray-300">
                  Regional newsletters for club admins
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl sm:text-5xl">📰</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Newsletter System Coming Soon
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-8">
            Create and manage regional newsletters for different club admin
            groups. Each region (European, Irish, British, etc.) will receive
            tailored content relevant to their local GAA community.
          </p>

          {/* Planned Features */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                🌍 Regional Targeting
              </h3>
              <p className="text-sm text-gray-600">
                Send different newsletter content to European, Irish, British,
                and other regional groups.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                📝 Rich Content Editor
              </h3>
              <p className="text-sm text-gray-600">
                Create beautiful newsletters with images, event highlights, and
                club features.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                📅 Scheduling
              </h3>
              <p className="text-sm text-gray-600">
                Schedule newsletters to send at optimal times for each region.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Analytics</h3>
              <p className="text-sm text-gray-600">
                Track open rates, click-throughs, and engagement by region.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              In the meantime, use{" "}
              <Link
                href="/admin/communications"
                className="text-teal-600 hover:underline"
              >
                Communications
              </Link>{" "}
              to send broadcasts to club admins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
