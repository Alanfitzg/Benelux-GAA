import { Resend } from 'resend';

async function testResendDomain() {
  console.log('🔍 Testing Resend Domain Configuration...\n');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  try {
    // Try to list domains
    console.log('📧 Attempting to list domains...');
    const { data: domains, error: domainsError } = await resend.domains.list();
    
    if (domainsError) {
      // Check if it's a permission error (API key restricted to sending only)
      if (domainsError.message && domainsError.message.includes('restricted to only send emails')) {
        console.log('⚠️  API key is restricted to sending emails only (cannot list domains)');
        console.log('    This is normal for send-only API keys\n');
      } else {
        console.error('❌ Error listing domains:', domainsError);
      }
    } else if (domains) {
      console.log('✅ Domains found:');
      if (domains.data && Array.isArray(domains.data)) {
        domains.data.forEach((domain: any) => {
          console.log(`   - ${domain.name} (Status: ${domain.status})`);
          if (domain.status !== 'verified') {
            console.log(`     ⚠️  Domain not verified! Add DNS records.`);
          }
        });
      }
      console.log('');
    }

    // Test sending to Resend test email
    console.log('📧 Testing email send capability...');
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@gaelictrips.com';
    const fromName = process.env.RESEND_FROM_NAME || 'Gaelic Trips';
    
    console.log(`   From: ${fromName} <${fromEmail}>`);
    console.log(`   To: delivered@resend.dev (Resend test address)\n`);

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: ['delivered@resend.dev'],
      subject: 'Gaelic Trips - Email Configuration Test',
      html: `
        <h1>Email Configuration Test</h1>
        <p>This is a test email from Gaelic Trips to verify email configuration.</p>
        <p>If you're seeing this, the email system is working correctly!</p>
        <hr>
        <p><small>Sent from: ${fromEmail}</small></p>
      `,
      text: 'This is a test email from Gaelic Trips to verify email configuration.'
    });

    if (error) {
      console.error('❌ Failed to send test email:', error);
      
      if (error.message && error.message.includes('domain')) {
        console.log('\n⚠️  Domain issue detected!');
        console.log('   Please ensure:');
        console.log('   1. Your domain is added to Resend');
        console.log('   2. DNS records are properly configured');
        console.log('   3. Domain is verified in Resend dashboard');
      }
    } else {
      console.log('✅ Test email sent successfully!');
      console.log(`   Email ID: ${data?.id}`);
      console.log('\n🎉 Email configuration is working!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testResendDomain().catch(console.error);