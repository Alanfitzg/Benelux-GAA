import { NextRequest, NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validation/schemas";
import { withErrorHandler } from "@/lib/error-handlers";
import { validateBody } from "@/lib/validation/middleware";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

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

  // Save to database (emails disabled for security - submissions viewable in admin dashboard)
  await prisma.contactSubmission.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      status: "NEW",
    },
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
