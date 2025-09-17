import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getRegionsHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('countryId');

    if (!countryId) {
      return NextResponse.json({ error: 'countryId is required' }, { status: 400 });
    }

    const regions = await prisma.region.findMany({
      where: { countryId },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        countryId: true,
        displayOrder: true,
      },
    });

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getRegionsHandler);