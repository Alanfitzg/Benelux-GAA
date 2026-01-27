import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total clubs (TAM)
    const totalClubs = await prisma.club.count();

    // Get clubs with at least 1 member (activated)
    const activatedClubs = await prisma.club.count({
      where: {
        members: {
          some: {},
        },
      },
    });

    // Get clubs with at least 1 admin (verified)
    const verifiedClubs = await prisma.club.count({
      where: {
        admins: {
          some: {},
        },
      },
    });

    // Get clubs with events (hosting)
    const hostingClubs = await prisma.club.count({
      where: {
        events: {
          some: {},
        },
      },
    });

    // Calculate percentages
    const activationRate =
      totalClubs > 0
        ? Math.round((activatedClubs / totalClubs) * 100 * 10) / 10
        : 0;
    const verificationRate =
      activatedClubs > 0
        ? Math.round((verifiedClubs / activatedClubs) * 100 * 10) / 10
        : 0;
    const overallVerificationRate =
      totalClubs > 0
        ? Math.round((verifiedClubs / totalClubs) * 100 * 10) / 10
        : 0;
    const hostingRate =
      verifiedClubs > 0
        ? Math.round((hostingClubs / verifiedClubs) * 100 * 10) / 10
        : 0;

    // Breakdown by country
    const clubsByCountry = await prisma.club.groupBy({
      by: ["countryId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    // Get country names
    const countryIds = clubsByCountry
      .map((c) => c.countryId)
      .filter((id): id is string => id !== null);

    const countries = await prisma.country.findMany({
      where: { id: { in: countryIds } },
      select: { id: true, name: true },
    });

    const countryMap = new Map(countries.map((c) => [c.id, c.name]));

    // Get activated and verified counts per country
    const activatedByCountry = await prisma.club.groupBy({
      by: ["countryId"],
      where: { members: { some: {} } },
      _count: { id: true },
    });

    const verifiedByCountry = await prisma.club.groupBy({
      by: ["countryId"],
      where: { admins: { some: {} } },
      _count: { id: true },
    });

    const activatedMap = new Map(
      activatedByCountry.map((c) => [c.countryId, c._count.id])
    );
    const verifiedMap = new Map(
      verifiedByCountry.map((c) => [c.countryId, c._count.id])
    );

    const countryBreakdown = clubsByCountry
      .filter((c) => c.countryId)
      .slice(0, 20)
      .map((c) => {
        const total = c._count.id;
        const activated = activatedMap.get(c.countryId) || 0;
        const verified = verifiedMap.get(c.countryId) || 0;
        return {
          country: countryMap.get(c.countryId!) || "Unknown",
          totalClubs: total,
          activatedClubs: activated,
          verifiedClubs: verified,
          activationRate:
            total > 0 ? Math.round((activated / total) * 100 * 10) / 10 : 0,
          verificationRate:
            total > 0 ? Math.round((verified / total) * 100 * 10) / 10 : 0,
        };
      });

    // Irish vs European breakdown
    const irishClubs = await prisma.club.count({
      where: { isMainlandEurope: false },
    });
    const europeanClubs = await prisma.club.count({
      where: { isMainlandEurope: true },
    });

    const irishActivated = await prisma.club.count({
      where: { isMainlandEurope: false, members: { some: {} } },
    });
    const europeanActivated = await prisma.club.count({
      where: { isMainlandEurope: true, members: { some: {} } },
    });

    const irishVerified = await prisma.club.count({
      where: { isMainlandEurope: false, admins: { some: {} } },
    });
    const europeanVerified = await prisma.club.count({
      where: { isMainlandEurope: true, admins: { some: {} } },
    });

    // Monthly growth - new clubs with members in last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentMembers = await prisma.user.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        clubId: { not: null },
      },
      select: {
        createdAt: true,
        clubId: true,
      },
    });

    // Group by month
    const monthlyActivations: Record<string, Set<string>> = {};
    recentMembers.forEach((user) => {
      const month = user.createdAt.toISOString().slice(0, 7);
      if (!monthlyActivations[month]) {
        monthlyActivations[month] = new Set();
      }
      if (user.clubId) {
        monthlyActivations[month].add(user.clubId);
      }
    });

    const monthlyGrowth = Object.entries(monthlyActivations)
      .map(([month, clubs]) => ({
        month,
        newActivations: clubs.size,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Total users and members
    const totalUsers = await prisma.user.count();
    const totalMembers = await prisma.user.count({
      where: { clubId: { not: null } },
    });
    const totalAdmins = await prisma.user.count({
      where: { adminOfClubs: { some: {} } },
    });

    return NextResponse.json({
      summary: {
        totalClubs,
        activatedClubs,
        verifiedClubs,
        hostingClubs,
        activationRate,
        verificationRate,
        overallVerificationRate,
        hostingRate,
        // Untapped potential
        untappedClubs: totalClubs - activatedClubs,
        untappedPercentage:
          totalClubs > 0
            ? Math.round(
                ((totalClubs - activatedClubs) / totalClubs) * 100 * 10
              ) / 10
            : 0,
      },
      funnel: [
        {
          stage: "Total Addressable Market (TAM)",
          count: totalClubs,
          percentage: 100,
        },
        {
          stage: "Activated (Has Members)",
          count: activatedClubs,
          percentage: activationRate,
        },
        {
          stage: "Verified (Has Admins)",
          count: verifiedClubs,
          percentage: overallVerificationRate,
        },
        {
          stage: "Hosting Events",
          count: hostingClubs,
          percentage:
            totalClubs > 0
              ? Math.round((hostingClubs / totalClubs) * 100 * 10) / 10
              : 0,
        },
      ],
      regionBreakdown: {
        irish: {
          total: irishClubs,
          activated: irishActivated,
          verified: irishVerified,
          activationRate:
            irishClubs > 0
              ? Math.round((irishActivated / irishClubs) * 100 * 10) / 10
              : 0,
          verificationRate:
            irishClubs > 0
              ? Math.round((irishVerified / irishClubs) * 100 * 10) / 10
              : 0,
        },
        european: {
          total: europeanClubs,
          activated: europeanActivated,
          verified: europeanVerified,
          activationRate:
            europeanClubs > 0
              ? Math.round((europeanActivated / europeanClubs) * 100 * 10) / 10
              : 0,
          verificationRate:
            europeanClubs > 0
              ? Math.round((europeanVerified / europeanClubs) * 100 * 10) / 10
              : 0,
        },
      },
      countryBreakdown,
      monthlyGrowth,
      userStats: {
        totalUsers,
        totalMembers,
        totalAdmins,
        membershipRate:
          totalUsers > 0
            ? Math.round((totalMembers / totalUsers) * 100 * 10) / 10
            : 0,
        adminRate:
          totalUsers > 0
            ? Math.round((totalAdmins / totalUsers) * 100 * 10) / 10
            : 0,
      },
    });
  } catch (error) {
    console.error("Error generating market coverage report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
