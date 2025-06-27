import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireClubAdmin } from '@/lib/auth-helpers';
import { geocodeLocation } from '@/lib/utils/geocoding';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    return NextResponse.json(club);
  } catch {
    return NextResponse.json({ error: 'Error fetching club' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { id } = await context.params;
  try {
    const data = await req.json();
    
    // Geocode location if it has changed
    let geocodeData: { latitude?: number | null; longitude?: number | null } = {};
    if (data.location) {
      const currentClub = await prisma.club.findUnique({
        where: { id },
        select: { location: true }
      });
      
      if (currentClub && currentClub.location !== data.location) {
        const coords = await geocodeLocation(data.location);
        geocodeData = {
          latitude: coords.latitude,
          longitude: coords.longitude
        };
      }
    }
    
    const club = await prisma.club.update({
      where: { id },
      data: {
        name: data.name,
        map: data.map,
        location: data.location,
        region: data.region,
        subRegion: data.subRegion,
        facebook: data.facebook,
        instagram: data.instagram,
        website: data.website,
        codes: data.codes,
        imageUrl: data.imageUrl,
        teamTypes: data.teamTypes || [],
        ...geocodeData
      },
    });
    return NextResponse.json(club);
  } catch {
    return NextResponse.json({ error: 'Error updating club' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { id } = await context.params;
  try {
    await prisma.club.delete({ where: { id } });
    return NextResponse.json({ message: 'Club deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Error deleting club' }, { status: 400 });
  }
} 