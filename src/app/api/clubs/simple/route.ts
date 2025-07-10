import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { unstable_cache } from 'next/cache';

// Cached function for simple club data
const getCachedSimpleClubs = unstable_cache(
  async () => {
    console.log('Cache miss: Fetching simple clubs from database');
    return await prisma.club.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        location: true,
        region: true,
      },
    });
  },
  ['simple-clubs'], // Cache key
  { 
    revalidate: 3600, // 1 hour
    tags: ['clubs']   // Tag for cache invalidation
  }
);

async function getClubsHandler() {
  try {
    console.log('Simple clubs API: Checking cache');
    const clubs = await getCachedSimpleClubs();
    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Apply rate limiting to endpoint
export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getClubsHandler);