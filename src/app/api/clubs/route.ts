import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClubAdmin } from '@/lib/auth-helpers';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function createClubHandler(req: NextRequest) {
  try {
    const authResult = await requireClubAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const club = await prisma.club.create({
      data: {
        name: data.name,
        region: data.region || null,
        subRegion: data.subRegion || null,
        map: data.map || null,
        location: data.location || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        website: data.website || null,
        codes: data.codes || null,
        imageUrl: data.imageUrl || null,
        teamTypes: data.teamTypes || [],
        contactFirstName: data.contactFirstName || null,
        contactLastName: data.contactLastName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        contactCountryCode: data.contactCountryCode || null,
        isContactWilling: data.isContactWilling || false,
      },
    });
    return NextResponse.json({ club }, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function getClubsHandler() {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        region: true,
        subRegion: true,
        map: true,
        location: true,
        latitude: true,
        longitude: true,
        facebook: true,
        instagram: true,
        website: true,
        codes: true,
        teamTypes: true,
        contactFirstName: true,
        contactLastName: true,
        contactEmail: true,
        contactPhone: true,
        contactCountryCode: true,
        isContactWilling: true,
      },
    });
    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Apply rate limiting to endpoints
export const POST = withRateLimit(RATE_LIMITS.ADMIN, createClubHandler);
export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getClubsHandler); 