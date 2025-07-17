/**
 * Test script for email notification system
 * Run with: npx ts-node scripts/test-email.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { sendEmail, testEmailConnection } from '../src/lib/email';
import { generateNewUserNotificationEmail } from '../src/lib/email-templates';

async function testEmailSystem() {
  console.log('🧪 Testing Email System...\n');

  // Test 1: Check email connection
  console.log('1. Testing email server connection...');
  const connectionValid = await testEmailConnection();
  if (!connectionValid) {
    console.log('⚠️  Email connection failed or not configured. Emails will be logged only.');
  } else {
    console.log('✅ Email connection successful!');
  }

  // Test 2: Generate test email content
  console.log('\n2. Testing email template generation...');
  const testData = {
    userName: 'John O\'Sullivan',
    userEmail: 'john.osullivan@example.com',
    userId: 'test-user-123',
    userClub: 'Dublin GAA Club',
    registrationDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    adminPanelUrl: 'http://localhost:3000/admin'
  };

  const { subject, html, text } = generateNewUserNotificationEmail(testData);
  console.log('✅ Email template generated successfully!');
  console.log(`📧 Subject: ${subject}`);
  console.log(`📄 HTML length: ${html.length} characters`);
  console.log(`📝 Text length: ${text.length} characters`);

  // Test 3: Send test email (if Resend is configured)
  if (process.env.RESEND_API_KEY) {
    console.log('\n3. Sending test email...');
    const testEmail = process.env.TEST_EMAIL || process.env.RESEND_FROM_EMAIL || 'admin@example.com';
    
    const success = await sendEmail({
      to: testEmail,
      subject: '🧪 Test Email - Gaelic Trips Admin Notification System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af;">✅ Email System Test Successful!</h1>
          <p>This is a test email to verify that the Gaelic Trips admin notification system is working correctly.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🔧 System Information:</h3>
            <ul>
              <li><strong>Email Service:</strong> Resend</li>
              <li><strong>From Email:</strong> ${process.env.RESEND_FROM_EMAIL}</li>
              <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <p>If you received this email, the admin notification system is ready to send notifications when new users register!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test email from the Gaelic Trips development environment.
          </p>
        </div>
      `,
      text: `
Email System Test Successful!

This is a test email to verify that the Gaelic Trips admin notification system is working correctly.

System Information:
- Email Service: Resend
- From Email: ${process.env.RESEND_FROM_EMAIL}
- Test Time: ${new Date().toISOString()}

If you received this email, the admin notification system is ready to send notifications when new users register!

This is an automated test email from the Gaelic Trips development environment.
      `
    });

    if (success) {
      console.log(`✅ Test email sent successfully to: ${testEmail}`);
    } else {
      console.log('❌ Failed to send test email');
    }
  } else {
    console.log('\n3. ⚠️  Resend not configured - test email skipped');
    console.log('   To test email sending, configure Resend in your .env file:');
    console.log(`
📧 Resend Setup:
   1. Create a Resend account at https://resend.com
   2. Generate an API Key in your Resend dashboard
   3. Verify your sender email/domain
   4. Update .env file:
      RESEND_API_KEY="re_your-api-key-here"
      RESEND_FROM_EMAIL="noreply@yourdomain.com" 
      RESEND_FROM_NAME="Gaelic Trips"
      
📧 Benefits of Resend:
   - Developer-friendly API
   - Great React email integration
   - Real-time webhooks
   - Modern email infrastructure`);
  }

  console.log('\n🎉 Email system test completed!\n');
  console.log('📋 Next steps:');
  console.log('   1. Configure Resend settings in your .env file (if not done)');
  console.log('   2. Test user registration to trigger admin notifications');
  console.log('   3. Check admin approval/rejection email notifications');
}

// Run the test
testEmailSystem().catch(console.error);