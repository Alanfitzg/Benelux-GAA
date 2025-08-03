#!/usr/bin/env node

/**
 * Script to approve clubs that were seeded from old data
 * Run this after database is reset and clubs are imported
 * 
 * Usage: node scripts/approve-seeded-clubs.js
 */

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking club statuses...');
    
    // Get current status counts
    const pendingCount = await prisma.club.count({
      where: { status: 'PENDING' }
    });
    
    const approvedCount = await prisma.club.count({
      where: { status: 'APPROVED' }
    });
    
    console.log(`📊 Current status:`);
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Approved: ${approvedCount}`);
    
    if (pendingCount === 0) {
      console.log('✅ No pending clubs to approve');
      return;
    }
    
    // Ask for confirmation in production
    if (process.env.NODE_ENV === 'production') {
      console.log(`\n⚠️  WARNING: This will approve ${pendingCount} clubs in PRODUCTION`);
      console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    console.log(`\n🚀 Approving ${pendingCount} pending clubs...`);
    
    const result = await prisma.club.updateMany({
      where: {
        status: 'PENDING',
        // Only approve clubs that have essential information
        name: { not: null },
        location: { not: null }
      },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });
    
    console.log(`✅ Approved ${result.count} clubs`);
    
    // Verify the changes
    const newApprovedCount = await prisma.club.count({
      where: { status: 'APPROVED' }
    });
    
    const stillPending = await prisma.club.count({
      where: { status: 'PENDING' }
    });
    
    console.log(`\n📊 Final status:`);
    console.log(`   - Approved: ${newApprovedCount} (${newApprovedCount - approvedCount} new)`);
    console.log(`   - Still Pending: ${stillPending}`);
    
    if (stillPending > 0) {
      console.log(`\n⚠️  ${stillPending} clubs remain pending (missing required fields)`);
      const incomplete = await prisma.club.findMany({
        where: { status: 'PENDING' },
        select: { id: true, name: true, location: true }
      });
      
      console.log('Incomplete clubs:');
      incomplete.forEach(club => {
        console.log(`   - ${club.id}: ${club.name || '[no name]'} - ${club.location || '[no location]'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});