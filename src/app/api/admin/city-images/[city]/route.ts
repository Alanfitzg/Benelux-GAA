import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { withErrorHandling } from '@/lib/utils';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function deleteCityImageHandler(
  request: NextRequest,
  context: { params: Promise<{ city: string }> }
) {
  const { city: encodedCity } = await context.params;
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return withErrorHandling(async () => {
    const city = decodeURIComponent(encodedCity).toLowerCase();
    
    const deleted = await prisma.cityDefaultImage.delete({
      where: { city }
    });
    
    return { success: true, deleted };
  });
}

export const DELETE = withRateLimit(RATE_LIMITS.ADMIN, deleteCityImageHandler);