import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDatabaseAccess() {
  console.log('Testing database access and permissions...\n');
  
  const tests = [
    {
      name: 'Count Users',
      test: async () => await prisma.user.count()
    },
    {
      name: 'Count Clubs', 
      test: async () => await prisma.club.count()
    },
    {
      name: 'Count Events',
      test: async () => await prisma.event.count()
    },
    {
      name: 'Read First User',
      test: async () => await prisma.user.findFirst()
    },
    {
      name: 'Read First Club',
      test: async () => await prisma.club.findFirst()
    },
    {
      name: 'Create Test User',
      test: async () => {
        const testUser = await prisma.user.create({
          data: {
            email: `test-${Date.now()}@example.com`,
            username: `test-${Date.now()}`,
            password: 'hashed_password',
            role: 'USER'
          }
        });
        // Clean up
        await prisma.user.delete({ where: { id: testUser.id } });
        return 'Created and deleted successfully';
      }
    }
  ];

  console.log('Running tests...\n');
  
  for (const { name, test } of tests) {
    try {
      console.log(`Testing: ${name}`);
      const result = await test();
      console.log(`✅ SUCCESS: ${JSON.stringify(result)}\n`);
    } catch (error: unknown) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Check for specific RLS error patterns
      if (error instanceof Error && error.message.includes('new row violates row-level security policy')) {
        console.log('   🔒 This is an RLS INSERT policy issue');
      } else if (error instanceof Error && error.message.includes('permission denied')) {
        console.log('   🔒 This is a permission issue');
      } else if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        console.log('   🔍 Record not found (might be RLS filtering)');
      }
      console.log('');
    }
  }

  // Check connection details
  console.log('\n📊 Connection Info:');
  console.log('===================');
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';
  
  // Parse and hide password
  const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.*)/;
  const dbMatch = dbUrl.match(urlPattern);
  const directMatch = directUrl.match(urlPattern);
  
  if (dbMatch) {
    console.log(`DATABASE_URL:`);
    console.log(`  User: ${dbMatch[1]}`);
    console.log(`  Host: ${dbMatch[3]}`);
    console.log(`  Database: ${dbMatch[4]}`);
  }
  
  if (directMatch) {
    console.log(`\nDIRECT_URL:`);
    console.log(`  User: ${directMatch[1]}`);
    console.log(`  Host: ${directMatch[3]}`);
    console.log(`  Database: ${directMatch[4]}`);
  }

  await prisma.$disconnect();
}

testDatabaseAccess().catch(console.error);