import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";
import { TEAM_TYPES } from "@/lib/constants/teams";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: clubId } = await params;
    const { searchParams } = new URL(request.url);
    const sportFilter = searchParams.get("sport");

    // Verify user is admin of this club or super admin
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admins: { select: { id: true } },
        country: { select: { name: true } },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const isClubAdmin = club.admins.some(
      (admin) => admin.id === session.user.id
    );
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to view this data" },
        { status: 403 }
      );
    }

    // Get current date references
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, 0);

    // ============================================
    // CLUB-SPECIFIC DATA
    // ============================================

    // Get all events for this club
    const clubEvents = await prisma.event.findMany({
      where: {
        clubId: clubId,
        approvalStatus: "APPROVED",
      },
      include: {
        interests: {
          select: {
            id: true,
            name: true,
            email: true,
            applicantClubName: true,
            submittedAt: true,
            message: true,
          },
        },
        teams: {
          select: { id: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // Filter events by sport if specified
    const filteredEvents = sportFilter
      ? clubEvents.filter((e) => e.acceptedTeamTypes.includes(sportFilter))
      : clubEvents;

    // Calculate club-specific metrics
    const totalInterests = filteredEvents.reduce(
      (sum, e) => sum + e.interests.length,
      0
    );

    const thisMonthInterests = filteredEvents.reduce(
      (sum, e) =>
        sum +
        e.interests.filter((i) => new Date(i.submittedAt) >= thisMonthStart)
          .length,
      0
    );

    const lastMonthInterests = filteredEvents.reduce(
      (sum, e) =>
        sum +
        e.interests.filter(
          (i) =>
            new Date(i.submittedAt) >= lastMonthStart &&
            new Date(i.submittedAt) <= lastMonthEnd
        ).length,
      0
    );

    const growthPercent =
      lastMonthInterests > 0
        ? Math.round(
            ((thisMonthInterests - lastMonthInterests) / lastMonthInterests) *
              100
          )
        : thisMonthInterests > 0
          ? 100
          : 0;

    // Build event breakdown
    const byEvent = filteredEvents
      .map((event) => ({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startDate.toISOString(),
        sportTypes: event.acceptedTeamTypes,
        interestCount: event.interests.length,
        teamCount: event.teams.length,
        conversionRate:
          event.interests.length > 0
            ? Math.round((event.teams.length / event.interests.length) * 100)
            : 0,
      }))
      .filter((e) => e.interestCount > 0)
      .sort((a, b) => b.interestCount - a.interestCount)
      .slice(0, 10);

    // Build recent interests list
    const allInterests = filteredEvents.flatMap((event) =>
      event.interests.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        clubName: i.applicantClubName,
        eventTitle: event.title,
        sportTypes: event.acceptedTeamTypes,
        submittedAt: i.submittedAt.toISOString(),
        message: i.message,
      }))
    );

    const recentInterests = allInterests
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      .slice(0, 20);

    // ============================================
    // PLATFORM-WIDE DATA
    // ============================================

    // Get all upcoming events platform-wide for supply data
    const upcomingEventsWhere = sportFilter
      ? {
          startDate: { gte: now, lte: sixMonthsFromNow },
          approvalStatus: "APPROVED" as const,
          acceptedTeamTypes: { has: sportFilter },
        }
      : {
          startDate: { gte: now, lte: sixMonthsFromNow },
          approvalStatus: "APPROVED" as const,
        };

    const upcomingEvents = await prisma.event.findMany({
      where: upcomingEventsWhere,
      select: {
        startDate: true,
        acceptedTeamTypes: true,
      },
    });

    // Get calendar interests for hot weekends
    const calendarInterests = await prisma.calendarInterest.findMany({
      where: {
        date: { gte: now, lte: sixMonthsFromNow },
      },
      select: {
        date: true,
        submissionCount: true,
      },
    });

    // Get tournament interests for demand data
    const tournamentInterests = await prisma.tournamentInterest.findMany({
      where: {
        OR: [
          { specificDate: { gte: now, lte: sixMonthsFromNow } },
          { monthYear: { gte: now, lte: sixMonthsFromNow } },
        ],
      },
      select: {
        specificDate: true,
        monthYear: true,
        teamSize: true,
      },
    });

    // Calculate hot weekends (group by weekend)
    const weekendDemand = new Map<
      string,
      { interestCount: number; eventsScheduled: number }
    >();

    // Add calendar interests
    calendarInterests.forEach((ci) => {
      const weekendKey = getWeekendKey(ci.date);
      const existing = weekendDemand.get(weekendKey) || {
        interestCount: 0,
        eventsScheduled: 0,
      };
      weekendDemand.set(weekendKey, {
        ...existing,
        interestCount: existing.interestCount + ci.submissionCount,
      });
    });

    // Add tournament interests (by specific date or month)
    tournamentInterests.forEach((ti) => {
      const date = ti.specificDate || ti.monthYear;
      if (date) {
        const weekendKey = getWeekendKey(date);
        const existing = weekendDemand.get(weekendKey) || {
          interestCount: 0,
          eventsScheduled: 0,
        };
        weekendDemand.set(weekendKey, {
          ...existing,
          interestCount: existing.interestCount + 1,
        });
      }
    });

    // Count events scheduled per weekend
    upcomingEvents.forEach((event) => {
      const weekendKey = getWeekendKey(event.startDate);
      const existing = weekendDemand.get(weekendKey) || {
        interestCount: 0,
        eventsScheduled: 0,
      };
      weekendDemand.set(weekendKey, {
        ...existing,
        eventsScheduled: existing.eventsScheduled + 1,
      });
    });

    // Convert to sorted array and get top 3
    const hotWeekends = Array.from(weekendDemand.entries())
      .map(([weekend, data]) => ({
        weekend,
        interestCount: data.interestCount,
        eventsScheduled: data.eventsScheduled,
        demandGap: data.interestCount - data.eventsScheduled,
        isOpportunity: data.interestCount > data.eventsScheduled * 2,
      }))
      .filter((w) => w.interestCount > 0)
      .sort((a, b) => b.interestCount - a.interestCount)
      .slice(0, 3);

    // Get historical patterns (last 12 months of interests)
    const historicalInterests = await prisma.interest.groupBy({
      by: ["submittedAt"],
      where: {
        submittedAt: { gte: oneYearAgo },
      },
      _count: true,
    });

    // Aggregate by month
    const monthlyPatterns = new Map<string, number>();
    historicalInterests.forEach((i) => {
      const monthKey = formatMonthYear(i.submittedAt);
      monthlyPatterns.set(monthKey, (monthlyPatterns.get(monthKey) || 0) + 1);
    });

    const historicalPatterns = Array.from(monthlyPatterns.entries())
      .map(([month, count]) => ({ month, interestCount: count }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(" ");
        const [bMonth, bYear] = b.month.split(" ");
        return (
          new Date(`${aMonth} 1, ${aYear}`).getTime() -
          new Date(`${bMonth} 1, ${bYear}`).getTime()
        );
      });

    // Peak months (which months have most interest)
    const totalHistoricalInterests = historicalPatterns.reduce(
      (sum, p) => sum + p.interestCount,
      0
    );
    const peakMonths = historicalPatterns
      .map((p) => ({
        month: p.month,
        interestCount: p.interestCount,
        percentOfTotal:
          totalHistoricalInterests > 0
            ? Math.round((p.interestCount / totalHistoricalInterests) * 100)
            : 0,
      }))
      .sort((a, b) => b.interestCount - a.interestCount)
      .slice(0, 6);

    // Get trending destinations
    const recentDestinationInterests = await prisma.interest.findMany({
      where: {
        submittedAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        event: {
          select: {
            location: true,
            club: {
              select: {
                country: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const destinationCounts = new Map<
      string,
      { location: string; country: string; count: number }
    >();
    recentDestinationInterests.forEach((i) => {
      const location = i.event.location;
      const country = i.event.club?.country?.name || "Unknown";
      const key = `${location}|${country}`;
      const existing = destinationCounts.get(key) || {
        location,
        country,
        count: 0,
      };
      destinationCounts.set(key, { ...existing, count: existing.count + 1 });
    });

    const trendingDestinations = Array.from(destinationCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((d) => ({
        location: d.location,
        country: d.country,
        recentInterests: d.count,
        growthPercent: 0, // Would need previous period data to calculate
      }));

    // Your region stats
    const clubRegion = club.country?.name || "Unknown";
    const regionInterests = await prisma.interest.count({
      where: {
        event: {
          club: {
            country: { name: clubRegion },
          },
        },
        submittedAt: { gte: oneYearAgo },
      },
    });

    const clubShareInterests = filteredEvents.reduce(
      (sum, e) =>
        sum +
        e.interests.filter((i) => new Date(i.submittedAt) >= oneYearAgo).length,
      0
    );

    const competitorClubs = await prisma.club.count({
      where: {
        country: { name: clubRegion },
        id: { not: clubId },
        events: { some: { approvalStatus: "APPROVED" } },
      },
    });

    // Build response
    const response = {
      clubInsights: {
        totalInterests,
        thisMonthInterests,
        lastMonthInterests,
        growthPercent,
        byEvent,
        recentInterests,
      },
      platformInsights: {
        selectedSport: sportFilter,
        availableSports: TEAM_TYPES as unknown as string[],
        hotWeekends,
        historicalPatterns,
        peakMonths,
        trendingDestinations,
        yourRegionStats: {
          region: clubRegion,
          totalInterests: regionInterests,
          yourShare:
            regionInterests > 0
              ? Math.round((clubShareInterests / regionInterests) * 100)
              : 0,
          competitorCount: competitorClubs,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching demand insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch demand insights" },
      { status: 500 }
    );
  }
}

// Helper to get weekend key (e.g., "Mar 15-16, 2025")
function getWeekendKey(date: Date): string {
  const d = new Date(date);
  // Find the Saturday of this weekend
  const day = d.getDay();
  const saturday = new Date(d);
  if (day === 0) {
    saturday.setDate(d.getDate() - 1);
  } else if (day !== 6) {
    saturday.setDate(d.getDate() + (6 - day));
  }

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  const month = saturday.toLocaleDateString("en-US", { month: "short" });
  const satDay = saturday.getDate();
  const sunDay = sunday.getDate();
  const year = saturday.getFullYear();

  return `${month} ${satDay}-${sunDay}, ${year}`;
}

// Helper to format month/year
function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
