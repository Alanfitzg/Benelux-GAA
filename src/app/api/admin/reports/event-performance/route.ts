import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all events with related data
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        eventType: true,
        location: true,
        startDate: true,
        endDate: true,
        status: true,
        visibility: true,
        maxTeams: true,
        createdAt: true,
        interests: {
          select: {
            id: true,
            status: true,
          },
        },
        teams: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate totals
    const totalEvents = events.length;
    const activeEvents = events.filter(
      (e) => e.status === "ACTIVE" || e.status === "UPCOMING"
    ).length;
    const upcomingEvents = events.filter(
      (e) => e.startDate && new Date(e.startDate) > new Date()
    ).length;

    // Events by type
    const eventTypeCounts: Record<string, number> = {};
    events.forEach((e) => {
      if (e.eventType) {
        eventTypeCounts[e.eventType] = (eventTypeCounts[e.eventType] || 0) + 1;
      }
    });

    // Events by status
    const statusCounts: Record<string, number> = {};
    events.forEach((e) => {
      if (e.status) {
        statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
      }
    });

    // Events by location
    const locationCounts: Record<string, number> = {};
    events.forEach((e) => {
      const loc = e.location || "Unknown";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    // Events by month (creation)
    const monthlyCreation: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyCreation[key] = 0;
    }
    events.forEach((e) => {
      const date = new Date(e.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyCreation[key] !== undefined) {
        monthlyCreation[key]++;
      }
    });

    // Events by scheduled month
    const scheduledMonths: Record<string, number> = {};
    events.forEach((e) => {
      if (e.startDate) {
        const date = new Date(e.startDate);
        const monthName = date.toLocaleString("default", { month: "long" });
        scheduledMonths[monthName] = (scheduledMonths[monthName] || 0) + 1;
      }
    });

    // Team registration stats
    let totalTeamRegistrations = 0;
    let confirmedTeams = 0;
    events.forEach((e) => {
      totalTeamRegistrations += e.teams.length;
      confirmedTeams += e.teams.filter((t) => t.status === "CONFIRMED").length;
    });

    // Interest to registration conversion
    let totalInterests = 0;
    let acceptedInterests = 0;
    events.forEach((e) => {
      totalInterests += e.interests.length;
      acceptedInterests += e.interests.filter(
        (i) => i.status === "ACCEPTED"
      ).length;
    });

    // Top events by interest
    const topEventsByInterest = events
      .map((e) => ({
        title: e.title,
        type: e.eventType,
        location: e.location,
        interestCount: e.interests.length,
        teamCount: e.teams.filter((t) => t.status === "CONFIRMED").length,
        maxTeams: e.maxTeams,
      }))
      .filter((e) => e.interestCount > 0)
      .sort((a, b) => b.interestCount - a.interestCount)
      .slice(0, 10);

    // Capacity utilization for events with maxTeams
    const eventsWithCapacity = events.filter(
      (e) => e.maxTeams && e.maxTeams > 0
    );
    const avgCapacityUtilization =
      eventsWithCapacity.length > 0
        ? Math.round(
            eventsWithCapacity.reduce((sum, e) => {
              const confirmed = e.teams.filter(
                (t) => t.status === "CONFIRMED"
              ).length;
              return sum + (confirmed / (e.maxTeams || 1)) * 100;
            }, 0) / eventsWithCapacity.length
          )
        : 0;

    const report = {
      summary: {
        totalEvents,
        activeEvents,
        upcomingEvents,
        totalTeamRegistrations,
        confirmedTeams,
        totalInterests,
        acceptedInterests,
        conversionRate:
          totalInterests > 0
            ? Math.round((acceptedInterests / totalInterests) * 100)
            : 0,
        avgCapacityUtilization,
      },
      eventsByType: Object.entries(eventTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      eventsByStatus: Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count),
      eventsByLocation: Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
      monthlyCreationTrends: Object.entries(monthlyCreation).map(
        ([month, count]) => ({ month, count })
      ),
      seasonalDistribution: Object.entries(scheduledMonths)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return months.indexOf(a.month) - months.indexOf(b.month);
        }),
      topEventsByInterest,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating event performance report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
