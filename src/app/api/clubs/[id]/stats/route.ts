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
            id: session.user.id
          }
        }
      }
    });

    // Allow access if user is club admin or super admin
    if (!isClubAdmin && session.user.role !== 'SUPER_ADMIN') {
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
                interests: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        _count: {
          select: {
            members: true,
            events: true
          }
        }
      }
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Calculate statistics
    const totalEventInterests = club.events.reduce((sum, event) => sum + event._count.interests, 0);
    const upcomingEvents = club.events.filter(event => new Date(event.startDate) > new Date());
    const pastEvents = club.events.filter(event => new Date(event.startDate) <= new Date());

    // Get interest details for each event
    const eventStats = club.events.map(event => ({
      id: event.id,
      title: event.title,
      eventType: event.eventType,
      startDate: event.startDate,
      location: event.location,
      interestCount: event._count.interests,
      interests: event.interests.map(interest => ({
        name: interest.name,
        email: interest.email,
        submittedAt: interest.submittedAt,
        message: interest.message
      }))
    }));

    // Get recent interests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentInterests = await prisma.interest.findMany({
      where: {
        event: {
          clubId: id
        },
        submittedAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        event: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    });

    const stats = {
      club: {
        id: club.id,
        name: club.name,
        location: club.location,
        memberCount: club._count.members,
        eventCount: club._count.events
      },
      overview: {
        totalEvents: club.events.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        totalInterests: totalEventInterests,
        averageInterestsPerEvent: club.events.length > 0 ? (totalEventInterests / club.events.length).toFixed(1) : '0'
      },
      events: eventStats,
      recentInterests: recentInterests.map(interest => ({
        id: interest.id,
        name: interest.name,
        email: interest.email,
        eventTitle: interest.event.title,
        submittedAt: interest.submittedAt,
        message: interest.message
      }))
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