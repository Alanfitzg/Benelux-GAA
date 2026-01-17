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
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-2xl sm:text-4xl">📅</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">
                Calendar Command Centre
              </h1>
              <p className="text-xs sm:text-base text-gray-300 mt-0.5 sm:mt-1">
                The central hub for all PlayAway calendars
              </p>
            </div>
          </div>

          {/* Importance Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl">⚡</span>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-amber-200">
                  Master Calendar System
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/80 mt-0.5 sm:mt-1">
                  This calendar feeds all club availability views, interest
                  heatmaps, and event scheduling across the entire platform.
                  Changes here propagate to every European club&apos;s calendar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <CalendarAdminDashboard clubs={mainlandEuropeClubs} stats={stats} />
      </div>
    </div>
  );
}
