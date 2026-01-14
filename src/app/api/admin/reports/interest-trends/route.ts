import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all interest submissions with related data
    const interests = await prisma.interest.findMany({
      select: {
        id: true,
        status: true,
        submittedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            location: true,
          },
        },
        applicantClub: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    // Get tournament interests (calendar-based)
    const tournamentInterests = await prisma.tournamentInterest.findMany({
      select: {
        id: true,
        createdAt: true,
        interestType: true,
        teamSize: true,
        flexibility: true,
        club: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate totals
    const totalInterests = interests.length;
    const totalTournamentInterests = tournamentInterests.length;

    // Status distribution
    const statusCounts: Record<string, number> = {};
    interests.forEach((i) => {
      statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
    });

    // Interests by month (last 12 months)
    const monthlyTrends: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyTrends[key] = 0;
    }
    interests.forEach((i) => {
      const date = new Date(i.submittedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyTrends[key] !== undefined) {
        monthlyTrends[key]++;
      }
    });

    // Top clubs by interest submissions
    const clubCounts: Record<
      string,
      { name: string; country: string | null; count: number }
    > = {};
    interests.forEach((i) => {
      if (i.applicantClub) {
        if (!clubCounts[i.applicantClub.id]) {
          clubCounts[i.applicantClub.id] = {
            name: i.applicantClub.name,
            country: i.applicantClub.country?.name || null,
            count: 0,
          };
        }
        clubCounts[i.applicantClub.id].count++;
      }
    });

    // Top events by interest
    const eventCounts: Record<
      string,
      {
        title: string;
        type: string | null;
        location: string | null;
        count: number;
      }
    > = {};
    interests.forEach((i) => {
      if (i.event) {
        if (!eventCounts[i.event.id]) {
          eventCounts[i.event.id] = {
            title: i.event.title,
            type: i.event.eventType,
            location: i.event.location,
            count: 0,
          };
        }
        eventCounts[i.event.id].count++;
      }
    });

    // Team size distribution from tournament interests
    const teamSizeCounts: Record<string, number> = {};
    tournamentInterests.forEach((ti) => {
      if (ti.teamSize) {
        const sizeRange =
          ti.teamSize <= 15
            ? "1-15"
            : ti.teamSize <= 25
              ? "16-25"
              : ti.teamSize <= 35
                ? "26-35"
                : "36+";
        teamSizeCounts[sizeRange] = (teamSizeCounts[sizeRange] || 0) + 1;
      }
    });

    // Flexibility distribution
    const flexibilityCounts: Record<string, number> = {};
    tournamentInterests.forEach((ti) => {
      if (ti.flexibility) {
        flexibilityCounts[ti.flexibility] =
          (flexibilityCounts[ti.flexibility] || 0) + 1;
      }
    });

    // Interest type distribution
    const interestTypeCounts: Record<string, number> = {};
    tournamentInterests.forEach((ti) => {
      if (ti.interestType) {
        interestTypeCounts[ti.interestType] =
          (interestTypeCounts[ti.interestType] || 0) + 1;
      }
    });

    // Countries most interested
    const countryCounts: Record<string, number> = {};
    interests.forEach((i) => {
      if (i.applicantClub?.country?.name) {
        countryCounts[i.applicantClub.country.name] =
          (countryCounts[i.applicantClub.country.name] || 0) + 1;
      }
    });
    tournamentInterests.forEach((ti) => {
      if (ti.club?.country?.name) {
        countryCounts[ti.club.country.name] =
          (countryCounts[ti.club.country.name] || 0) + 1;
      }
    });

    const sortByCount = <T extends { count: number }>(arr: T[]) =>
      arr.sort((a, b) => b.count - a.count);

    const report = {
      summary: {
        totalEventInterests: totalInterests,
        totalTournamentInterests: totalTournamentInterests,
        totalCombined: totalInterests + totalTournamentInterests,
      },
      statusDistribution: Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count),
      monthlyTrends: Object.entries(monthlyTrends).map(([month, count]) => ({
        month,
        count,
      })),
      topClubs: sortByCount(Object.values(clubCounts)).slice(0, 15),
      topEvents: sortByCount(Object.values(eventCounts)).slice(0, 10),
      teamSizeDistribution: Object.entries(teamSizeCounts)
        .map(([range, count]) => ({ range, count }))
        .sort((a, b) => {
          const order = ["1-15", "16-25", "26-35", "36+"];
          return order.indexOf(a.range) - order.indexOf(b.range);
        }),
      flexibilityDistribution: Object.entries(flexibilityCounts)
        .map(([flexibility, count]) => ({ flexibility, count }))
        .sort((a, b) => b.count - a.count),
      interestTypeDistribution: Object.entries(interestTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      topCountries: Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating interest trends report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
