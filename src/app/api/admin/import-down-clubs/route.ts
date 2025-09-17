import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Down GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Down clubs
    console.log('🗑️  Clearing existing Down clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'DOW'
    `;

    // Official Down GAA clubs from DownGAA.net / Wikipedia
    const downClubs = [
      'Annaclone',
      'An Riocht',
      'Atticall',
      'Ballycran',
      'Ballygalget',
      'Ballyholland Harps',
      'Ballykinlar',
      'Ballymartin',
      'Ballyvarley',
      'Bredagh',
      'Bright',
      'Bryansford',
      'Burren',
      'Castlewellan',
      'Clann na Banna (Banbridge)',
      'Clonduff',
      'Clonduff (Hilltown)',
      'Cumann Pheadair Naofa (Warrenpoint)',
      'Carryduff',
      'Darragh Cross',
      'Downpatrick RGU',
      'Drumaness',
      'Drumgath',
      'Drumclone',
      'Dundrum',
      'Glasdrumman',
      'Kilclief',
      'Kilcoo',
      'Kilkeel',
      'Longstone',
      'Loughinisland',
      'Mayobridge',
      'Mitchel\'s GAC (Newry)',
      'Newry Bosco',
      'Newry Shamrocks',
      'Rostrevor',
      'Saul',
      'Saval',
      'St John\'s Drumnaquoile',
      'St Michael\'s Magheralin',
      'Teconnaught',
      'Tullylish',
      'Wolfe Tones (Newry)'
    ];

    const results = [];

    for (const clubName of downClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Down, Ireland', 'DOW', 'DOWN_GAA_MULTI',
            'APPROVED', NOW(), NOW()
          )
        `;
        
        results.push({ success: true, club: clubName });
        console.log(`✅ Imported: ${clubName}`);
      } catch (error) {
        results.push({ 
          success: false, 
          club: clubName, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${clubName}:`, error);
      }
    }

    // Count total Down clubs
    const downClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'DOW'
    ` as any[];

    const totalDownClubs = downClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Down GAA clubs imported successfully',
      source: 'DownGAA.net / Wikipedia',
      totalImported: downClubs.length,
      totalDownClubs: parseInt(totalDownClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Down clubs:', error);
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