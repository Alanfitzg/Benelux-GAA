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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Calendar Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage club calendars, events, interest submissions, and calendar data
          across all European clubs
        </p>
      </div>

      <CalendarAdminDashboard clubs={mainlandEuropeClubs} stats={stats} />
    </div>
  );
}
