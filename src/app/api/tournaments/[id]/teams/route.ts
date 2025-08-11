import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET /api/tournaments/[id]/teams - Get all teams registered for a tournament
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    console.log('Fetching teams for tournament:', id);
    
    // First verify the event exists and is a tournament
    const event = await prisma.event.findUnique({
      where: { id: id },
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
        eventId: id,
      },
      include: {
        club: true,
      },
      orderBy: {
        registeredAt: 'asc',
      },
    });

    console.log(`Found ${teams.length} teams for tournament ${id}`);
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clubId, teamName, teamType, division } = body;

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
      where: { id: id },
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

    // Check team type matches accepted types
    if (tournament.acceptedTeamTypes && tournament.acceptedTeamTypes.length > 0 && !tournament.acceptedTeamTypes.includes(teamType)) {
      return NextResponse.json(
        { error: `Tournament only accepts these team types: ${tournament.acceptedTeamTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if division is required and valid
    if (tournament.divisions && tournament.divisions.length > 0) {
      if (!division) {
        return NextResponse.json(
          { error: 'Division is required for this tournament' },
          { status: 400 }
        );
      }
      if (!tournament.divisions.includes(division)) {
        return NextResponse.json(
          { error: `Invalid division. Available divisions: ${tournament.divisions.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Note: maxTeamsPerClub validation removed to allow unlimited teams per club per division

    // Check overall team limits
    if (tournament.maxTeams) {
      const teamsInDivision = division 
        ? tournament.teams.filter(t => t.division === division).length
        : tournament.teams.length;
        
      if (teamsInDivision >= tournament.maxTeams) {
        return NextResponse.json(
          { error: 'Tournament has reached maximum team capacity' },
          { status: 400 }
        );
      }
    }

    // Create the team registration
    const team = await prisma.tournamentTeam.create({
      data: {
        eventId: id,
        clubId,
        teamName,
        teamType,
        division,
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