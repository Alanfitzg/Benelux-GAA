#!/usr/bin/env node

/**
 * Database seeding script for GAA Trips
 * Use this to seed the database with initial data after a reset
 * 
 * Usage: node scripts/seed-database.js [--auto-approve]
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const autoApprove = args.includes('--auto-approve');

async function seedClubs() {
  console.log('🌱 Seeding clubs...');
  
  try {
    // Check if seed data file exists
    const seedDataPath = path.join(__dirname, '../data/clubs-seed.json');
    let clubsData = [];
    
    try {
      const data = await fs.readFile(seedDataPath, 'utf8');
      clubsData = JSON.parse(data);
      console.log(`📁 Found seed data with ${clubsData.length} clubs`);
    } catch (error) {
      console.log('⚠️  No seed data file found at', seedDataPath);
      console.log('   Skipping club seeding');
      return;
    }
    
    // Import clubs
    let created = 0;
    let skipped = 0;
    
    for (const club of clubsData) {
      try {
        // Check if club already exists
        const existing = await prisma.club.findFirst({
          where: {
            OR: [
              { name: club.name },
              { 
                AND: [
                  { name: club.name },
                  { location: club.location }
                ]
              }
            ]
          }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Create club with proper status
        await prisma.club.create({
          data: {
            name: club.name,
            location: club.location,
            region: club.region || null,
            subRegion: club.subRegion || null,
            map: club.map || null,
            facebook: club.facebook || null,
            instagram: club.instagram || null,
            website: club.website || null,
            codes: club.codes || null,
            imageUrl: club.imageUrl || null,
            teamTypes: club.teamTypes || [],
            contactFirstName: club.contactFirstName || null,
            contactLastName: club.contactLastName || null,
            contactEmail: club.contactEmail || null,
            contactPhone: club.contactPhone || null,
            contactCountryCode: club.contactCountryCode || null,
            isContactWilling: club.isContactWilling || false,
            // Set status based on auto-approve flag
            status: autoApprove ? 'APPROVED' : 'PENDING',
            approvedAt: autoApprove ? new Date() : null,
            // For seeded data, use system as submitter
            submittedBy: 'system-seed'
          }
        });
        
        created++;
      } catch (error) {
        console.error(`❌ Failed to create club "${club.name}":`, error.message);
      }
    }
    
    console.log(`✅ Created ${created} clubs`);
    if (skipped > 0) {
      console.log(`⏭️  Skipped ${skipped} existing clubs`);
    }
    
    if (autoApprove) {
      console.log('✅ All clubs auto-approved (--auto-approve flag used)');
    } else {
      console.log('ℹ️  Clubs created in PENDING status (use --auto-approve to approve automatically)');
    }
    
  } catch (error) {
    console.error('❌ Error seeding clubs:', error);
    throw error;
  }
}

async function seedCityDefaultImages() {
  console.log('\n🏙️  Seeding city default images...');
  
  const cityImages = [
    { city: 'Barcelona', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
    { city: 'Madrid', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800' },
    { city: 'Paris', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
    { city: 'Berlin', imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800' },
    { city: 'Amsterdam', imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800' },
    { city: 'Dublin', imageUrl: 'https://images.unsplash.com/photo-1565788020504-64b6e3e67924?w=800' },
    { city: 'London', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
    { city: 'Munich', imageUrl: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800' },
    { city: 'Vienna', imageUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800' },
    { city: 'Brussels', imageUrl: 'https://images.unsplash.com/photo-1495250574948-a4e47fed7aa1?w=800' }
  ];
  
  let created = 0;
  
  for (const image of cityImages) {
    try {
      await prisma.cityDefaultImage.upsert({
        where: { city: image.city },
        update: { imageUrl: image.imageUrl },
        create: image
      });
      created++;
    } catch (error) {
      console.error(`❌ Failed to create image for ${image.city}:`, error.message);
    }
  }
  
  console.log(`✅ Created/updated ${created} city default images`);
}

async function createDefaultAdmin() {
  console.log('\n👤 Creating default admin user...');
  
  try {
    const adminEmail = 'admin@gaatrips.com';
    
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existing) {
      console.log('ℹ️  Default admin already exists');
      return;
    }
    
    // Create admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'SUPER_ADMIN',
        approved: true,
        onboardingCompleted: true
      }
    });
    
    console.log('✅ Created default admin user');
    console.log('   Email: admin@gaatrips.com');
    console.log('   Password: Admin123!');
    console.log('   ⚠️  IMPORTANT: Change this password immediately!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

async function main() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    // Seed clubs
    await seedClubs();
    
    // Seed city default images
    await seedCityDefaultImages();
    
    // Create default admin
    await createDefaultAdmin();
    
    // Show final statistics
    console.log('\n📊 Database statistics:');
    const stats = {
      clubs: await prisma.club.count(),
      approvedClubs: await prisma.club.count({ where: { status: 'APPROVED' } }),
      pendingClubs: await prisma.club.count({ where: { status: 'PENDING' } }),
      users: await prisma.user.count(),
      cityImages: await prisma.cityDefaultImage.count()
    };
    
    console.log(`   - Total clubs: ${stats.clubs}`);
    console.log(`     - Approved: ${stats.approvedClubs}`);
    console.log(`     - Pending: ${stats.pendingClubs}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - City images: ${stats.cityImages}`);
    
    console.log('\n✅ Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
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