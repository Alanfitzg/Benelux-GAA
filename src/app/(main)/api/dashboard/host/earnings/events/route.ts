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
      return NextResponse.json({ events: [] });
    }

    const bookingsWithPayments = await prisma.booking.findMany({
      where: {
        clubId: { in: clubIds },
      },
      include: {
        payments: {
          where: {
            status: { in: ["RELEASED", "PENDING", "COMPLETED"] },
          },
        },
        club: {
          select: { name: true },
        },
      },
      orderBy: { arrivalDate: "desc" },
    });

    const eventMap = new Map<
      string,
      {
        eventId: string;
        eventTitle: string;
        eventDate: string;
        teamTicketRevenue: number;
        dayPassRevenue: number;
        totalRevenue: number;
        teamsHosted: number;
        playersHosted: number;
      }
    >();

    bookingsWithPayments.forEach((booking) => {
      const eventKey = `${booking.clubId}-${booking.arrivalDate.toISOString().split("T")[0]}`;

      if (!eventMap.has(eventKey)) {
        eventMap.set(eventKey, {
          eventId: eventKey,
          eventTitle: `${booking.club.name} - ${booking.teamName}`,
          eventDate: booking.arrivalDate.toISOString(),
          teamTicketRevenue: 0,
          dayPassRevenue: 0,
          totalRevenue: 0,
          teamsHosted: 0,
          playersHosted: 0,
        });
      }

      const entry = eventMap.get(eventKey)!;
      entry.teamsHosted += 1;
      entry.playersHosted += booking.teamSize;

      booking.payments.forEach((payment) => {
        const earnings = payment.hostEarnings || 0;
        entry.totalRevenue += earnings;

        if (payment.type === "TEAM_TICKET") {
          entry.teamTicketRevenue += earnings;
        } else if (payment.type === "DAY_PASS") {
          entry.dayPassRevenue += earnings;
        }
      });
    });

    const events = Array.from(eventMap.values())
      .sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      )
      .slice(0, 20);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching event breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch event breakdown" },
      { status: 500 }
    );
  }
}
