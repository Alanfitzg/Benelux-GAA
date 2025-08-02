import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { withErrorHandling, parseJsonBody } from '@/lib/utils';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

type CityImageBody = {
  city: string;
  imageUrl: string;
};

async function getCityImagesHandler() {
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return withErrorHandling(async () => {
    const cityImages = await prisma.cityDefaultImage.findMany({
      orderBy: {
        city: 'asc'
      }
    });
    return cityImages;
  });
}

async function createCityImageHandler(request: NextRequest) {
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return withErrorHandling(async () => {
    const body = await parseJsonBody<CityImageBody>(request);
    
    const normalizedCity = body.city.trim().toLowerCase();
    
    const existingImage = await prisma.cityDefaultImage.findUnique({
      where: { city: normalizedCity }
    });
    
    if (existingImage) {
      const updated = await prisma.cityDefaultImage.update({
        where: { city: normalizedCity },
        data: { imageUrl: body.imageUrl }
      });
      return updated;
    }
    
    const cityImage = await prisma.cityDefaultImage.create({
      data: {
        city: normalizedCity,
        imageUrl: body.imageUrl
      }
    });
    
    return cityImage;
  });
}

export const GET = withRateLimit(RATE_LIMITS.ADMIN, getCityImagesHandler);
export const POST = withRateLimit(RATE_LIMITS.ADMIN, createCityImageHandler);