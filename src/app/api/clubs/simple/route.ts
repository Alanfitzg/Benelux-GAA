import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getClubsHandler() {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        location: true,
        region: true,
      },
    });
    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Apply rate limiting to endpoint
export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getClubsHandler);