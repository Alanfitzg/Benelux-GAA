import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Specify Node.js runtime
export const runtime = 'nodejs';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function geocodeLocation(location: string) {
  if (!location) return { latitude: null, longitude: null };
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.features && data.features.length > 0) {
    const [lng, lat] = data.features[0].center;
    return { latitude: lat, longitude: lng };
  }
  return { latitude: null, longitude: null };
}

export async function POST() {
  try {
    // Test database connection first
    await prisma.$connect();
    
    // Get all clubs with locations
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        location: true
      },
      where: {
        location: { not: null }
      }
    });

    console.log(`Found ${clubs.length} clubs to process`);

    // Update each club with coordinates
    const updates = clubs.map(async (club: { id: string; location: string | null; name: string }) => {
      if (!club.location) return null;
      
      const coords = await geocodeLocation(club.location);
      
      if (coords.latitude === null || coords.longitude === null) {
        console.log(`Could not geocode location for club: ${club.name}`);
        return null;
      }

      try {
        return await prisma.club.update({
          where: { id: club.id },
          data: {
            latitude: coords.latitude as number | null,
            longitude: coords.longitude as number | null
          }
        });
      } catch (updateError) {
        console.error(`Error updating club ${club.name}:`, updateError);
        return null;
      }
    });

    const results = await Promise.all(updates.filter(Boolean));
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      message: 'Clubs updated successfully',
      total: clubs.length,
      updated: results.length 
    });
  } catch (error) {
    console.error('Error updating club coordinates:', error);
    
    // Ensure we disconnect from the database
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    return NextResponse.json({ 
      error: 'Failed to update clubs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 