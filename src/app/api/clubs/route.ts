import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClubAdmin } from '@/lib/auth-helpers';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { geocodeLocation } from '@/lib/utils/geocoding';

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
    
    // Geocode location if provided
    let geocodeData: { latitude?: number | null; longitude?: number | null } = {};
    if (data.location) {
      const coords = await geocodeLocation(data.location);
      geocodeData = {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
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
        ...geocodeData
      },
    });
    return NextResponse.json({ club }, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function getClubsHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || '';
    const teamType = searchParams.get('teamType') || '';
    const search = searchParams.get('search') || '';

    // Build filter conditions
    const where: {
      location?: { contains: string; mode: 'insensitive' };
      teamTypes?: { has: string };
      OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { location: { contains: string; mode: 'insensitive' } }>;
    } = {};
    
    if (country && country !== "") {
      where.location = { contains: country, mode: 'insensitive' };
    }
    
    if (teamType && teamType !== "") {
      where.teamTypes = { has: teamType };
    }
    
    if (search && search !== "") {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get filtered clubs with retry logic
    let clubs;
    let retries = 3;
    while (retries > 0) {
      try {
        clubs = await prisma.club.findMany({
          where,
          orderBy: [{ location: "asc" }, { name: "asc" }],
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
      },
    });
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error("Failed to fetch clubs after retries:", error);
          throw error;
        }
        console.warn(`Database connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

    // Get unique countries and team types for filter options
    let allClubs;
    try {
      allClubs = await prisma.club.findMany({
        select: { location: true, teamTypes: true },
      });
    } catch (error) {
      console.error("Failed to fetch club filters:", error);
      // Return clubs without filters if this fails
      return NextResponse.json({
        clubs,
        countries: [],
        teamTypes: []
      });
    }
    
    const countries = Array.from(
      new Set(
        allClubs
          .map((club) => club.location?.split(",").pop()?.trim())
          .filter(Boolean)
      )
    ).sort() as string[];
    
    const teamTypes = Array.from(
      new Set(allClubs.flatMap((club) => club.teamTypes))
    ).sort();

    return NextResponse.json({
      clubs,
      countries,
      teamTypes
    });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Apply rate limiting to endpoints
export const POST = withRateLimit(RATE_LIMITS.ADMIN, createClubHandler);
export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getClubsHandler); 