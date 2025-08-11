/**
 * Script to seed staging database with sanitized production data
 * Usage: npx ts-node scripts/seed-staging-from-prod.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Production database connection
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL || 'postgresql://postgres.tzaxytgncrbdjhgaadzk:goGateNew1%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres'
    }
  }
});

// Staging database connection
const stagingPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.STAGING_DATABASE_URL || 'postgresql://postgres.hmwhilgcfmlkwwzmfuma:goGateNew1%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres'
    }
  }
});

async function seedStaging() {
  console.log('🌱 Starting staging seed from production...');

  try {
    // 1. Seed Clubs
    console.log('📍 Copying clubs...');
    const clubs = await prodPrisma.club.findMany({
      take: 20, // Limit for staging
      orderBy: { name: 'asc' }, // Use name instead of createdAt
      select: {
        id: true,
        name: true,
        location: true, // Use location instead of city/country
        region: true,
        subRegion: true,
        latitude: true,
        longitude: true,
        contactEmail: true,
        contactPhone: true,
        contactFirstName: true,
        contactLastName: true,
        website: true,
        imageUrl: true,
        teamTypes: true,
        isContactWilling: true
      }
    });

    for (const club of clubs) {
      await stagingPrisma.club.upsert({
        where: { id: club.id },
        update: club,
        create: {
          ...club,
          // Sanitize contact info for staging
          contactEmail: club.contactEmail ? `staging+${club.id}@example.com` : null,
          contactPhone: club.contactPhone ? '+1-555-0123' : null,
        }
      });
    }
    console.log(`✅ Copied ${clubs.length} clubs`);

    // 2. Seed Users (sanitized)
    console.log('👥 Copying users...');
    const users = await prodPrisma.user.findMany({
      take: 50, // Limit for staging
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        accountStatus: true,
        clubId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    for (const user of users) {
      await stagingPrisma.user.upsert({
        where: { username: `staging_${user.id.slice(-8)}` },
        update: {
          ...user,
          // Sanitize user data for staging
          email: `staging+${user.id}@example.com`,
          username: `staging_${user.id.slice(-8)}`,
          name: user.name ? `Test User ${user.id.slice(-4)}` : null,
          password: await bcrypt.hash('password123', 10), // Default password for staging
        },
        create: {
          ...user,
          // Sanitize user data for staging
          email: `staging+${user.id}@example.com`,
          username: `staging_${user.id.slice(-8)}`,
          name: user.name ? `Test User ${user.id.slice(-4)}` : null,
          password: await bcrypt.hash('password123', 10), // Default password for staging
        }
      });
    }
    console.log(`✅ Copied ${users.length} users (sanitized)`);

    // 3. Seed Events (keep existing ones and add some from prod)
    console.log('🎯 Copying events...');
    const events = await prodPrisma.event.findMany({
      take: 30, // Limit for staging
      orderBy: { startDate: 'desc' },
      where: {
        startDate: {
          gte: new Date('2024-01-01') // Only recent events
        }
      }
    });

    for (const event of events) {
      const { id, bracketData, ...restEventData } = event;
      const eventDataToUpsert = {
        ...restEventData,
        bracketData: bracketData ?? undefined
      };
      
      await stagingPrisma.event.upsert({
        where: { id },
        update: eventDataToUpsert,
        create: { id, ...eventDataToUpsert }
      });
    }
    console.log(`✅ Copied ${events.length} events`);

    // 4. Seed some Interests
    console.log('💡 Copying interests...');
    const interests = await prodPrisma.interest.findMany({
      take: 20, // Sample interests
      orderBy: { submittedAt: 'desc' },
      where: {
        eventId: {
          in: events.map(e => e.id) // Only for events we copied
        }
      }
    });

    for (const interest of interests) {
      await stagingPrisma.interest.upsert({
        where: { id: interest.id },
        update: interest,
        create: interest
      });
    }
    console.log(`✅ Copied ${interests.length} interests`);

    // 5. Seed Hosting Packages
    console.log('🏠 Copying hosting packages...');
    const packages = await prodPrisma.hostingPackage.findMany({
      take: 15, // Sample packages
      where: {
        clubId: {
          in: clubs.map(c => c.id) // Only for clubs we copied
        }
      }
    });

    for (const pkg of packages) {
      await stagingPrisma.hostingPackage.upsert({
        where: { id: pkg.id },
        update: pkg,
        create: pkg
      });
    }
    console.log(`✅ Copied ${packages.length} hosting packages`);

    // 6. Create test admin user for staging
    console.log('👑 Creating test admin user...');
    const testAdmin = await stagingPrisma.user.upsert({
      where: { username: 'staging_admin' },
      update: {
        username: 'staging_admin',
        name: 'Staging Admin',
        role: 'SUPER_ADMIN',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('admin123', 10),
      },
      create: {
        email: 'admin@staging.com',
        username: 'staging_admin',
        name: 'Staging Admin',
        role: 'SUPER_ADMIN',
        accountStatus: 'APPROVED',
        password: await bcrypt.hash('admin123', 10),
      }
    });
    console.log(`✅ Created test admin: ${testAdmin.email}`);

    console.log('🎉 Staging seed completed successfully!');
    console.log(`
📊 Staging Database Summary:
- ${clubs.length} clubs
- ${users.length + 1} users (+ 1 test admin)
- ${events.length} events
- ${interests.length} interests
- ${packages.length} hosting packages

🔐 Test Admin Login:
- Email: admin@staging.com
- Password: admin123

🧪 Test User Login:
- Any user email from staging database
- Password: password123
    `);

  } catch (error) {
    console.error('❌ Error seeding staging:', error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
    await stagingPrisma.$disconnect();
  }
}

// Run the seeding
seedStaging().catch((error) => {
  console.error('Failed to seed staging:', error);
  process.exit(1);
});