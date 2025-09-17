import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getIrishClubsHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countyCode = searchParams.get('countyCode');

    if (!countyCode) {
      return NextResponse.json({ error: 'countyCode is required' }, { status: 400 });
    }

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Get clubs for the specific county (stored in codes field)
    const clubs = await prisma.$queryRaw`
      SELECT id, name, location, "sportsSupported", "verificationStatus", "dataSource", codes as county
      FROM "Club"
      WHERE "countryId" = ${irelandCountryId}
        AND codes = ${countyCode}
        AND status = 'APPROVED'
      ORDER BY name ASC
      LIMIT 100
    `;

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching Irish clubs by county:', error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getIrishClubsHandler);