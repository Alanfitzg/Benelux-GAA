import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🗑️ Removing Mexico from New York structure...');

    // Get the Mexico country under New York
    const mexicoCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'MX' AND name = 'Mexico'
    ` as any[];

    if (!mexicoCountry.length) {
      return NextResponse.json({ message: 'Mexico country not found' });
    }

    const mexicoCountryId = mexicoCountry[0].id;

    // Get all clubs in Mexico (should just be Mexico City GAA)
    const mexicoClubs = await prisma.$queryRaw`
      SELECT id, name FROM "Club" WHERE "countryId" = ${mexicoCountryId}
    ` as any[];

    // Delete all clubs in Mexico
    console.log('🗑️ Deleting Mexico clubs...');
    for (const club of mexicoClubs) {
      await prisma.$executeRaw`
        DELETE FROM "Club" WHERE id = ${club.id}
      `;
      console.log(`✅ Deleted club: ${club.name}`);
    }

    // Delete the Mexico country
    console.log('🗑️ Deleting Mexico country...');
    await prisma.$executeRaw`
      DELETE FROM "Country" WHERE id = ${mexicoCountryId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Mexico successfully removed from New York structure',
      deletedClubs: mexicoClubs.map(club => club.name),
      deletedClubCount: mexicoClubs.length,
      note: 'Mexico and all its clubs have been removed from the system'
    });

  } catch (error) {
    console.error('❌ Error removing Mexico from New York:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}