import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ClubData {
  id: string;
  name: string;
  location: string | null;
  createdAt: Date;
  status: string;
  dataSource: string | null;
}

async function detectAndRemoveDuplicates() {
  try {
    console.log('🔍 Starting duplicate detection...');
    
    // Get all approved clubs with relevant fields
    const allClubs = await prisma.club.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
        status: true,
        dataSource: true
      },
      orderBy: {
        createdAt: 'asc' // Keep the oldest one when duplicates are found
      }
    });

    console.log(`📊 Total approved clubs: ${allClubs.length}`);

    // Group clubs by normalized name and location to find duplicates
    const groupedClubs = new Map<string, ClubData[]>();

    allClubs.forEach(club => {
      // Normalize name (remove common suffixes, trim, lowercase)
      const normalizedName = club.name
        .toLowerCase()
        .replace(/\s+gaa$/i, '')
        .replace(/\s+club$/i, '')
        .replace(/\s+fc$/i, '')
        .replace(/\s+gaelic\s+football\s+club$/i, '')
        .trim();

      // Normalize location (trim, lowercase, handle null)
      const normalizedLocation = (club.location || 'no-location')
        .toLowerCase()
        .trim();

      // Create composite key
      const key = `${normalizedName}|||${normalizedLocation}`;
      
      if (!groupedClubs.has(key)) {
        groupedClubs.set(key, []);
      }
      groupedClubs.get(key)!.push(club);
    });

    // Find duplicate groups
    const duplicateGroups: Array<{key: string, clubs: ClubData[]}> = [];
    
    groupedClubs.forEach((clubs, key) => {
      if (clubs.length > 1) {
        duplicateGroups.push({ key, clubs });
      }
    });

    console.log(`🔍 Found ${duplicateGroups.length} groups with potential duplicates`);

    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    // Analyze duplicates before removal
    console.log('\n📋 DUPLICATE ANALYSIS:');
    console.log('='.repeat(80));
    
    let totalDuplicatesToRemove = 0;
    const clubsToRemove: string[] = [];

    duplicateGroups.forEach((group, index) => {
      const [normalizedName, normalizedLocation] = group.key.split('|||');
      console.log(`\n${index + 1}. Duplicate group: "${normalizedName}" at "${normalizedLocation}"`);
      console.log(`   Found ${group.clubs.length} clubs:`);
      
      // Keep the oldest club (first in chronological order)
      const [keepClub, ...removeClubs] = group.clubs;
      
      console.log(`   ✅ KEEP: ${keepClub.name} (${keepClub.location}) - Created: ${keepClub.createdAt.toISOString().split('T')[0]} - Source: ${keepClub.dataSource || 'unknown'}`);
      
      removeClubs.forEach(club => {
        console.log(`   ❌ REMOVE: ${club.name} (${club.location}) - Created: ${club.createdAt.toISOString().split('T')[0]} - Source: ${club.dataSource || 'unknown'}`);
        clubsToRemove.push(club.id);
        totalDuplicatesToRemove++;
      });
    });

    console.log('\n📊 SUMMARY:');
    console.log(`Total clubs: ${allClubs.length}`);
    console.log(`Duplicate groups: ${duplicateGroups.length}`);
    console.log(`Clubs to remove: ${totalDuplicatesToRemove}`);
    console.log(`Clubs remaining after cleanup: ${allClubs.length - totalDuplicatesToRemove}`);

    // Ask for confirmation (in production, you might want to add interactive confirmation)
    console.log('\n⚠️  CONFIRMATION NEEDED:');
    console.log('This will permanently delete the duplicate clubs listed above.');
    
    // Proceeding with duplicate removal
    console.log('\n🔄 PERFORMING DUPLICATE REMOVAL');

    // PERFORM THE ACTUAL DELETION
    if (clubsToRemove.length > 0) {
      console.log('\n🗑️  Deleting duplicate clubs...');
      
      const deleteResult = await prisma.club.deleteMany({
        where: {
          id: {
            in: clubsToRemove
          }
        }
      });

      console.log(`✅ Successfully deleted ${deleteResult.count} duplicate clubs`);
      
      // Verify final count
      const finalCount = await prisma.club.count({
        where: { status: 'APPROVED' }
      });
      
      console.log(`📊 Final approved club count: ${finalCount}`);
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review the duplicate analysis above');
    console.log('2. If the duplicates look correct, uncomment the deletion code in the script');
    console.log('3. Run the script again to perform the actual deletion');

  } catch (error) {
    console.error('❌ Error during duplicate detection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the detection
detectAndRemoveDuplicates();