import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Dublin GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Dublin clubs
    console.log('🗑️  Clearing existing Dublin clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'DUB'
    `;

    // Official Dublin GAA clubs from DublinGAA.ie
    const dublinClubs = [
      'Ballinteer St. Johns',
      'Ballyboden St. Endas',
      'Ballyboughal',
      'Ballyfermot Gaels',
      'Ballymun Kickhams',
      'Beann Eadair',
      'Castleknock',
      'Clanna Gael Fontenoy',
      'Clontarf',
      'Craobh Chiaráin',
      'Crumlin',
      'Cuala',
      'Erin Go Bragh',
      'Erins Isle',
      'Faughs',
      'Fingallians',
      'Foxrock Cabinteely',
      'Garristown',
      'Geraldines P. Moran',
      'Good Counsel Liffey Gaels',
      'Innisfails',
      'Kevins',
      'Kilmacud Crokes',
      'Lucan Sarsfields',
      'Man-O-War',
      'Na Fianna',
      'Naomh Barróg',
      'Naomh Fionnbarra',
      'Naomh Mearnóg',
      'Naomh Ólaf',
      'O\'Dwyers',
      'O\'Tooles',
      'Portobello',
      'Raheny',
      'Ranelagh Gaels',
      'Robert Emmets',
      'Round Towers (Clondalkin)',
      'Round Towers (Lusk)',
      'Scoil Ui Chonaill',
      'Setanta',
      'Shankill',
      'Skerries Harps',
      'St Annes',
      'St Brigids',
      'St Finians (Newcastle)',
      'St Finians (Swords)',
      'St James Gaels',
      'St Judes',
      'St Margarets',
      'St Maurs',
      'St Monica\'s',
      'St Oliver Plunketts/Eoghan Ruadh',
      'St Pats (Donabate)',
      'St Pats (Palmerstown)',
      'St Peregrines',
      'St Sylvesters',
      'St Vincents',
      'Stars of Erin',
      'Templeogue Synge St',
      'Thomas Davis',
      'Trinity Gaels',
      'Westmanstown Gaels',
      'Whitehall Colmcille'
    ];

    const results = [];

    for (const clubName of dublinClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Dublin, Ireland', 'DUB', 'DUBLIN_GAA_IE',
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

    // Count total Dublin clubs
    const dublinClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'DUB'
    ` as any[];

    const totalDublinClubs = dublinClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Dublin GAA clubs imported successfully',
      source: 'DublinGAA.ie',
      totalImported: dublinClubs.length,
      totalDublinClubs: parseInt(totalDublinClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Dublin clubs:', error);
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