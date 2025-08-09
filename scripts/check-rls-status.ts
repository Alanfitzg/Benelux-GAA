import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRLSStatus() {
  console.log('Checking Row Level Security (RLS) status on all tables...\n');
  
  try {
    // Get all table names from the public schema
    const tables = await prisma.$queryRaw<Array<{tablename: string, has_rls: boolean}>>`
      SELECT 
        tablename,
        CASE 
          WHEN rowsecurity = true THEN true
          ELSE false
        END as has_rls
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('📊 RLS Status by Table:');
    console.log('========================');
    
    const rlsEnabledTables: string[] = [];
    const rlsDisabledTables: string[] = [];
    
    for (const table of tables) {
      const status = table.has_rls ? '✅ ENABLED' : '❌ DISABLED';
      console.log(`${table.tablename.padEnd(30)} ${status}`);
      
      if (table.has_rls) {
        rlsEnabledTables.push(table.tablename);
      } else {
        rlsDisabledTables.push(table.tablename);
      }
    }

    console.log('\n📋 Summary:');
    console.log('===========');
    console.log(`Tables with RLS ENABLED: ${rlsEnabledTables.length}`);
    console.log(`Tables with RLS DISABLED: ${rlsDisabledTables.length}`);
    
    if (rlsEnabledTables.length > 0) {
      console.log('\n⚠️  Tables with RLS Enabled (may cause access issues):');
      rlsEnabledTables.forEach(table => console.log(`  - ${table}`));
      
      // Check for policies on RLS-enabled tables
      console.log('\n🔍 Checking policies on RLS-enabled tables...');
      
      for (const tableName of rlsEnabledTables) {
        const policies = await prisma.$queryRaw<Array<{policyname: string, cmd: string}>>`
          SELECT policyname, cmd 
          FROM pg_policies 
          WHERE tablename = ${tableName}
        `;
        
        if (policies.length === 0) {
          console.log(`\n❗ ${tableName}: NO POLICIES (table is inaccessible!)`);
        } else {
          console.log(`\n✓ ${tableName}: ${policies.length} policies found`);
          policies.forEach(p => console.log(`    - ${p.policyname} (${p.cmd})`));
        }
      }
    }
    
    console.log('\n💡 Solutions:');
    console.log('=============');
    console.log('1. DISABLE RLS (Quick fix for development):');
    console.log('   - Go to Supabase Dashboard → Authentication → Policies');
    console.log('   - Disable RLS for affected tables');
    console.log('\n2. USE SERVICE ROLE KEY (Bypass RLS):');
    console.log('   - Use service role key instead of anon key in your connection');
    console.log('   - Service role bypasses all RLS checks');
    console.log('\n3. CREATE POLICIES (Proper security):');
    console.log('   - Define who can access which rows');
    console.log('   - Example: "Enable read access for all users"');

  } catch (error) {
    console.error('Error checking RLS status:', error);
    console.log('\n⚠️  Note: This script needs to connect directly to PostgreSQL.');
    console.log('The error above might indicate RLS is blocking this query too.');
  } finally {
    await prisma.$disconnect();
  }
}

checkRLSStatus();