import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getFilteredClubsHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('countryId');
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');

    const where: { status: string; countryId?: string; regionId?: string; name?: { contains: string; mode: 'insensitive' } } = {
      status: 'APPROVED', // Only show approved clubs
    };

    if (countryId) {
      where.countryId = countryId;
    }

    if (regionId) {
      where.regionId = regionId;
    }

    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clubs = await prisma.club.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        location: true,
        sportsSupported: true,
        verificationStatus: true,
        dataSource: true,
        countryId: true,
        regionId: true,
      },
      take: 100, // Limit results for performance
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching filtered clubs:', error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getFilteredClubsHandler);