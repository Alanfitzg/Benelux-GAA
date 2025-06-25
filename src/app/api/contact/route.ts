import { NextRequest, NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validation/schemas";
import { withErrorHandler } from "@/lib/error-handlers";
import { validateBody } from "@/lib/validation/middleware";

async function contactHandler(request: NextRequest) {
  // Validate request body using Zod schema
  const validatedData = await validateBody(request, ContactFormSchema);

  // In a real application, you would:
  // 1. Save to database
  // 2. Send email notification
  // 3. Send confirmation email to user
  
  // For now, just log the contact form submission
  console.log("Contact form submission:", {
    timestamp: new Date().toISOString(),
    name: validatedData.name,
    email: validatedData.email,
    subject: validatedData.subject,
    message: validatedData.message.substring(0, 100) + "..."
  });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return NextResponse.json(
    { 
      success: true, 
      message: "Thank you for your message! We'll get back to you within 24 hours." 
    },
    { status: 200 }
  );
}

// Apply error handling wrapper
export const POST = withErrorHandler(contactHandler)