import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        adminOfClubs: true,
        club: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let clubIds: string[] = [];

    if (user.role === "SUPER_ADMIN") {
      const allClubs = await prisma.club.findMany({ select: { id: true } });
      clubIds = allClubs.map((club) => club.id);
    } else if (user.role === "CLUB_ADMIN") {
      clubIds = user.adminOfClubs.map((club) => club.id);
    } else if (user.clubId) {
      clubIds = [user.clubId];
    }

    if (clubIds.length === 0) {
      return NextResponse.json({
        totalEarnings: 0,
        totalReleased: 0,
        totalPending: 0,
        totalWithheld: 0,
        platformFeesGenerated: 0,
        hostPlatformFeeShare: 0,
        teamTicketEarnings: 0,
        dayPassEarnings: 0,
        thisMonthEarnings: 0,
        lastMonthEarnings: 0,
        thisYearEarnings: 0,
      });
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    const [
      totalReleasedPayments,
      totalPendingPayments,
      totalWithheldPayments,
      teamTicketPayments,
      dayPassPayments,
      thisMonthPayments,
      lastMonthPayments,
      thisYearPayments,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          status: "RELEASED",
        },
        _sum: { hostEarnings: true, platformFee: true, platformFeeShare: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          status: "PENDING",
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          status: "WITHHELD",
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          type: "TEAM_TICKET",
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          type: "DAY_PASS",
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
        },
        _sum: { hostEarnings: true, platformFeeShare: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: thisMonthStart },
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId: { in: clubIds } },
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: thisYearStart },
        },
        _sum: { hostEarnings: true },
      }),
    ]);

    const totalReleased = totalReleasedPayments._sum.hostEarnings || 0;
    const totalPending = totalPendingPayments._sum.hostEarnings || 0;
    const totalWithheld = totalWithheldPayments._sum.hostEarnings || 0;
    const platformFeesGenerated = totalReleasedPayments._sum.platformFee || 0;
    const hostPlatformFeeShare =
      (dayPassPayments._sum.platformFeeShare || 0) +
      (totalReleasedPayments._sum.platformFeeShare || 0);

    return NextResponse.json({
      totalEarnings: totalReleased + totalPending,
      totalReleased,
      totalPending,
      totalWithheld,
      platformFeesGenerated,
      hostPlatformFeeShare,
      teamTicketEarnings: teamTicketPayments._sum.hostEarnings || 0,
      dayPassEarnings: dayPassPayments._sum.hostEarnings || 0,
      thisMonthEarnings: thisMonthPayments._sum.hostEarnings || 0,
      lastMonthEarnings: lastMonthPayments._sum.hostEarnings || 0,
      thisYearEarnings: thisYearPayments._sum.hostEarnings || 0,
    });
  } catch (error) {
    console.error("Error fetching earnings overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings overview" },
      { status: 500 }
    );
  }
}
