import { NextRequest, NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validation/schemas";
import { withErrorHandler } from "@/lib/error-handlers";
import { validateBody } from "@/lib/validation/middleware";
import { prisma } from "@/lib/prisma";
import { sendEmail, getAdminEmails } from "@/lib/email";

async function contactHandler(request: NextRequest) {
  // Validate request body using Zod schema
  const validatedData = await validateBody(request, ContactFormSchema);

  // 1. Save to database
  const submission = await prisma.contactSubmission.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      status: "NEW",
    },
  });

  // 2. Send email notification to admins
  const adminEmails = await getAdminEmails();

  if (adminEmails.length > 0) {
    const adminNotificationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a3352 0%, #264673 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>

          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; color: #1a3352; font-size: 18px;">Contact Details</h2>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${validatedData.name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${validatedData.email}" style="color: #2563eb;">${validatedData.email}</a></p>
              <p style="margin: 8px 0;"><strong>Subject:</strong> ${validatedData.subject}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="margin: 0 0 15px 0; color: #1a3352; font-size: 18px;">Message</h2>
              <p style="margin: 0; white-space: pre-wrap;">${validatedData.message}</p>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Reply directly to this email or contact ${validatedData.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: adminEmails,
      subject: `[PlayAway Contact] ${validatedData.subject}`,
      html: adminNotificationHtml,
      text: `New contact form submission from ${validatedData.name} (${validatedData.email})\n\nSubject: ${validatedData.subject}\n\nMessage:\n${validatedData.message}`,
    });
  }

  // 3. Send confirmation email to user
  const userConfirmationHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a3352 0%, #264673 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us</h1>
        </div>

        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 15px 0;">Hi ${validatedData.name},</p>

          <p style="margin: 0 0 15px 0;">
            Thank you for reaching out to PlayAway! We've received your message and will get back to you within 24 hours.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1a3352; font-size: 16px;">Your Message</h3>
            <p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${validatedData.subject}</p>
            <p style="margin: 0; color: #64748b; font-style: italic;">"${validatedData.message.substring(0, 200)}${validatedData.message.length > 200 ? "..." : ""}"</p>
          </div>

          <p style="margin: 0;">
            Best regards,<br>
            <strong>The PlayAway Team</strong>
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              This is an automated confirmation. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: validatedData.email,
    subject: "We've received your message - PlayAway",
    html: userConfirmationHtml,
    text: `Hi ${validatedData.name},\n\nThank you for reaching out to PlayAway! We've received your message and will get back to you within 24 hours.\n\nYour message:\nSubject: ${validatedData.subject}\n"${validatedData.message.substring(0, 200)}${validatedData.message.length > 200 ? "..." : ""}"\n\nBest regards,\nThe PlayAway Team`,
  });

  return NextResponse.json(
    {
      success: true,
      message:
        "Thank you for your message! We'll get back to you within 24 hours.",
      id: submission.id,
    },
    { status: 200 }
  );
}

// Apply error handling wrapper
export const POST = withErrorHandler(contactHandler);
