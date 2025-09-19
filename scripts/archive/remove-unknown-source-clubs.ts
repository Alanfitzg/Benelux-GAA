import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeUnknownSourceClubs() {
  try {
    console.log('🔍 REMOVING UNKNOWN SOURCE CLUBS (DUPLICATES)');
    console.log('================================================\n');
    
    // First, get count of clubs with unknown data source
    const unknownSourceClubs = await prisma.club.findMany({
      where: {
        status: 'APPROVED',
        dataSource: null // This is how "unknown" appears in the database
      },
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${unknownSourceClubs.length} clubs with unknown data source`);
    
    if (unknownSourceClubs.length === 0) {
      console.log('✅ No unknown source clubs to remove!');
      return;
    }

    // Show some examples before deletion
    console.log('\n📋 EXAMPLES OF CLUBS TO BE REMOVED:');
    console.log('(First 10 clubs with unknown data source)');
    unknownSourceClubs.slice(0, 10).forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} (${club.location}) - Created: ${club.createdAt.toISOString().split('T')[0]}`);
    });

    // Get current total for comparison
    const currentTotal = await prisma.club.count({
      where: { status: 'APPROVED' }
    });
    
    console.log(`\n📊 BEFORE REMOVAL:`);
    console.log(`Total approved clubs: ${currentTotal}`);
    console.log(`Clubs with unknown source: ${unknownSourceClubs.length}`);
    console.log(`Expected after removal: ${currentTotal - unknownSourceClubs.length}`);

    // Delete all related records first to avoid foreign key constraint violations
    console.log('\n🗑️  DELETING RELATED RECORDS...');
    const clubIds = unknownSourceClubs.map(club => club.id);
    
    // Process in smaller batches to avoid query size limits
    const batchSize = 500;
    const batches = [];
    for (let i = 0; i < clubIds.length; i += batchSize) {
      batches.push(clubIds.slice(i, i + batchSize));
    }
    
    console.log(`Processing ${clubIds.length} clubs in ${batches.length} batches of ${batchSize}...`);
    
    let totalDeleted = {
      adminRequests: 0,
      clubInterests: 0,
      tournamentTeams: 0,
      testimonials: 0,
      tournamentInterests: 0,
      hostingPackages: 0,
      eventsUpdated: 0,
      usersUpdated: 0,
      pitchLocationsUpdated: 0
    };

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} clubs)...`);
      
      // Delete in order of dependencies
      const deletedAdminRequests = await prisma.clubAdminRequest.deleteMany({
        where: { clubId: { in: batch } }
      });
      totalDeleted.adminRequests += deletedAdminRequests.count;

      const deletedClubInterests = await prisma.clubInterest.deleteMany({
        where: { clubId: { in: batch } }
      });
      totalDeleted.clubInterests += deletedClubInterests.count;

      const deletedTournamentTeams = await prisma.tournamentTeam.deleteMany({
        where: { clubId: { in: batch } }
      });
      totalDeleted.tournamentTeams += deletedTournamentTeams.count;

      const deletedTestimonials = await prisma.testimonial.deleteMany({
        where: { clubId: { in: batch } }
      });
      totalDeleted.testimonials += deletedTestimonials.count;

      const deletedTournamentInterests = await prisma.tournamentInterest.deleteMany({
        where: { clubId: { in: batch } }
      });
      totalDeleted.tournamentInterests += deletedTournamentInterests.count;

      const deletedHostingPackages = await prisma.hostingPackage.deleteMany({
        where: { clubId: { in: batch } }
      });
      totalDeleted.hostingPackages += deletedHostingPackages.count;

      // Update records (set clubId to null instead of deleting)
      const updatedEvents = await prisma.event.updateMany({
        where: { clubId: { in: batch } },
        data: { clubId: null }
      });
      totalDeleted.eventsUpdated += updatedEvents.count;

      const updatedUsers = await prisma.user.updateMany({
        where: { clubId: { in: batch } },
        data: { clubId: null }
      });
      totalDeleted.usersUpdated += updatedUsers.count;

      // Skip pitch locations update for now (seems to be causing issues)
      // We can handle these separately if needed
    }
    
    console.log(`🗑️  Deleted ${totalDeleted.adminRequests} club admin requests`);
    console.log(`🗑️  Deleted ${totalDeleted.clubInterests} club interests`);
    console.log(`🗑️  Deleted ${totalDeleted.tournamentTeams} tournament teams`);
    console.log(`🗑️  Deleted ${totalDeleted.testimonials} testimonials`);
    console.log(`🗑️  Deleted ${totalDeleted.tournamentInterests} tournament interests`);
    console.log(`🗑️  Deleted ${totalDeleted.hostingPackages} hosting packages`);
    console.log(`🔄  Updated ${totalDeleted.eventsUpdated} events (removed club association)`);
    console.log(`🔄  Updated ${totalDeleted.usersUpdated} users (removed club association)`);

    // Now perform the main deletion
    console.log('\n🗑️  PERFORMING CLUB DELETION...');
    const deleteResult = await prisma.club.deleteMany({
      where: {
        status: 'APPROVED',
        dataSource: null
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} clubs with unknown data source`);

    // Verify final count
    const finalTotal = await prisma.club.count({
      where: { status: 'APPROVED' }
    });

    console.log(`\n📊 AFTER REMOVAL:`);
    console.log(`Final approved club count: ${finalTotal}`);
    console.log(`Clubs removed: ${currentTotal - finalTotal}`);
    console.log(`Target was: 2,800 maximum`);
    
    if (finalTotal <= 2800) {
      console.log(`🎯 SUCCESS: Now within target of 2,800 clubs!`);
    } else {
      console.log(`⚠️  Still ${finalTotal - 2800} clubs above target - may need further investigation`);
    }

    // Show breakdown by data source after cleanup
    console.log('\n📥 REMAINING CLUBS BY DATA SOURCE:');
    const remainingSourceCounts = await prisma.club.groupBy({
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
    
    remainingSourceCounts.forEach(source => {
      console.log(`${source.dataSource || 'unknown'}: ${source._count.id}`);
    });

  } catch (error) {
    console.error('❌ Error during unknown source club removal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the removal
removeUnknownSourceClubs();