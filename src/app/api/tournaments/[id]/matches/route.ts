import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET /api/tournaments/[id]/matches - Get all matches for a tournament
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching matches for tournament:', params.id);
    
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

    const matches = await prisma.match.findMany({
      where: {
        eventId: params.id,
      },
      include: {
        homeTeam: {
          include: { club: true },
        },
        awayTeam: {
          include: { club: true },
        },
      },
      orderBy: [
        { round: 'asc' },
        { matchDate: 'asc' },
      ],
    });

    console.log(`Found ${matches.length} matches for tournament ${params.id}`);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/tournaments/[id]/matches - Create a new match
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
    const { homeTeamId, awayTeamId, matchDate, venue, round } = body;

    // Check if user has permission (tournament organizer or super admin)
    const tournament = await prisma.event.findUnique({
      where: { id: params.id },
      include: { club: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { adminOfClubs: true },
    });

    const isTournamentOrganizer = user?.adminOfClubs.some(
      club => club.id === tournament.clubId
    );
    
    if (!isTournamentOrganizer && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to create matches for this tournament' },
        { status: 403 }
      );
    }

    // Create the match
    const match = await prisma.match.create({
      data: {
        eventId: params.id,
        homeTeamId,
        awayTeamId,
        matchDate: matchDate ? new Date(matchDate) : null,
        venue,
        round,
      },
      include: {
        homeTeam: {
          include: { club: true },
        },
        awayTeam: {
          include: { club: true },
        },
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}