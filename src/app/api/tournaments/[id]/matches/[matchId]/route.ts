import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { MatchStatus } from '@prisma/client';

// PATCH /api/tournaments/[id]/matches/[matchId] - Update match details or results
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { matchId } = await params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { homeScore, awayScore, status, matchDate, venue, round } = body;

    // Get the match to check authorization
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        event: { include: { club: true } },
        homeTeam: { include: { club: true } },
        awayTeam: { include: { club: true } },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Validate user is authorized
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { adminOfClubs: true },
    });

    const isTournamentOrganizer = user?.adminOfClubs.some(
      club => club.id === match.event.clubId
    );
    
    const isTeamAdmin = user?.adminOfClubs.some(
      club => club.id === match.homeTeam?.clubId || club.id === match.awayTeam?.clubId
    );

    // Tournament organizers can update everything, team admins can only update scores
    if (!isTournamentOrganizer && !isTeamAdmin && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to update this match' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: {
      matchDate?: Date | null;
      venue?: string;
      round?: string;
      status?: MatchStatus;
      homeScore?: number;
      awayScore?: number;
    } = {};
    
    if (isTournamentOrganizer || user?.role === 'SUPER_ADMIN') {
      // Organizers can update all fields
      if (matchDate !== undefined) updateData.matchDate = matchDate ? new Date(matchDate) : null;
      if (venue !== undefined) updateData.venue = venue;
      if (round !== undefined) updateData.round = round;
      if (status !== undefined) updateData.status = status as MatchStatus;
    }

    // Both organizers and team admins can update scores
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;

    // Auto-set status to completed if both scores are provided
    if (homeScore !== undefined && awayScore !== undefined && homeScore !== null && awayScore !== null) {
      updateData.status = 'COMPLETED';
    }

    // Update the match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        homeTeam: {
          include: { club: true },
        },
        awayTeam: {
          include: { club: true },
        },
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}

// DELETE /api/tournaments/[id]/matches/[matchId] - Cancel a match
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { matchId } = await params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the match to check authorization
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        event: { include: { club: true } },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Only tournament organizers and super admins can cancel matches
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { adminOfClubs: true },
    });

    const isTournamentOrganizer = user?.adminOfClubs.some(
      club => club.id === match.event.clubId
    );

    if (!isTournamentOrganizer && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to cancel this match' },
        { status: 403 }
      );
    }

    // Mark match as cancelled instead of deleting
    const cancelledMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'CANCELLED' },
      include: {
        homeTeam: {
          include: { club: true },
        },
        awayTeam: {
          include: { club: true },
        },
      },
    });

    return NextResponse.json(cancelledMatch);
  } catch (error) {
    console.error('Error cancelling match:', error);
    return NextResponse.json(
      { error: 'Failed to cancel match' },
      { status: 500 }
    );
  }
}