import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all clubs with their members and admins
    const clubs = await prisma.club.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        location: true,
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            sessions: {
              select: {
                expires: true,
              },
              orderBy: {
                expires: "desc",
              },
              take: 1,
            },
          },
        },
        admins: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            sessions: {
              select: {
                expires: true,
              },
              orderBy: {
                expires: "desc",
              },
              take: 1,
            },
          },
        },
        events: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate summary stats
    const totalClubs = clubs.length;
    const clubsWithMembers = clubs.filter((c) => c.members.length > 0).length;
    const clubsWithAdmins = clubs.filter((c) => c.admins.length > 0).length;
    const totalMembers = clubs.reduce((acc, c) => acc + c.members.length, 0);
    const totalAdmins = clubs.reduce((acc, c) => acc + c.admins.length, 0);

    // Find recent activity (sessions from last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recentlyActiveUsers = 0;
    clubs.forEach((club) => {
      [...club.members, ...club.admins].forEach((user) => {
        if (user.sessions[0]) {
          const sessionDate = new Date(user.sessions[0].expires);
          // Session expires is typically set to future, so check if it's recent
          if (sessionDate > thirtyDaysAgo) {
            recentlyActiveUsers++;
          }
        }
      });
    });

    // Format club engagement data
    const clubEngagement = clubs
      .map((club) => {
        const allUsers = [...club.members, ...club.admins];
        const uniqueUsers = [
          ...new Map(allUsers.map((u) => [u.id, u])).values(),
        ];

        // Find most recent session
        const sessionDates = uniqueUsers
          .filter((user) => user.sessions[0])
          .map((user) => new Date(user.sessions[0].expires).getTime());

        const lastActivityDate =
          sessionDates.length > 0 ? new Date(Math.max(...sessionDates)) : null;

        return {
          name: club.name,
          location: club.location || "-",
          memberCount: club.members.length,
          adminCount: club.admins.length,
          eventCount: club.events.length,
          lastActivity: lastActivityDate
            ? lastActivityDate.toISOString().split("T")[0]
            : "Never",
        };
      })
      .filter((c) => c.memberCount > 0 || c.adminCount > 0)
      .sort(
        (a, b) => b.memberCount + b.adminCount - (a.memberCount + a.adminCount)
      );

    // Get top clubs by engagement
    const topClubsByMembers = [...clubEngagement]
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 10);

    const topClubsByAdmins = [...clubEngagement]
      .sort((a, b) => b.adminCount - a.adminCount)
      .slice(0, 10);

    // Get user role distribution
    const allUsers = await prisma.user.findMany({
      where: {
        clubId: { not: null },
      },
      select: {
        role: true,
      },
    });

    const roleDistribution: Record<string, number> = {};
    allUsers.forEach((user) => {
      roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
    });

    // Get new members by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newMembersByMonth = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        clubId: { not: null },
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    // Aggregate by month
    const monthlyGrowth: Record<string, number> = {};
    newMembersByMonth.forEach((item) => {
      const monthKey = new Date(item.createdAt).toISOString().slice(0, 7);
      monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + item._count;
    });

    const monthlyGrowthArray = Object.entries(monthlyGrowth)
      .map(([month, count]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        newMembers: count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const report = {
      summary: {
        totalClubs,
        clubsWithMembers,
        clubsWithAdmins,
        totalMembers,
        totalAdmins,
        recentlyActiveUsers,
      },
      topClubsByMembers,
      topClubsByAdmins,
      roleDistribution: Object.entries(roleDistribution).map(
        ([role, count]) => ({
          role,
          count,
        })
      ),
      monthlyGrowth: monthlyGrowthArray,
      clubEngagement: clubEngagement.slice(0, 20),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating club engagement report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
