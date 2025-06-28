import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET /api/tournaments/[id]/teams - Get all teams registered for a tournament
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching teams for tournament:', params.id);
    
    // First verify the event exists and is a tournament
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (event.eventType !== 'Tournament') {
      return NextResponse.json(
        { error: 'Event is not a tournament' },
        { status: 400 }
      );
    }

    const teams = await prisma.tournamentTeam.findMany({
      where: {
        eventId: params.id,
      },
      include: {
        club: true,
      },
      orderBy: {
        registeredAt: 'asc',
      },
    });

    console.log(`Found ${teams.length} teams for tournament ${params.id}`);
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching tournament teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/tournaments/[id]/teams - Register a team for a tournament
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clubId, teamName, teamType } = body;

    // Validate that the user is a club admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { adminOfClubs: true },
    });

    const isClubAdmin = user?.adminOfClubs.some(club => club.id === clubId);
    if (!isClubAdmin && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to register teams for this club' },
        { status: 403 }
      );
    }

    // Check tournament exists and validate team limits
    const tournament = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        teams: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.eventType !== 'Tournament') {
      return NextResponse.json(
        { error: 'Event is not a tournament' },
        { status: 400 }
      );
    }

    // Check team type matches
    if (tournament.teamType && tournament.teamType !== teamType) {
      return NextResponse.json(
        { error: `Tournament only accepts ${tournament.teamType} teams` },
        { status: 400 }
      );
    }

    // Check team limits
    if (tournament.maxTeams && tournament.teams.length >= tournament.maxTeams) {
      return NextResponse.json(
        { error: 'Tournament has reached maximum team capacity' },
        { status: 400 }
      );
    }

    // Create the team registration
    const team = await prisma.tournamentTeam.create({
      data: {
        eventId: params.id,
        clubId,
        teamName,
        teamType,
      },
      include: {
        club: true,
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error registering team:', error);
    return NextResponse.json(
      { error: 'Failed to register team' },
      { status: 500 }
    );
  }
}