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

    // =====================
    // LEAD TIME ANALYSIS
    // =====================

    // Get all tournament team registrations with event and club details
    const registrations = await prisma.tournamentTeam.findMany({
      select: {
        id: true,
        registeredAt: true,
        teamType: true,
        club: {
          select: {
            id: true,
            name: true,
            countryId: true,
            isMainlandEurope: true,
            country: {
              select: {
                id: true,
                name: true,
              },
            },
            regionRecord: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
            clubId: true,
            club: {
              select: {
                id: true,
                name: true,
                countryId: true,
                country: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate lead time for each registration
    const leadTimeData = registrations
      .filter((r) => r.club && r.event && !r.club.isMainlandEurope) // Only Irish/UK clubs travelling
      .map((r) => {
        const registrationDate = new Date(r.registeredAt);
        const eventDate = new Date(r.event.startDate);
        const leadTimeDays = Math.floor(
          (eventDate.getTime() - registrationDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          leadTimeDays,
          teamType: r.teamType,
          travellingClubId: r.club.id,
          travellingClubName: r.club.name,
          travellingCountry: r.club.country?.name || "Unknown",
          travellingRegion: r.club.regionRecord?.name || null,
          hostClubId: r.event.club?.id || null,
          hostClubName: r.event.club?.name || null,
          hostCountry:
            r.event.club?.country?.name || r.event.location || "Unknown",
          eventId: r.event.id,
          eventTitle: r.event.title,
          eventDate: r.event.startDate,
          registrationDate: r.registeredAt,
        };
      })
      .filter((r) => r.leadTimeDays >= 0 && r.leadTimeDays <= 365); // Reasonable lead times only

    // Overall lead time stats
    const leadTimes = leadTimeData.map((r) => r.leadTimeDays);
    const avgLeadTime =
      leadTimes.length > 0
        ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length)
        : 0;
    const medianLeadTime =
      leadTimes.length > 0
        ? leadTimes.sort((a, b) => a - b)[Math.floor(leadTimes.length / 2)]
        : 0;

    // Lead time by destination country
    const leadTimeByDestination: Record<string, number[]> = {};
    leadTimeData.forEach((r) => {
      const country = r.hostCountry;
      if (!leadTimeByDestination[country]) {
        leadTimeByDestination[country] = [];
      }
      leadTimeByDestination[country].push(r.leadTimeDays);
    });

    const destinationLeadTimes = Object.entries(leadTimeByDestination)
      .map(([country, times]) => ({
        country,
        avgLeadTime: Math.round(
          times.reduce((a, b) => a + b, 0) / times.length
        ),
        bookings: times.length,
      }))
      .filter((d) => d.bookings >= 1)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 15);

    // Lead time by team type
    const leadTimeByTeamType: Record<string, number[]> = {};
    leadTimeData.forEach((r) => {
      const type = r.teamType || "Unknown";
      if (!leadTimeByTeamType[type]) {
        leadTimeByTeamType[type] = [];
      }
      leadTimeByTeamType[type].push(r.leadTimeDays);
    });

    const teamTypeLeadTimes = Object.entries(leadTimeByTeamType)
      .map(([teamType, times]) => ({
        teamType,
        avgLeadTime: Math.round(
          times.reduce((a, b) => a + b, 0) / times.length
        ),
        bookings: times.length,
      }))
      .sort((a, b) => b.bookings - a.bookings);

    // Lead time distribution (buckets)
    const leadTimeBuckets = {
      lastMinute: leadTimeData.filter((r) => r.leadTimeDays <= 14).length,
      shortTerm: leadTimeData.filter(
        (r) => r.leadTimeDays > 14 && r.leadTimeDays <= 30
      ).length,
      mediumTerm: leadTimeData.filter(
        (r) => r.leadTimeDays > 30 && r.leadTimeDays <= 60
      ).length,
      planned: leadTimeData.filter(
        (r) => r.leadTimeDays > 60 && r.leadTimeDays <= 120
      ).length,
      earlyBird: leadTimeData.filter((r) => r.leadTimeDays > 120).length,
    };

    // =====================
    // TRAVEL RELATIONSHIPS
    // =====================

    // County/Region → Country corridors
    const corridorData: Record<string, Record<string, number>> = {};
    leadTimeData.forEach((r) => {
      const origin = r.travellingRegion || r.travellingCountry;
      const destination = r.hostCountry;
      if (!corridorData[origin]) {
        corridorData[origin] = {};
      }
      corridorData[origin][destination] =
        (corridorData[origin][destination] || 0) + 1;
    });

    // Convert to array format and find top corridors
    const corridors: { origin: string; destination: string; trips: number }[] =
      [];
    Object.entries(corridorData).forEach(([origin, destinations]) => {
      Object.entries(destinations).forEach(([destination, trips]) => {
        corridors.push({ origin, destination, trips });
      });
    });
    const topCorridors = corridors
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 20);

    // Repeat travellers - clubs with multiple trips
    const clubTripCounts: Record<
      string,
      { name: string; trips: number; destinations: Set<string> }
    > = {};
    leadTimeData.forEach((r) => {
      if (!clubTripCounts[r.travellingClubId]) {
        clubTripCounts[r.travellingClubId] = {
          name: r.travellingClubName,
          trips: 0,
          destinations: new Set(),
        };
      }
      clubTripCounts[r.travellingClubId].trips++;
      clubTripCounts[r.travellingClubId].destinations.add(r.hostCountry);
    });

    const frequentTravellers = Object.values(clubTripCounts)
      .filter((c) => c.trips >= 2)
      .map((c) => ({
        clubName: c.name,
        totalTrips: c.trips,
        uniqueDestinations: c.destinations.size,
        destinations: Array.from(c.destinations).join(", "),
      }))
      .sort((a, b) => b.totalTrips - a.totalTrips)
      .slice(0, 15);

    // Repeat host clubs
    const hostTripCounts: Record<
      string,
      { name: string; country: string; visits: number; visitors: Set<string> }
    > = {};
    leadTimeData.forEach((r) => {
      if (r.hostClubId) {
        if (!hostTripCounts[r.hostClubId]) {
          hostTripCounts[r.hostClubId] = {
            name: r.hostClubName || "Unknown",
            country: r.hostCountry,
            visits: 0,
            visitors: new Set(),
          };
        }
        hostTripCounts[r.hostClubId].visits++;
        hostTripCounts[r.hostClubId].visitors.add(r.travellingClubId);
      }
    });

    const popularHosts = Object.values(hostTripCounts)
      .filter((h) => h.visits >= 2)
      .map((h) => ({
        clubName: h.name,
        country: h.country,
        totalVisits: h.visits,
        uniqueVisitors: h.visitors.size,
        returnRate:
          h.visits > 0
            ? Math.round(((h.visits - h.visitors.size) / h.visits) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, 15);

    // Club pairings - which clubs have visited each other multiple times
    const pairings: Record<
      string,
      {
        travellerName: string;
        hostName: string;
        hostCountry: string;
        count: number;
      }
    > = {};
    leadTimeData.forEach((r) => {
      if (r.hostClubId) {
        const key = `${r.travellingClubId}-${r.hostClubId}`;
        if (!pairings[key]) {
          pairings[key] = {
            travellerName: r.travellingClubName,
            hostName: r.hostClubName || "Unknown",
            hostCountry: r.hostCountry,
            count: 0,
          };
        }
        pairings[key].count++;
      }
    });

    const repeatPairings = Object.values(pairings)
      .filter((p) => p.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Destination popularity
    const destinationCounts: Record<string, number> = {};
    leadTimeData.forEach((r) => {
      destinationCounts[r.hostCountry] =
        (destinationCounts[r.hostCountry] || 0) + 1;
    });

    const popularDestinations = Object.entries(destinationCounts)
      .map(([country, trips]) => ({ country, trips }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 10);

    // =====================
    // SUMMARY STATS
    // =====================

    const totalBookings = leadTimeData.length;
    const uniqueTravellingClubs = new Set(
      leadTimeData.map((r) => r.travellingClubId)
    ).size;
    const uniqueHostClubs = new Set(
      leadTimeData.filter((r) => r.hostClubId).map((r) => r.hostClubId)
    ).size;
    const uniqueDestinations = new Set(leadTimeData.map((r) => r.hostCountry))
      .size;
    const repeatTravelerCount = Object.values(clubTripCounts).filter(
      (c) => c.trips >= 2
    ).length;
    const repeatTravelerRate =
      uniqueTravellingClubs > 0
        ? Math.round((repeatTravelerCount / uniqueTravellingClubs) * 100)
        : 0;

    return NextResponse.json({
      summary: {
        totalBookings,
        uniqueTravellingClubs,
        uniqueHostClubs,
        uniqueDestinations,
        avgLeadTime,
        medianLeadTime,
        repeatTravelerCount,
        repeatTravelerRate,
      },
      leadTime: {
        buckets: leadTimeBuckets,
        byDestination: destinationLeadTimes,
        byTeamType: teamTypeLeadTimes,
      },
      relationships: {
        topCorridors,
        frequentTravellers,
        popularHosts,
        repeatPairings,
        popularDestinations,
      },
      // Full data for CSV download
      allBookingData: leadTimeData.map((r) => ({
        travellingClub: r.travellingClubName,
        travellingCountry: r.travellingCountry,
        travellingRegion: r.travellingRegion || "",
        hostClub: r.hostClubName || "",
        hostCountry: r.hostCountry,
        eventTitle: r.eventTitle,
        eventDate: new Date(r.eventDate).toLocaleDateString("en-IE"),
        registrationDate: new Date(r.registrationDate).toLocaleDateString(
          "en-IE"
        ),
        leadTimeDays: r.leadTimeDays,
        teamType: r.teamType,
      })),
    });
  } catch (error) {
    console.error("Error generating booking intelligence report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
