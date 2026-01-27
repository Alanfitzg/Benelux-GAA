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
      return NextResponse.json({ payments: [] });
    }

    const payments = await prisma.payment.findMany({
      where: {
        booking: { clubId: { in: clubIds } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        booking: {
          include: {
            club: {
              select: { name: true },
            },
          },
        },
      },
    });

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      type: payment.type,
      status: payment.status,
      amount: payment.amount,
      hostEarnings: payment.hostEarnings || 0,
      platformFee: payment.platformFee || 0,
      platformFeeShare: payment.platformFeeShare || 0,
      quantity: payment.quantity || 0,
      unitPrice: payment.unitPrice || 0,
      createdAt: payment.createdAt.toISOString(),
      releasedAt: payment.releasedAt?.toISOString() || null,
      withheldReason: payment.withheldReason || null,
      booking: {
        id: payment.booking.id,
        teamName: payment.booking.teamName,
        arrivalDate: payment.booking.arrivalDate.toISOString(),
        departureDate: payment.booking.departureDate.toISOString(),
        club: {
          name: payment.booking.club.name,
        },
      },
    }));

    return NextResponse.json({ payments: formattedPayments });
  } catch (error) {
    console.error("Error fetching earnings transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
