import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
  type: z.enum(["general", "club", "event", "technical", "partnership", "feedback"])
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const limiter = rateLimit(RATE_LIMITS.FORMS);
    const rateLimitResult = limiter(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Send confirmation email to user
    
    // For now, just log the contact form submission
    console.log("Contact form submission:", {
      timestamp: new Date().toISOString(),
      type: validatedData.type,
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

  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}