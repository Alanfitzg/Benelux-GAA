import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getRegionsHandlerSQL(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('countryId');

    if (!countryId) {
      return NextResponse.json({ error: 'countryId is required' }, { status: 400 });
    }

    const regions = await prisma.$queryRaw`
      SELECT id, code, name, "countryId", "displayOrder"
      FROM "Region"
      WHERE "countryId" = ${countryId}
      ORDER BY "displayOrder" ASC
    `;

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions via SQL:', error);
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getRegionsHandlerSQL);