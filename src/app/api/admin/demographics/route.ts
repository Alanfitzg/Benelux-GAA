import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [provinces, reportSummary, playawayStats] = await Promise.all([
      prisma.demographicsProvince.findMany({
        orderBy: { displayOrder: "asc" },
        include: {
          counties: {
            orderBy: { displayOrder: "asc" },
          },
        },
      }),
      prisma.demographicsReportSummary.findFirst(),
      getPlayawayComparisonStats(),
    ]);

    return NextResponse.json({
      provinces,
      reportSummary,
      playawayStats,
    });
  } catch (error) {
    console.error("Error fetching demographics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch demographics data" },
      { status: 500 }
    );
  }
}

async function getPlayawayComparisonStats() {
  const [
    totalActiveClubs,
    verifiedClubs,
    totalRegisteredPlayers,
    bookingsCount,
  ] = await Promise.all([
    prisma.club.count({
      where: {
        status: "APPROVED",
      },
    }),
    prisma.club.count({
      where: {
        status: "APPROVED",
        admins: {
          some: {},
        },
      },
    }),
    prisma.user.count({
      where: {
        role: "USER",
        accountStatus: "APPROVED",
      },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    }),
  ]);

  return {
    totalActiveClubs,
    verifiedClubs,
    totalRegisteredPlayers,
    playersTravelled: bookingsCount,
  };
}
