import { getServerSession } from "@/lib/auth-helpers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CalendarAdminDashboard from "@/components/admin/CalendarAdminDashboard";

export default async function CalendarManagementPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    notFound();
  }

  // Get mainland Europe clubs for dropdown
  const mainlandEuropeClubs = await prisma.club.findMany({
    where: { isMainlandEurope: true },
    select: {
      id: true,
      name: true,
      location: true,
      isMainlandEurope: true,
      country: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Get calendar statistics
  const [totalEvents, totalInterests, activeClubs, upcomingEvents] =
    await Promise.all([
      prisma.calendarEvent.count(),
      prisma.calendarInterest.count(),
      prisma.club.count({ where: { isMainlandEurope: true } }),
      prisma.calendarEvent.count({
        where: {
          startDate: {
            gte: new Date(),
          },
        },
      }),
    ]);

  const stats = {
    totalEvents,
    totalInterests,
    activeClubs,
    upcomingEvents,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Header */}
        <div className="mb-6 sm:mb-8">
          {/* Main Title Card */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 sm:p-6 mb-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <span className="text-3xl sm:text-5xl">📅</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  Calendar Command Centre
                </h1>
                <p className="text-sm sm:text-lg text-gray-300 mt-1 sm:mt-2">
                  The central hub for all PlayAway calendars
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Master Calendar System */}
            <div className="group bg-gradient-to-br from-amber-500/10 to-orange-600/10 hover:from-amber-500/15 hover:to-orange-600/15 backdrop-blur-sm border border-amber-400/20 rounded-xl p-4 sm:p-5 transition-all duration-300">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-lg sm:text-2xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-amber-100">
                    Master Calendar System
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-100/70 mt-1 sm:mt-2 leading-relaxed">
                    This calendar feeds all club availability views, interest
                    heatmaps, and event scheduling. Changes propagate to every
                    European club&apos;s calendar.
                  </p>
                </div>
              </div>
            </div>

            {/* Bounceback Protection */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-600/10 hover:from-blue-500/15 hover:to-cyan-600/15 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 sm:p-5 transition-all duration-300">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-lg sm:text-2xl">🛡️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-blue-100">
                    Bounceback Protection
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100/70 mt-1 sm:mt-2 leading-relaxed">
                    GGE and GAA administrators can block dates to prevent
                    queries on unavailable periods, reducing unnecessary
                    communications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CalendarAdminDashboard clubs={mainlandEuropeClubs} stats={stats} />
      </div>
    </div>
  );
}
