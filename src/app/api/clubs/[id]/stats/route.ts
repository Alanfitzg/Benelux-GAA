import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a club admin for this club
    const isClubAdmin = await prisma.club.findFirst({
      where: {
        id,
        admins: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    // Allow access if user is club admin or super admin
    if (!isClubAdmin && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get club details with events and interest counts
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            interests: true,
            _count: {
              select: {
                interests: true,
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Calculate statistics
    const totalEventInterests = club.events.reduce(
      (sum, event) => sum + event._count.interests,
      0
    );
    const upcomingEvents = club.events.filter(
      (event) => new Date(event.startDate) > new Date()
    );
    const pastEvents = club.events.filter(
      (event) => new Date(event.startDate) <= new Date()
    );

    // Calculate earnings for current calendar year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const yearEvents = club.events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate >= yearStart && eventDate <= yearEnd;
    });

    const yearEarnings = yearEvents.reduce((sum, event) => {
      if (event.cost && event._count.interests > 0) {
        return sum + event.cost * event._count.interests;
      }
      return sum;
    }, 0);

    // Get interest details for each event
    const eventStats = club.events.map((event) => ({
      id: event.id,
      title: event.title,
      eventType: event.eventType,
      startDate: event.startDate.toISOString(),
      location: event.location,
      interestCount: event._count.interests,
      approvalStatus: event.approvalStatus,
      rejectionReason: event.rejectionReason,
      appealStatus: event.appealStatus,
      dismissedAt: event.dismissedAt?.toISOString() || null,
      interests: event.interests.map((interest) => ({
        name: interest.name,
        email: interest.email,
        submittedAt: interest.submittedAt.toISOString(),
        message: interest.message,
      })),
    }));

    // Count pending events
    const pendingEvents = club.events.filter(
      (event) => event.approvalStatus === "PENDING"
    );

    // Get recent interests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInterests = await prisma.interest.findMany({
      where: {
        event: {
          clubId: id,
        },
        submittedAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 10,
    });

    // Get applications this club has submitted to other tournaments (for Irish clubs)
    const clubApplications = await prisma.interest.findMany({
      where: {
        applicantClubId: id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
            club: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    // Hero stats for European host clubs - teams welcomed and players hosted
    // Count teams that have registered for this club's events (past events only = completed)
    const teamsWelcomed = await prisma.tournamentTeam.count({
      where: {
        event: {
          clubId: id,
          startDate: {
            lt: new Date(), // Past events only
          },
        },
      },
    });

    // Get total players hosted from bookings for this club (completed bookings)
    const bookingsWithPlayers = await prisma.booking.aggregate({
      where: {
        clubId: id,
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      _sum: {
        teamSize: true,
      },
    });

    // If no booking data, estimate from tournament teams (avg 15 players per team)
    const playersFromBookings = bookingsWithPlayers._sum.teamSize || 0;
    const estimatedPlayersFromTeams = teamsWelcomed * 15;
    const playersHosted =
      playersFromBookings > 0 ? playersFromBookings : estimatedPlayersFromTeams;

    // Count completed/past events hosted
    const eventsHosted = pastEvents.filter(
      (event) => event.approvalStatus === "APPROVED"
    ).length;

    const stats = {
      club: {
        id: club.id,
        name: club.name,
        location: club.location,
        crest: club.imageUrl,
        memberCount: club._count.members,
        eventCount: club._count.events,
        dayPassPrice: club.dayPassPrice,
        verificationStatus: club.verificationStatus,
        verificationExpiry: club.verificationExpiry?.toISOString() || null,
        bio: club.bio,
        twitter: club.twitter,
        tiktok: club.tiktok,
      },
      overview: {
        totalEvents: club.events.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        pendingEvents: pendingEvents.length,
        totalInterests: totalEventInterests,
        averageInterestsPerEvent:
          club.events.length > 0
            ? (totalEventInterests / club.events.length).toFixed(1)
            : "0",
        yearEarnings: yearEarnings,
        currentYear: currentYear,
        // Hero stats for European host clubs
        teamsWelcomed,
        playersHosted,
        eventsHosted,
      },
      events: eventStats,
      recentInterests: recentInterests.map((interest) => ({
        id: interest.id,
        name: interest.name,
        email: interest.email,
        eventTitle: interest.event.title,
        submittedAt: interest.submittedAt.toISOString(),
        message: interest.message,
      })),
      applications: clubApplications.map((app) => ({
        id: app.id,
        eventId: app.event.id,
        eventTitle: app.event.title,
        eventDate: app.event.startDate.toISOString(),
        eventLocation: app.event.location,
        hostClubId: app.event.club?.id,
        hostClubName: app.event.club?.name,
        status: app.status,
        submittedAt: app.submittedAt.toISOString(),
        message: app.message,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching club stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch club statistics" },
      { status: 500 }
    );
  }
}
