import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeClubInflation() {
  try {
    console.log('🔍 COMPREHENSIVE CLUB ANALYSIS');
    console.log('================================\n');
    
    // Get total counts by status
    console.log('📊 CLUB COUNT BY STATUS:');
    const statusCounts = await prisma.club.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    statusCounts.forEach(status => {
      console.log(`${status.status}: ${status._count.id}`);
    });
    
    const totalClubs = await prisma.club.count();
    const approvedClubs = await prisma.club.count({ where: { status: 'APPROVED' } });
    
    console.log(`\nTotal clubs in database: ${totalClubs}`);
    console.log(`Approved clubs: ${approvedClubs}`);
    console.log(`Expected maximum: 2800`);
    console.log(`Excess clubs: ${approvedClubs - 2800}`);

    // Analyze by data source
    console.log('\n📥 CLUBS BY DATA SOURCE:');
    const sourceCounts = await prisma.club.groupBy({
      by: ['dataSource'],
      where: { status: 'APPROVED' },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    sourceCounts.forEach(source => {
      console.log(`${source.dataSource || 'unknown'}: ${source._count.id}`);
    });

    // Analyze by international unit
    console.log('\n🌍 CLUBS BY INTERNATIONAL UNIT:');
    const unitCounts = await prisma.club.groupBy({
      by: ['internationalUnitId'],
      where: { status: 'APPROVED' },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    // Get unit names
    for (const unit of unitCounts) {
      if (unit.internationalUnitId) {
        const unitData = await prisma.internationalUnit.findUnique({
          where: { id: unit.internationalUnitId }
        });
        console.log(`${unitData?.name || 'Unknown'} (${unitData?.code}): ${unit._count.id}`);
      } else {
        console.log(`No International Unit: ${unit._count.id}`);
      }
    }

    // Analyze by creation date
    console.log('\n📅 CLUBS BY CREATION DATE:');
    const dateCounts = await prisma.$queryRaw<Array<{date: string, count: bigint}>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Club" 
      WHERE status = 'APPROVED'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 10
    `;
    
    dateCounts.forEach(dateCount => {
      console.log(`${dateCount.date}: ${Number(dateCount.count)} clubs`);
    });

    // Look for potential same-name clubs in different locations (legitimate)
    console.log('\n🏘️  CLUBS WITH SAME NAME IN DIFFERENT LOCATIONS:');
    const nameGroups = await prisma.$queryRaw<Array<{name: string, count: bigint}>>`
      SELECT name, COUNT(*) as count
      FROM "Club" 
      WHERE status = 'APPROVED'
      GROUP BY name
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 20
    `;
    
    console.log('(These are legitimate if they are in different locations)');
    for (const nameGroup of nameGroups) {
      const clubs = await prisma.club.findMany({
        where: { 
          name: nameGroup.name,
          status: 'APPROVED' 
        },
        select: {
          name: true,
          location: true,
          dataSource: true
        }
      });
      
      console.log(`\n"${nameGroup.name}" (${Number(nameGroup.count)} clubs):`);
      clubs.forEach(club => {
        console.log(`  - ${club.location} (${club.dataSource || 'unknown'})`);
      });
    }

    // Check for potential location parsing issues
    console.log('\n🗺️  LOCATION ANALYSIS:');
    const locationIssues = await prisma.club.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { location: null },
          { location: '' },
          { location: { not: { contains: ',' } } }
        ]
      },
      select: {
        name: true,
        location: true,
        dataSource: true
      },
      take: 20
    });

    if (locationIssues.length > 0) {
      console.log('Clubs with potential location issues:');
      locationIssues.forEach(club => {
        console.log(`- ${club.name}: "${club.location}" (${club.dataSource || 'unknown'})`);
      });
    } else {
      console.log('✅ All clubs have properly formatted locations');
    }

    // Check for clubs that might be test data or invalid
    console.log('\n🧪 POTENTIAL TEST/INVALID DATA:');
    const suspiciousClubs = await prisma.club.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { name: { contains: 'sample', mode: 'insensitive' } },
          { name: { contains: 'example', mode: 'insensitive' } },
          { name: { contains: 'demo', mode: 'insensitive' } },
          { name: { regex: '^[a-zA-Z]{1,3}$' } }, // Very short names
        ]
      },
      select: {
        name: true,
        location: true,
        dataSource: true,
        createdAt: true
      }
    });

    if (suspiciousClubs.length > 0) {
      console.log('Potentially invalid clubs found:');
      suspiciousClubs.forEach(club => {
        console.log(`- ${club.name} (${club.location}) - Created: ${club.createdAt.toISOString().split('T')[0]} - Source: ${club.dataSource || 'unknown'}`);
      });
    } else {
      console.log('✅ No obviously suspicious clubs found');
    }

    // Final recommendation
    console.log('\n💡 RECOMMENDATIONS:');
    console.log(`Current approved clubs: ${approvedClubs}`);
    console.log(`Target maximum: 2800`);
    console.log(`Excess: ${approvedClubs - 2800}`);
    
    if (approvedClubs > 2800) {
      console.log('\nPossible reasons for excess:');
      console.log('1. Database has legitimately grown beyond 2800 clubs');
      console.log('2. Multiple CSV imports created valid duplicates in different regions');
      console.log('3. Data import included county/regional teams that should be filtered');
      console.log('4. Test data or invalid entries that need removal');
      console.log('\nReview the analysis above to determine the best approach.');
    }

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeClubInflation();