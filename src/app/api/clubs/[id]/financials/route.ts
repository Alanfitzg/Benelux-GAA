import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

function maskIban(iban: string | null): string | null {
  if (!iban) return null;
  const cleaned = iban.replace(/\s/g, "");
  if (cleaned.length < 8) return "****";
  return "****" + cleaned.slice(-4);
}

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

    // Verify user is admin of this club or super admin
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admins: { select: { id: true } },
        events: {
          where: { approvalStatus: "APPROVED" },
          select: {
            id: true,
            title: true,
            startDate: true,
            cost: true,
            interests: { select: { id: true } },
            teams: { select: { id: true } },
          },
        },
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

    // Check if club is mainland Europe
    if (!club.isMainlandEurope) {
      return NextResponse.json(
        { error: "Financials are only available for European host clubs" },
        { status: 403 }
      );
    }

    // Get date references
    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch payment data for this club
    const [
      releasedPayments,
      pendingPayments,
      withheldPayments,
      teamTicketPayments,
      dayPassPayments,
      thisYearPayments,
      thisMonthPayments,
      lastMonthPayments,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          status: "RELEASED",
        },
        _sum: { hostEarnings: true, platformFee: true, platformFeeShare: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          status: "PENDING",
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          status: "WITHHELD",
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          type: "TEAM_TICKET",
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          type: "DAY_PASS",
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
        },
        _sum: { hostEarnings: true, platformFeeShare: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: thisYearStart },
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: thisMonthStart },
        },
        _sum: { hostEarnings: true },
      }),
      prisma.payment.aggregate({
        where: {
          booking: { clubId },
          status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { hostEarnings: true },
      }),
    ]);

    const totalReleased = releasedPayments._sum.hostEarnings || 0;
    const totalPending = pendingPayments._sum.hostEarnings || 0;
    const totalWithheld = withheldPayments._sum.hostEarnings || 0;
    const thisYearEarnings = thisYearPayments._sum.hostEarnings || 0;
    const thisMonthEarnings = thisMonthPayments._sum.hostEarnings || 0;
    const lastMonthEarnings = lastMonthPayments._sum.hostEarnings || 0;

    const growthPercent =
      lastMonthEarnings > 0
        ? Math.round(
            ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
          )
        : thisMonthEarnings > 0
          ? 100
          : 0;

    // Calculate potential revenue from interests
    const dayPassPrice = club.dayPassPrice || 45;
    const avgTeamSize = 15;

    // Calculate unconverted interests per event
    const byEvent = club.events
      .map((event) => ({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startDate.toISOString(),
        interestCount: event.interests.length,
        teamsRegistered: event.teams.length,
        unconverted: Math.max(0, event.interests.length - event.teams.length),
        potentialRevenue:
          Math.max(0, event.interests.length - event.teams.length) *
          avgTeamSize *
          dayPassPrice,
      }))
      .filter((e) => e.interestCount > 0)
      .sort((a, b) => b.potentialRevenue - a.potentialRevenue)
      .slice(0, 10);

    const totalUnconverted = byEvent.reduce((sum, e) => sum + e.unconverted, 0);
    const totalPotential = totalUnconverted * avgTeamSize * dayPassPrice;

    // Get monthly breakdown for the year
    const yearPayments = await prisma.payment.findMany({
      where: {
        booking: { clubId },
        status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
        createdAt: { gte: thisYearStart },
      },
      select: {
        hostEarnings: true,
        status: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyMap = new Map<
      string,
      { earned: number; released: number; pending: number }
    >();
    yearPayments.forEach((p) => {
      const monthKey = p.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const existing = monthlyMap.get(monthKey) || {
        earned: 0,
        released: 0,
        pending: 0,
      };
      const earnings = p.hostEarnings || 0;
      monthlyMap.set(monthKey, {
        earned: existing.earned + earnings,
        released:
          p.status === "RELEASED"
            ? existing.released + earnings
            : existing.released,
        pending:
          p.status === "PENDING"
            ? existing.pending + earnings
            : existing.pending,
      });
    });

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: month.split(" ")[0],
        year: parseInt(month.split(" ")[1]),
        earned: data.earned,
        released: data.released,
        pending: data.pending,
      }))
      .sort((a, b) => {
        const dateA = new Date(`${a.month} 1, ${a.year}`);
        const dateB = new Date(`${b.month} 1, ${b.year}`);
        return dateA.getTime() - dateB.getTime();
      });

    // Bank details (masked for security)
    const bankDetails = {
      accountHolder: club.bankAccountHolder,
      ibanMasked: maskIban(club.bankIban),
      ibanFull: isClubAdmin ? club.bankIban : null, // Only club admin sees full IBAN
      bic: club.bankBic,
      bankName: club.bankName,
      isComplete: !!(
        club.bankAccountHolder &&
        club.bankIban &&
        club.bankBic &&
        club.bankName
      ),
    };

    return NextResponse.json({
      earnings: {
        totalReleased,
        totalPending,
        totalWithheld,
        thisYearEarnings,
        thisMonthEarnings,
        lastMonthEarnings,
        growthPercent,
        teamTicketEarnings: teamTicketPayments._sum.hostEarnings || 0,
        dayPassEarnings: dayPassPayments._sum.hostEarnings || 0,
        platformFeeShare:
          (dayPassPayments._sum.platformFeeShare || 0) +
          (releasedPayments._sum.platformFeeShare || 0),
      },
      potential: {
        totalPotential,
        unconvertedInterests: totalUnconverted,
        avgTeamSize,
        dayPassPrice,
        byEvent,
      },
      bankDetails,
      monthlyBreakdown,
      clubName: club.name,
    });
  } catch (error) {
    console.error("Error fetching financials:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial data" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify user is admin of this club (not super admin - they shouldn't edit bank details)
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admins: { select: { id: true } },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const isClubAdmin = club.admins.some(
      (admin) => admin.id === session.user.id
    );

    if (!isClubAdmin) {
      return NextResponse.json(
        { error: "Only club admins can update bank details" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bankAccountHolder, bankIban, bankBic, bankName } = body;

    // Validate IBAN format (basic check)
    if (
      bankIban &&
      !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}$/.test(
        bankIban.replace(/\s/g, "").toUpperCase()
      )
    ) {
      return NextResponse.json(
        { error: "Invalid IBAN format" },
        { status: 400 }
      );
    }

    // Update club bank details
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        bankAccountHolder: bankAccountHolder || null,
        bankIban: bankIban ? bankIban.replace(/\s/g, "").toUpperCase() : null,
        bankBic: bankBic ? bankBic.toUpperCase() : null,
        bankName: bankName || null,
      },
      select: {
        bankAccountHolder: true,
        bankIban: true,
        bankBic: true,
        bankName: true,
      },
    });

    return NextResponse.json({
      success: true,
      bankDetails: {
        accountHolder: updatedClub.bankAccountHolder,
        ibanMasked: maskIban(updatedClub.bankIban),
        ibanFull: updatedClub.bankIban,
        bic: updatedClub.bankBic,
        bankName: updatedClub.bankName,
        isComplete: !!(
          updatedClub.bankAccountHolder &&
          updatedClub.bankIban &&
          updatedClub.bankBic &&
          updatedClub.bankName
        ),
      },
    });
  } catch (error) {
    console.error("Error updating bank details:", error);
    return NextResponse.json(
      { error: "Failed to update bank details" },
      { status: 500 }
    );
  }
}
