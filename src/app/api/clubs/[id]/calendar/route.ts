import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get current date and next 6 months range
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(addMonths(today, 5)); // 6 months total

    // Fetch all calendar data in parallel
    const [availability, interests, events] = await Promise.all([
      // Get availability slots for the next 6 months
      prisma.availabilitySlot.findMany({
        where: {
          clubId: id,
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          date: 'asc',
        },
      }),

      // Get tournament interests for this club
      prisma.tournamentInterest.findMany({
        where: {
          clubId: id,
          // Include interests that might overlap with our date range
          OR: [
            {
              specificDate: {
                gte: start,
                lte: end,
              },
            },
            {
              monthYear: {
                gte: start,
                lte: end,
              },
            },
            {
              dateRangeStart: {
                lte: end,
              },
              dateRangeEnd: {
                gte: start,
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      // Get events for this club in the date range
      prisma.event.findMany({
        where: {
          clubId: id,
          startDate: {
            gte: start,
            lte: end,
          },
        },
        select: {
          id: true,
          title: true,
          startDate: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      }),
    ]);

    return NextResponse.json({
      availability,
      interests,
      events,
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}