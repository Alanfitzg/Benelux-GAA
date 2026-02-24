import { NextRequest, NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validation/schemas";
import { withErrorHandler } from "@/lib/error-handlers";
import { validateBody } from "@/lib/validation/middleware";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

async function contactHandler(request: NextRequest) {
  // Validate request body using Zod schema
  const validatedData = await validateBody(request, ContactFormSchema);

  // Check honeypot field - if filled, it's a bot
  if (validatedData.website && validatedData.website.length > 0) {
    // Silently reject but return success to not alert the bot
    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for your message! We'll get back to you within 24 hours.",
      },
      { status: 200 }
    );
  }

  // Save to database
  await prisma.contactSubmission.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      status: "NEW",
    },
  });

  // Send email notification to Benelux GAA secretary
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a3a4a; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
        <p style="color: #2B9EB3; margin: 8px 0 0 0; font-size: 14px;">beneluxgaa.com</p>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Name:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${validatedData.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;"><a href="mailto:${validatedData.email}">${validatedData.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subject:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${validatedData.subject}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Message:</p>
        <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="color: #111827; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${validatedData.message}</p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: "secretary.benelux.europe@gaa.ie",
    subject: `[Benelux GAA Contact] ${validatedData.subject}`,
    html,
    text: `New contact form submission from beneluxgaa.com\n\nName: ${validatedData.name}\nEmail: ${validatedData.email}\nSubject: ${validatedData.subject}\n\nMessage:\n${validatedData.message}`,
  });

  return NextResponse.json(
    {
      success: true,
      message:
        "Thank you for your message! We'll get back to you within 24 hours.",
    },
    { status: 200 }
  );
}

// Apply rate limiting and error handling wrappers
export const POST = withRateLimit(
  RATE_LIMITS.FORMS,
  withErrorHandler(contactHandler)
);
