import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/events"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Manage Events
              </h2>
              <p className="text-gray-600 mt-1">
                Create, edit, and delete tournament events
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/clubs"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Manage Clubs
              </h2>
              <p className="text-gray-600 mt-1">
                Create, edit, and delete club information
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/clubs-approval"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Club Approvals
              </h2>
              <p className="text-gray-600 mt-1">
                Review and approve pending club registrations
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Manage Users
              </h2>
              <p className="text-gray-600 mt-1">
                Edit users, assign roles, and manage club memberships
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/images"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🖼️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Manage Images
              </h2>
              <p className="text-gray-600 mt-1">
                Link club photos from S3 storage
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/survey-responses"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Custom Trip Requests
              </h2>
              <p className="text-gray-600 mt-1">
                View and analyze custom trip requests
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/club-admin-requests"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Club Admin Requests
              </h2>
              <p className="text-gray-600 mt-1">
                Review and approve club admin access requests
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/testimonials"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Testimonials
              </h2>
              <p className="text-gray-600 mt-1">
                Review and manage club testimonials
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/backups"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">💾</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Database Backups
              </h2>
              <p className="text-gray-600 mt-1">
                Create and manage database backups
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/pitches"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🏟️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Pitch Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage training pitches and location requests
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/calendar"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Calendar Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage club calendars, events, and interest submissions
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/features"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎛️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Feature Toggles
              </h2>
              <p className="text-gray-600 mt-1">
                Enable or disable features for testing
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/emails"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-amber-300"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📧</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Automated Emails
              </h2>
              <p className="text-gray-600 mt-1">
                Manage email templates and view logs
              </p>
              <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Setup Required
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/venues"
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📍</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Neutral Venues
              </h2>
              <p className="text-gray-600 mt-1">
                Private database of European event locations
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
