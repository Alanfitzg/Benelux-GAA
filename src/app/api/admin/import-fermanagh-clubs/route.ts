import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Fermanagh GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Fermanagh clubs
    console.log('🗑️  Clearing existing Fermanagh clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'FER'
    `;

    // Official Fermanagh GAA clubs from FermanaghGAA.com / Wikipedia
    const fermanaghClubs = [
      'Aghadrumsee St Macartan\'s',
      'Belcoo O\'Rahilly\'s',
      'Belnaleck Art McMurrough\'s',
      'Brookeborough Heber MacMahons',
      'Coa O\'Dwyers',
      'Devenish St Mary\'s',
      'Derrygonnelly Harps',
      'Derrylin O\'Connells',
      'Donagh',
      'Enniskillen Gaels',
      'Erne Gaels Belleek',
      'Irvinestown St Molaise',
      'Kinawley Brian Borus',
      'Lisnaskea Emmetts',
      'Maguiresbridge St Mary\'s',
      'Newtownbutler First Fermanaghs',
      'Roslea Shamrocks',
      'St Patrick\'s Donagh',
      'St Patrick\'s Lisbellaw',
      'Teemore Shamrocks',
      'Tempo Maguires'
    ];

    const results = [];

    for (const clubName of fermanaghClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Fermanagh, Ireland', 'FER', 'FERMANAGH_GAA_MULTI',
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

    // Count total Fermanagh clubs
    const fermanaghClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'FER'
    ` as any[];

    const totalFermanaghClubs = fermanaghClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Fermanagh GAA clubs imported successfully',
      source: 'FermanaghGAA.com / Wikipedia',
      totalImported: fermanaghClubs.length,
      totalFermanaghClubs: parseInt(totalFermanaghClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Fermanagh clubs:', error);
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