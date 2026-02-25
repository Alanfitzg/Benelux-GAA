import { Resend } from "resend";
import nodemailer from "nodemailer";

// Initialize Resend with API key (only if configured)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Initialize Nodemailer SMTP transport (fallback when Resend not configured)
function getSmtpTransport() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  )
    return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    if (resend) {
      const { error } = await resend.domains.list();
      if (
        error?.message &&
        error.message.includes("restricted to only send emails")
      ) {
        return true;
      }
      return !error;
    }

    const smtp = getSmtpTransport();
    if (smtp) {
      await smtp.verify();
      return true;
    }

    console.log("No email provider configured");
    return false;
  } catch (error) {
    console.error("Email configuration test failed:", error);
    return false;
  }
}

// Send email function — tries Resend first, then SMTP, then logs
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
  const recipients = Array.isArray(to) ? to : [to];
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    process.env.SMTP_FROM ||
    "noreply@beneluxgaa.com";
  const fromName =
    process.env.RESEND_FROM_NAME || process.env.SMTP_FROM_NAME || "Benelux GAA";

  // 1) Try Resend
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipients,
        subject,
        html,
        text: text || undefined,
      });
      if (error) {
        console.error("Failed to send via Resend:", error);
      } else {
        console.log("Email sent via Resend");
        return true;
      }
    } catch (error) {
      console.error("Resend error:", error);
    }
  }

  // 2) Try SMTP (Gmail, Outlook, etc.)
  const smtp = getSmtpTransport();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: recipients.join(", "),
        subject,
        html,
        text: text || undefined,
      });
      console.log("Email sent via SMTP");
      return true;
    } catch (error) {
      console.error("SMTP error:", error);
      return false;
    }
  }

  // 3) No provider configured — log only
  console.log("No email provider configured. Email not sent:", {
    to,
    subject,
  });
  return true;
}

// Send multiple emails
export async function sendBulkEmail({
  personalizations,
  subject,
  html,
  text,
}: {
  personalizations: Array<{
    to: string;
    substitutions?: Record<string, string>;
  }>;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const promises = personalizations.map(async (p) => {
    let personalizedHtml = html;
    let personalizedText = text || "";

    if (p.substitutions) {
      Object.entries(p.substitutions).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        personalizedHtml = personalizedHtml.replace(
          new RegExp(placeholder, "g"),
          value
        );
        personalizedText = personalizedText.replace(
          new RegExp(placeholder, "g"),
          value
        );
      });
    }

    return sendEmail({
      to: p.to,
      subject,
      html: personalizedHtml,
      text: personalizedText || undefined,
    });
  });

  const results = await Promise.all(promises);
  const successCount = results.filter((r) => r).length;
  console.log(
    `Bulk email: ${successCount}/${personalizations.length} successful`
  );
  return successCount === personalizations.length;
}

// Get admin email addresses
export async function getAdminEmails(): Promise<string[]> {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "SUPER_ADMIN",
        accountStatus: "APPROVED",
      },
      select: {
        email: true,
        name: true,
      },
    });

    return admins.map((admin) => admin.email);
  } catch (error) {
    console.error("Failed to fetch admin emails:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
