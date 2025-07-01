import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured');
      return false;
    }
    
    // SendGrid doesn't have a direct "verify" method like nodemailer
    // We'll just check if the API key is set
    console.log('SendGrid API key is configured');
    return true;
  } catch (error) {
    console.error('SendGrid configuration failed:', error);
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
    // Skip email sending in development if no SendGrid API key
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email would be sent (SendGrid not configured):', {
        to,
        subject,
        html: html.substring(0, 100) + '...',
      });
      return true;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@gaelic-trips.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'Gaelic Trips';

    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      text: text || '', // SendGrid requires text content
      html,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid:', response[0].statusCode);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via SendGrid:', error);
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
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Bulk email would be sent (SendGrid not configured):', {
        recipients: personalizations.length,
        subject,
      });
      return true;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@gaelic-trips.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'Gaelic Trips';

    const msg = {
      personalizations: personalizations.map(p => ({
        to: [{ email: p.to }],
        substitutions: p.substitutions || {},
      })),
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      text: text || '',
      html,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Bulk email sent successfully via SendGrid:', response[0].statusCode);
    return true;
  } catch (error) {
    console.error('❌ Failed to send bulk email via SendGrid:', error);
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