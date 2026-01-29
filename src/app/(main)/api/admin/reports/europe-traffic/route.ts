import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get the Europe International Unit
    const europeUnit = await prisma.internationalUnit.findFirst({
      where: { name: "Europe" },
    });

    if (!europeUnit) {
      return NextResponse.json(
        { error: "Europe unit not found" },
        { status: 404 }
      );
    }

    // DEMAND SIDE: Teams wanting to come TO Europe
    // 1. Interests in European events
    const europeEventInterests = await prisma.interest.findMany({
      where: {
        event: {
          club: {
            internationalUnitId: europeUnit.id,
          },
        },
      },
      select: {
        id: true,
        submittedAt: true,
        applicantClub: {
          select: {
            id: true,
            name: true,
            subRegion: true,
            internationalUnit: { select: { name: true } },
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
          },
        },
      },
    });

    // 2. Tournament registrations for European events
    const europeEventRegistrations = await prisma.tournamentTeam.findMany({
      where: {
        event: {
          club: {
            internationalUnitId: europeUnit.id,
          },
        },
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            subRegion: true,
            internationalUnit: { select: { name: true } },
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
          },
        },
      },
    });

    // 3. User preferences wanting to visit European countries
    const europeanCountries = [
      "Spain",
      "France",
      "Germany",
      "Italy",
      "Netherlands",
      "Portugal",
      "Belgium",
      "Austria",
      "Switzerland",
      "Sweden",
      "Denmark",
      "Norway",
      "Poland",
      "Czech Republic",
      "Hungary",
      "Croatia",
      "Greece",
    ];

    const usersWantingEurope = await prisma.userPreferences.findMany({
      where: {
        preferredCountries: {
          hasSome: europeanCountries,
        },
      },
      select: {
        id: true,
        userId: true,
        preferredCountries: true,
      },
    });

    // 4. Survey responses mentioning European destinations
    const surveyResponsesToEurope = await prisma.surveyResponse.findMany({
      where: {
        OR: [
          { specificDestination: { contains: "Europe", mode: "insensitive" } },
          { specificDestination: { contains: "Spain", mode: "insensitive" } },
          { specificDestination: { contains: "France", mode: "insensitive" } },
          { specificDestination: { contains: "Germany", mode: "insensitive" } },
          { specificDestination: { contains: "Italy", mode: "insensitive" } },
          {
            specificDestination: {
              contains: "Netherlands",
              mode: "insensitive",
            },
          },
          {
            specificDestination: { contains: "Portugal", mode: "insensitive" },
          },
        ],
      },
    });

    // SUPPLY SIDE: European clubs' hosting capacity
    // 1. European clubs
    const europeanClubs = await prisma.club.findMany({
      where: {
        internationalUnitId: europeUnit.id,
      },
      select: {
        id: true,
        name: true,
        location: true,
        verificationStatus: true,
        country: { select: { name: true } },
        events: {
          select: {
            id: true,
            title: true,
            startDate: true,
            maxTeams: true,
            _count: { select: { teams: true } },
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            teamSize: true,
          },
        },
      },
    });

    // 2. European events
    const europeanEvents = await prisma.event.findMany({
      where: {
        club: {
          internationalUnitId: europeUnit.id,
        },
      },
      include: {
        club: {
          select: {
            name: true,
            country: { select: { name: true } },
          },
        },
        _count: {
          select: { teams: true, interests: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // Calculate metrics
    const totalDemand = {
      interests: europeEventInterests.length,
      registrations: europeEventRegistrations.length,
      usersWantingEurope: usersWantingEurope.length,
      surveyResponses: surveyResponsesToEurope.length,
      total:
        europeEventInterests.length +
        europeEventRegistrations.length +
        usersWantingEurope.length +
        surveyResponsesToEurope.length,
    };

    // Calculate where demand is coming from (by origin)
    const demandByOrigin: Record<string, number> = {};

    // From interests
    europeEventInterests.forEach((interest) => {
      const origin =
        interest.applicantClub?.internationalUnit?.name || "Unknown";
      demandByOrigin[origin] = (demandByOrigin[origin] || 0) + 1;
    });

    // From registrations
    europeEventRegistrations.forEach((reg) => {
      const origin = reg.club?.internationalUnit?.name || "Unknown";
      demandByOrigin[origin] = (demandByOrigin[origin] || 0) + 1;
    });

    const demandByOriginArray = Object.entries(demandByOrigin)
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);

    // Irish demand specifically (key metric for investment story)
    const irishDemand = {
      interests: europeEventInterests.filter(
        (i) => i.applicantClub?.internationalUnit?.name === "Ireland"
      ).length,
      registrations: europeEventRegistrations.filter(
        (r) => r.club?.internationalUnit?.name === "Ireland"
      ).length,
    };

    // Supply metrics
    const verifiedClubs = europeanClubs.filter(
      (c) => c.verificationStatus === "VERIFIED"
    ).length;
    const clubsWithEvents = europeanClubs.filter(
      (c) => c.events.length > 0
    ).length;

    const totalSupply = {
      clubs: europeanClubs.length,
      hostingClubs: clubsWithEvents,
      availableClubs: verifiedClubs,
      events: europeanEvents.length,
      upcomingEvents: europeanEvents.filter((e) => new Date(e.startDate) > now)
        .length,
      totalCapacity: europeanEvents.reduce(
        (sum, e) => sum + (e.maxTeams || 0),
        0
      ),
      filledSpots: europeanEvents.reduce((sum, e) => sum + e._count.teams, 0),
    };

    // Calculate the gap (demand vs supply)
    const gap = {
      demandTotal: totalDemand.total,
      supplyCapacity: totalSupply.totalCapacity,
      utilizationRate:
        totalSupply.totalCapacity > 0
          ? Math.round(
              (totalSupply.filledSpots / totalSupply.totalCapacity) * 100
            )
          : 0,
      unmetDemand: Math.max(0, totalDemand.interests - totalSupply.filledSpots),
      potentialGrowth:
        totalSupply.totalCapacity > 0
          ? Math.round(
              ((totalDemand.total - totalSupply.filledSpots) /
                totalSupply.filledSpots) *
                100
            )
          : 0,
    };

    // By European country breakdown
    const byCountry: Record<
      string,
      {
        clubs: number;
        events: number;
        registrations: number;
        interests: number;
      }
    > = {};

    europeanClubs.forEach((club) => {
      const country = club.country?.name || "Unknown";
      if (!byCountry[country]) {
        byCountry[country] = {
          clubs: 0,
          events: 0,
          registrations: 0,
          interests: 0,
        };
      }
      byCountry[country].clubs++;
    });

    europeanEvents.forEach((event) => {
      const country = event.club?.country?.name || "Unknown";
      if (!byCountry[country]) {
        byCountry[country] = {
          clubs: 0,
          events: 0,
          registrations: 0,
          interests: 0,
        };
      }
      byCountry[country].events++;
      byCountry[country].registrations += event._count.teams;
      byCountry[country].interests += event._count.interests;
    });

    const byCountryArray = Object.entries(byCountry)
      .map(([country, data]) => ({
        country,
        ...data,
        total: data.registrations + data.interests,
      }))
      .sort((a, b) => b.total - a.total);

    // Recent activity (last 6 months trend)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentInterests = europeEventInterests.filter(
      (i) => new Date(i.submittedAt) >= sixMonthsAgo
    ).length;

    const recentRegistrations = europeEventRegistrations.filter(
      (r) => new Date(r.registeredAt) >= sixMonthsAgo
    ).length;

    // Monthly trend
    const monthlyTrend: Record<
      string,
      { interests: number; registrations: number }
    > = {};

    europeEventInterests.forEach((interest) => {
      const month = new Date(interest.submittedAt).toLocaleDateString("en-IE", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyTrend[month]) {
        monthlyTrend[month] = { interests: 0, registrations: 0 };
      }
      monthlyTrend[month].interests++;
    });

    europeEventRegistrations.forEach((reg) => {
      const month = new Date(reg.registeredAt).toLocaleDateString("en-IE", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyTrend[month]) {
        monthlyTrend[month] = { interests: 0, registrations: 0 };
      }
      monthlyTrend[month].registrations++;
    });

    const monthlyTrendArray = Object.entries(monthlyTrend)
      .map(([month, data]) => ({
        month,
        ...data,
        total: data.interests + data.registrations,
      }))
      .slice(-12);

    // Top European events by demand
    const topEuropeanEvents = europeanEvents
      .map((e) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        hostClub: e.club?.name || "Independent",
        country: e.club?.country?.name || "-",
        date: e.startDate.toISOString(),
        registrations: e._count.teams,
        interests: e._count.interests,
        totalDemand: e._count.teams + e._count.interests,
        maxTeams: e.maxTeams,
        fillRate: e.maxTeams
          ? Math.round((e._count.teams / e.maxTeams) * 100)
          : 0,
      }))
      .sort((a, b) => b.totalDemand - a.totalDemand)
      .slice(0, 10);

    // Investment story metrics
    const investmentStory = {
      totalTeamsInterested: totalDemand.total,
      irishTeamsWanting: irishDemand.interests + irishDemand.registrations,
      currentCapacity: totalSupply.totalCapacity,
      capacityUtilization: gap.utilizationRate,
      unmetDemandCount: gap.unmetDemand,
      growthPotential: `${gap.potentialGrowth}%`,
      activeEuropeanCountries: byCountryArray.filter((c) => c.total > 0).length,
      totalEuropeanClubs: totalSupply.clubs,
      hostReadyClubs: totalSupply.hostingClubs,
      recentGrowth: {
        lastSixMonths: recentInterests + recentRegistrations,
        trend: "Growing",
      },
    };

    return NextResponse.json({
      summary: {
        demand: totalDemand,
        supply: totalSupply,
        gap,
        irishDemand,
      },
      demandByOrigin: demandByOriginArray,
      byCountry: byCountryArray,
      topEuropeanEvents,
      monthlyTrend: monthlyTrendArray,
      investmentStory,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating Europe traffic report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
