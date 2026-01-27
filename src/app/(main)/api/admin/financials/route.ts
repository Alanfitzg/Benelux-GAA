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
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    // Get all payments with booking and club info
    const [
      allPayments,
      thisMonthPayments,
      lastMonthPayments,
      thisYearPayments,
      pendingPayments,
      releasedPayments,
      bookingStats,
      topClubs,
    ] = await Promise.all([
      // All payments aggregate
      prisma.payment.aggregate({
        where: {
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
        },
        _sum: {
          amount: true,
          hostEarnings: true,
          platformFee: true,
          platformFeeShare: true,
        },
        _count: true,
      }),
      // This month
      prisma.payment.aggregate({
        where: {
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: thisMonthStart },
        },
        _sum: {
          amount: true,
          hostEarnings: true,
          platformFee: true,
        },
      }),
      // Last month
      prisma.payment.aggregate({
        where: {
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: {
          amount: true,
          platformFee: true,
        },
      }),
      // This year
      prisma.payment.aggregate({
        where: {
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: thisYearStart },
        },
        _sum: {
          amount: true,
          platformFee: true,
        },
      }),
      // Pending (owed to clubs)
      prisma.payment.aggregate({
        where: { status: "PENDING" },
        _sum: {
          hostEarnings: true,
          amount: true,
        },
        _count: true,
      }),
      // Released (paid out to clubs)
      prisma.payment.aggregate({
        where: { status: "RELEASED" },
        _sum: {
          hostEarnings: true,
          platformFee: true,
        },
      }),
      // Booking stats
      prisma.booking.groupBy({
        by: ["status"],
        _count: true,
        _sum: {
          totalAmount: true,
          clubEarnings: true,
        },
      }),
      // Top performing clubs by revenue
      prisma.payment.groupBy({
        by: ["bookingId"],
        where: {
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
        },
        _sum: {
          amount: true,
          hostEarnings: true,
          platformFee: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
        take: 50, // Get more to aggregate by club
      }),
    ]);

    // Get club details for top clubs
    const bookingIds = topClubs.map((t) => t.bookingId);
    const bookingsWithClubs = await prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      include: {
        club: {
          include: {
            country: true,
          },
        },
      },
    });

    // Aggregate by club
    const clubRevenueMap = new Map<
      string,
      {
        clubId: string;
        clubName: string;
        country: string;
        totalRevenue: number;
        platformFees: number;
        bookingCount: number;
      }
    >();

    for (const tc of topClubs) {
      const booking = bookingsWithClubs.find((b) => b.id === tc.bookingId);
      if (booking?.club) {
        const existing = clubRevenueMap.get(booking.club.id);
        if (existing) {
          existing.totalRevenue += tc._sum.amount || 0;
          existing.platformFees += tc._sum.platformFee || 0;
          existing.bookingCount += 1;
        } else {
          clubRevenueMap.set(booking.club.id, {
            clubId: booking.club.id,
            clubName: booking.club.name,
            country: booking.club.country?.name || "Unknown",
            totalRevenue: tc._sum.amount || 0,
            platformFees: tc._sum.platformFee || 0,
            bookingCount: 1,
          });
        }
      }
    }

    const topPerformingClubs = Array.from(clubRevenueMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Calculate business metrics
    const grossRevenue = allPayments._sum.amount || 0;
    const platformCommission = allPayments._sum.platformFee || 0;
    const hostPayouts = allPayments._sum.hostEarnings || 0;
    const platformFeeShareToHosts = allPayments._sum.platformFeeShare || 0;

    // PlayAway net revenue = platform commission - fee share given back to hosts
    const playAwayNetRevenue = platformCommission - platformFeeShareToHosts;

    // Stripe fees (approx 1.4% + €0.25 per transaction for EU cards, using 2% average)
    const estimatedStripeFees = grossRevenue * 0.02;

    // Net after payment processor
    const netAfterProcessorFees = playAwayNetRevenue - estimatedStripeFees;

    // Pending obligations
    const owedToClubs = pendingPayments._sum.hostEarnings || 0;

    // Monthly metrics
    const thisMonthGross = thisMonthPayments._sum.amount || 0;
    const thisMonthCommission = thisMonthPayments._sum.platformFee || 0;
    const lastMonthCommission = lastMonthPayments._sum.platformFee || 0;
    const thisYearCommission = thisYearPayments._sum.platformFee || 0;

    // Booking pipeline
    const confirmedBookings =
      bookingStats.find((b) => b.status === "CONFIRMED")?._count || 0;
    const confirmedValue =
      bookingStats.find((b) => b.status === "CONFIRMED")?._sum.totalAmount || 0;
    const completedBookings =
      bookingStats.find((b) => b.status === "COMPLETED")?._count || 0;
    const depositPaidBookings =
      bookingStats.find((b) => b.status === "DEPOSIT_PAID")?._count || 0;
    const fullPaidBookings =
      bookingStats.find((b) => b.status === "FULL_PAID")?._count || 0;

    return NextResponse.json({
      // Revenue Overview
      grossRevenue,
      platformCommission,
      hostPayouts,
      platformFeeShareToHosts,
      playAwayNetRevenue,

      // Payment Processor
      estimatedStripeFees,
      netAfterProcessorFees,

      // Obligations
      owedToClubs,
      pendingPaymentsCount: pendingPayments._count || 0,
      releasedToClubs: releasedPayments._sum.hostEarnings || 0,

      // Time-based
      thisMonthGross,
      thisMonthCommission,
      lastMonthCommission,
      thisYearCommission,

      // Month over month change
      monthOverMonthChange:
        lastMonthCommission > 0
          ? ((thisMonthCommission - lastMonthCommission) /
              lastMonthCommission) *
            100
          : 0,

      // Booking Pipeline
      pipeline: {
        confirmed: confirmedBookings,
        confirmedValue,
        depositPaid: depositPaidBookings,
        fullPaid: fullPaidBookings,
        completed: completedBookings,
      },

      // Top Performing Clubs
      topPerformingClubs,

      // Transaction count
      totalTransactions: allPayments._count || 0,
    });
  } catch (error) {
    console.error("Error fetching admin financials:", error);
    return NextResponse.json(
      { error: "Failed to fetch financials" },
      { status: 500 }
    );
  }
}
