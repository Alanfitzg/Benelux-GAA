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

    // Get Ireland clubs with their participated trips (past events)
    const irelandClubs = await prisma.club.findMany({
      where: {
        internationalUnit: {
          name: "Ireland",
        },
      },
      select: {
        id: true,
        name: true,
        subRegion: true,
        location: true,
        tournamentTeams: {
          where: {
            event: {
              startDate: { lt: now },
            },
          },
          select: {
            id: true,
            teamName: true,
            registeredAt: true,
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Get international clubs with their completed bookings (hosting)
    const internationalClubs = await prisma.club.findMany({
      where: {
        NOT: {
          internationalUnit: {
            name: "Ireland",
          },
        },
      },
      select: {
        id: true,
        name: true,
        location: true,
        country: {
          select: { name: true },
        },
        internationalUnit: {
          select: { name: true },
        },
        bookings: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
            teamName: true,
            arrivalDate: true,
            departureDate: true,
            teamSize: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Calculate Ireland summary
    const irelandWithTrips = irelandClubs.filter(
      (c) => c.tournamentTeams.length > 0
    );
    const totalIrelandTrips = irelandClubs.reduce(
      (acc, c) => acc + c.tournamentTeams.length,
      0
    );

    // Top Ireland clubs by trips
    const topIrelandClubs = irelandClubs
      .filter((c) => c.tournamentTeams.length > 0)
      .map((c) => ({
        name: c.name,
        county: c.subRegion || "-",
        location: c.location || "-",
        tripCount: c.tournamentTeams.length,
        lastTrip:
          c.tournamentTeams.length > 0
            ? c.tournamentTeams.sort(
                (a, b) =>
                  new Date(b.registeredAt).getTime() -
                  new Date(a.registeredAt).getTime()
              )[0].event.title
            : "-",
      }))
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 15);

    // Group Ireland trips by county
    const tripsByCounty: Record<string, number> = {};
    irelandClubs.forEach((club) => {
      const county = club.subRegion || "Unknown";
      tripsByCounty[county] =
        (tripsByCounty[county] || 0) + club.tournamentTeams.length;
    });

    const tripsByCountyArray = Object.entries(tripsByCounty)
      .filter(([, count]) => count > 0)
      .map(([county, count]) => ({ county, trips: count }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 15);

    // Calculate international summary
    const internationalWithBookings = internationalClubs.filter(
      (c) => c.bookings.length > 0
    );
    const totalCompletedBookings = internationalClubs.reduce(
      (acc, c) => acc + c.bookings.length,
      0
    );

    // Top international clubs by hosting
    const topInternationalClubs = internationalClubs
      .filter((c) => c.bookings.length > 0)
      .map((c) => ({
        name: c.name,
        country: c.country?.name || "-",
        unit: c.internationalUnit?.name || "-",
        bookingsCompleted: c.bookings.length,
        teamsHosted: c.bookings.reduce((acc, b) => acc + b.teamSize, 0),
      }))
      .sort((a, b) => b.bookingsCompleted - a.bookingsCompleted)
      .slice(0, 15);

    // Group international bookings by country
    const bookingsByCountry: Record<string, number> = {};
    internationalClubs.forEach((club) => {
      const country = club.country?.name || "Unknown";
      bookingsByCountry[country] =
        (bookingsByCountry[country] || 0) + club.bookings.length;
    });

    const bookingsByCountryArray = Object.entries(bookingsByCountry)
      .filter(([, count]) => count > 0)
      .map(([country, count]) => ({ country, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 15);

    // Get recent trips/bookings for activity feed
    const recentTrips = irelandClubs
      .flatMap((c) =>
        c.tournamentTeams.map((t) => ({
          type: "trip" as const,
          clubName: c.name,
          eventName: t.event.title,
          date: t.registeredAt,
          location: t.event.location,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const recentBookings = internationalClubs
      .flatMap((c) =>
        c.bookings.map((b) => ({
          type: "booking" as const,
          clubName: c.name,
          teamName: b.teamName,
          date: b.arrivalDate,
          teamSize: b.teamSize,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const report = {
      irelandSummary: {
        totalClubs: irelandClubs.length,
        clubsWithTrips: irelandWithTrips.length,
        totalTrips: totalIrelandTrips,
        participationRate:
          irelandClubs.length > 0
            ? Math.round((irelandWithTrips.length / irelandClubs.length) * 100)
            : 0,
      },
      internationalSummary: {
        totalClubs: internationalClubs.length,
        clubsWithBookings: internationalWithBookings.length,
        totalCompletedBookings,
        hostingRate:
          internationalClubs.length > 0
            ? Math.round(
                (internationalWithBookings.length / internationalClubs.length) *
                  100
              )
            : 0,
      },
      topIrelandClubs,
      topInternationalClubs,
      tripsByCounty: tripsByCountyArray,
      bookingsByCountry: bookingsByCountryArray,
      recentActivity: {
        trips: recentTrips,
        bookings: recentBookings,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating club trips report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
