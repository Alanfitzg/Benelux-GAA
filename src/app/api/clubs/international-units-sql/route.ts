import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getInternationalUnitsHandlerSQL() {
  try {
    console.log('Fetching international units via SQL...');
    
    // Use raw SQL query to get the data
    const units = await prisma.$queryRaw`
      SELECT id, code, name, "displayOrder"
      FROM "InternationalUnit"
      ORDER BY "displayOrder" ASC
    `;

    console.log('International units fetched:', units);

    return NextResponse.json(units);
  } catch (error) {
    console.error('Error fetching international units via SQL:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch international units',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getInternationalUnitsHandlerSQL);