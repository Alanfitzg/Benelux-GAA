/**
 * Simple script to seed staging database with production data
 * Usage: npx ts-node --project scripts/tsconfig.json scripts/simple-seed-staging.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedStaging() {
  console.log('🌱 Seeding staging with production data...');

  try {
    // Create test admin user
    console.log('👑 Creating test admin user...');
    const testAdmin = await prisma.user.upsert({
      where: { email: 'admin@staging.com' },
      update: {
        name: 'Staging Admin',
        role: 'SUPER_ADMIN',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('admin123', 10),
      },
      create: {
        email: 'admin@staging.com',
        username: 'staging-admin',
        name: 'Staging Admin',
        role: 'SUPER_ADMIN',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('admin123', 10),
      }
    });
    console.log(`✅ Created test admin: ${testAdmin.email}`);

    // Create test regular user
    console.log('👤 Creating test regular user...');
    const testUser = await prisma.user.upsert({
      where: { email: 'user@staging.com' },
      update: {
        name: 'Test User',
        role: 'USER',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('user123', 10),
      },
      create: {
        email: 'user@staging.com',
        username: 'test-user',
        name: 'Test User',
        role: 'USER',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('user123', 10),
      }
    });
    console.log(`✅ Created test user: ${testUser.email}`);

    // Create test pending user (for approval email testing)
    console.log('⏳ Creating test pending user...');
    const pendingUser = await prisma.user.upsert({
      where: { email: 'pending@staging.com' },
      update: {
        name: 'Pending User',
        role: 'USER',
        accountStatus: 'PENDING',
        password: await bcrypt.hash('pending123', 10),
      },
      create: {
        email: 'pending@staging.com',
        username: 'pending-user',
        name: 'Pending User',
        role: 'USER',
        accountStatus: 'PENDING',
        password: await bcrypt.hash('pending123', 10),
      }
    });
    console.log(`✅ Created pending user: ${pendingUser.email}`);

    // Create some test clubs
    console.log('🏛️ Creating test clubs...');
    const testClubs = [
      {
        id: 'club-1',
        name: 'Dublin GAA Club',
        region: 'Leinster',
        subRegion: 'Dublin',
        location: 'Dublin, Ireland',
        latitude: 53.3498,
        longitude: -6.2603,
        contactFirstName: 'John',
        contactLastName: 'O\'Brien',
        contactEmail: 'contact@dublingaa.com',
        contactPhone: '+353-1-234-5678',
        teamTypes: ['Mens Gaelic Football', 'Ladies Gaelic Football'],
        isContactWilling: true,
      },
      {
        id: 'club-2',
        name: 'Berlin GAA Club',
        region: 'Europe',
        subRegion: 'Germany',
        location: 'Berlin, Germany',
        latitude: 52.5200,
        longitude: 13.4050,
        contactFirstName: 'Sarah',
        contactLastName: 'Murphy',
        contactEmail: 'info@berlingaa.de',
        contactPhone: '+49-30-123-4567',
        teamTypes: ['Mens Gaelic Football', 'Hurling'],
        isContactWilling: true,
      }
    ];

    for (const club of testClubs) {
      await prisma.club.upsert({
        where: { id: club.id },
        update: club,
        create: club,
      });
    }
    console.log(`✅ Created ${testClubs.length} test clubs`);

    // Create club admin user
    console.log('👨‍💼 Creating club admin user...');
    const clubAdmin = await prisma.user.upsert({
      where: { email: 'clubadmin@staging.com' },
      update: {
        name: 'Club Admin',
        role: 'CLUB_ADMIN',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('clubadmin123', 10),
        clubId: 'club-1',
      },
      create: {
        email: 'clubadmin@staging.com',
        username: 'club-admin',
        name: 'Club Admin',
        role: 'CLUB_ADMIN',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('clubadmin123', 10),
        clubId: 'club-1',
      }
    });
    console.log(`✅ Created club admin: ${clubAdmin.email}`);

    console.log('🎉 Staging seed completed successfully!');
    console.log(`
📊 Staging Database Summary:
- ${testClubs.length} clubs
- 4 users (1 super admin, 1 club admin, 1 regular user, 1 pending user)
- Events from basic seed script

🔐 Test Login Credentials:
- Super Admin: admin@staging.com / admin123
- Club Admin: clubadmin@staging.com / clubadmin123
- Regular User: user@staging.com / user123
- Pending User: pending@staging.com / pending123

🧪 Email Testing:
- Use pending@staging.com for approval email testing
- Register new users to test admin notification emails
    `);

  } catch (error) {
    console.error('❌ Error seeding staging:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedStaging().catch((error) => {
  console.error('Failed to seed staging:', error);
  process.exit(1);
});