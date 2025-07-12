import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const suggestDatesSchema = z.object({
  suggestedDates: z.array(z.string()).min(1),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interest = await prisma.tournamentInterest.findUnique({
      where: { id },
      include: { club: true },
    });

    if (!interest) {
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { adminOfClubs: true },
    });

    const isClubAdmin = user?.adminOfClubs.some(club => club.id === interest.clubId);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - must be club admin' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = suggestDatesSchema.parse(body);

    const updatedInterest = await prisma.tournamentInterest.update({
      where: { id },
      data: {
        suggestedDates: validatedData.suggestedDates.map(date => new Date(date)),
        clubResponse: validatedData.message,
        status: 'IN_DISCUSSION',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        club: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedInterest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error suggesting dates:', error);
    return NextResponse.json(
      { error: 'Failed to suggest dates' },
      { status: 500 }
    );
  }
}