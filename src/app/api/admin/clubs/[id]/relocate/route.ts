import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { revalidateTag } from 'next/cache';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const data = await req.json();
    const { internationalUnitId, countryId, regionId } = data;

    // Validate that the club exists
    const existingClub = await prisma.club.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        internationalUnitId: true,
        countryId: true,
        regionId: true
      }
    });

    if (!existingClub) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Validate the new location hierarchy
    if (internationalUnitId) {
      const internationalUnit = await prisma.internationalUnit.findUnique({
        where: { id: internationalUnitId }
      });
      if (!internationalUnit) {
        return NextResponse.json({ error: 'Invalid international unit' }, { status: 400 });
      }
    }

    if (countryId) {
      const country = await prisma.country.findUnique({
        where: { id: countryId },
        include: { internationalUnit: true }
      });
      if (!country) {
        return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
      }
      // Ensure country belongs to the specified international unit
      if (internationalUnitId && country.internationalUnitId !== internationalUnitId) {
        return NextResponse.json({ error: 'Country does not belong to the specified international unit' }, { status: 400 });
      }
    }

    if (regionId) {
      const region = await prisma.region.findUnique({
        where: { id: regionId },
        include: { country: true }
      });
      if (!region) {
        return NextResponse.json({ error: 'Invalid region' }, { status: 400 });
      }
      // Ensure region belongs to the specified country
      if (countryId && region.countryId !== countryId) {
        return NextResponse.json({ error: 'Region does not belong to the specified country' }, { status: 400 });
      }
    }

    // Update the club's location
    const updatedClub = await prisma.club.update({
      where: { id },
      data: {
        internationalUnitId: internationalUnitId || null,
        countryId: countryId || null,
        regionId: regionId || null,
        updatedAt: new Date()
      },
      include: {
        internationalUnit: {
          select: { name: true }
        },
        country: {
          select: { name: true }
        },
        regionRecord: {
          select: { name: true }
        }
      }
    });

    // Log the relocation for audit purposes
    console.log(`Club "${existingClub.name}" relocated by ${session.user.email} from:`, {
      oldInternationalUnit: existingClub.internationalUnitId,
      oldCountry: existingClub.countryId,
      oldRegion: existingClub.regionId
    }, 'to:', {
      newInternationalUnit: internationalUnitId,
      newCountry: countryId,
      newRegion: regionId
    });

    // Invalidate club caches
    revalidateTag('clubs');
    revalidateTag('filters');

    return NextResponse.json({
      message: 'Club relocated successfully',
      club: updatedClub
    });

  } catch (error) {
    console.error('Error relocating club:', error);
    return NextResponse.json({ error: 'Failed to relocate club' }, { status: 500 });
  }
}