import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/utils';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getCityImageHandler(
  request: NextRequest,
  context: { params: Promise<{ city: string }> }
) {
  const { city: encodedCity } = await context.params;
  return withErrorHandling(async () => {
    const city = decodeURIComponent(encodedCity).toLowerCase();
    
    const cityImage = await prisma.cityDefaultImage.findUnique({
      where: { city }
    });
    
    if (!cityImage) {
      return NextResponse.json({ imageUrl: null }, { status: 200 });
    }
    
    return NextResponse.json({ imageUrl: cityImage.imageUrl }, { status: 200 });
  });
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getCityImageHandler);