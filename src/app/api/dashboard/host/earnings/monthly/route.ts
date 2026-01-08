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
      return NextResponse.json({ breakdown: [] });
    }

    const payments = await prisma.payment.findMany({
      where: {
        booking: { clubId: { in: clubIds } },
        status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        type: true,
        status: true,
        hostEarnings: true,
        createdAt: true,
      },
    });

    const monthlyMap = new Map<
      string,
      {
        month: string;
        year: number;
        teamTickets: number;
        dayPasses: number;
        total: number;
        released: number;
        pending: number;
      }
    >();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const earnings = payment.hostEarnings || 0;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: monthNames[date.getMonth()],
          year: date.getFullYear(),
          teamTickets: 0,
          dayPasses: 0,
          total: 0,
          released: 0,
          pending: 0,
        });
      }

      const entry = monthlyMap.get(key)!;
      entry.total += earnings;

      if (payment.type === "TEAM_TICKET") {
        entry.teamTickets += earnings;
      } else if (payment.type === "DAY_PASS") {
        entry.dayPasses += earnings;
      }

      if (payment.status === "RELEASED") {
        entry.released += earnings;
      } else if (payment.status === "PENDING") {
        entry.pending += earnings;
      }
    });

    const breakdown = Array.from(monthlyMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
      })
      .slice(0, 12);

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error("Error fetching monthly breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly breakdown" },
      { status: 500 }
    );
  }
}
