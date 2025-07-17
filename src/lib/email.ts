import { Resend } from 'resend';

// Initialize Resend with API key (only if configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log('Resend API key not configured');
      return false;
    }
    
    // Test the API key by attempting to get domains (lightweight API call)
    // Note: Some API keys are restricted to only send emails
    const { error } = await resend.domains.list();
    if (error) {
      // Check if it's a permission error (API key restricted to sending only)
      if (error.message && error.message.includes('restricted to only send emails')) {
        console.log('Resend API key is configured (send-only permissions)');
        return true;
      }
      console.error('Resend configuration failed:', error);
      return false;
    }
    
    console.log('Resend API key is configured and valid');
    return true;
  } catch (error) {
    console.error('Resend configuration failed:', error);
    return false;
  }
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    // Skip email sending in development if no Resend API key
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log('📧 Email would be sent (Resend not configured):', {
        to,
        subject,
        html: html.substring(0, 100) + '...',
      });
      return true;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@gaelic-trips.com';
    const fromName = process.env.RESEND_FROM_NAME || 'Gaelic Trips';

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || undefined,
    });

    if (error) {
      console.error('❌ Failed to send email via Resend:', error);
      return false;
    }

    console.log('✅ Email sent successfully via Resend');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via Resend:', error);
    return false;
  }
}

// Send multiple emails (for when we have many admins)
export async function sendBulkEmail({
  personalizations,
  subject,
  html,
  text,
}: {
  personalizations: Array<{ to: string; substitutions?: Record<string, string> }>;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log('📧 Bulk email would be sent (Resend not configured):', {
        recipients: personalizations.length,
        subject,
      });
      return true;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@gaelic-trips.com';
    const fromName = process.env.RESEND_FROM_NAME || 'Gaelic Trips';

    // Resend doesn't have native bulk email with personalizations like SendGrid
    // We'll send individual emails in a batch
    const promises = personalizations.map(async (p) => {
      // Apply substitutions to the HTML and text content
      let personalizedHtml = html;
      let personalizedText = text || '';
      
      if (p.substitutions) {
        Object.entries(p.substitutions).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          personalizedHtml = personalizedHtml.replace(new RegExp(placeholder, 'g'), value);
          personalizedText = personalizedText.replace(new RegExp(placeholder, 'g'), value);
        });
      }

      const { error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: p.to,
        subject,
        html: personalizedHtml,
        text: personalizedText || undefined,
      });

      if (error) {
        console.error(`❌ Failed to send email to ${p.to}:`, error);
        return false;
      }

      return true;
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r).length;
    
    console.log(`✅ Bulk email sent: ${successCount}/${personalizations.length} successful`);
    return successCount === personalizations.length;
  } catch (error) {
    console.error('❌ Failed to send bulk email via Resend:', error);
    return false;
  }
}

// Get admin email addresses
export async function getAdminEmails(): Promise<string[]> {
  // Import prisma here to avoid circular dependencies
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN',
        accountStatus: 'APPROVED'
      },
      select: {
        email: true,
        name: true
      }
    });

    return admins.map(admin => admin.email);
  } catch (error) {
    console.error('Failed to fetch admin emails:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}