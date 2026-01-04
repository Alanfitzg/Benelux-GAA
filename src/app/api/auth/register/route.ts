import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/user";
import { UserRegistrationSchema } from "@/lib/validation/schemas";
import { ConflictError, withErrorHandler } from "@/lib/error-handlers";
import { validateBody } from "@/lib/validation/middleware";
import { sendEmail } from "@/lib/email";
import { generateWelcomeEmail } from "@/lib/email-templates";
import { AccountStatus } from "@prisma/client";

async function registrationHandler(request: NextRequest) {
  // Get the raw body first to extract additional fields
  const body = await request.json();

  // Honeypot check - if the hidden "website" field is filled, it's a bot
  // Silently reject but return success to not reveal the trap
  if (body.website && body.website.trim() !== "") {
    console.log("🤖 Bot detected via honeypot field, rejecting registration");
    return NextResponse.json(
      {
        success: true,
        user: {
          id: "blocked",
          email: body.email,
          username: body.username,
          name: body.name,
          role: "USER",
          accountStatus: "APPROVED",
        },
        message: "Account created successfully!",
      },
      { status: 201 }
    );
  }

  // Validate required fields using Zod schema
  const { email, username, password, name } = await validateBody(
    { json: async () => body } as NextRequest,
    UserRegistrationSchema
  );

  // Extract additional fields
  const { clubId } = body;

  // Normalize input data
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();
  const normalizedName = name?.trim() || undefined;

  // Check for existing users
  const [existingUserByEmail, existingUserByUsername] = await Promise.all([
    getUserByEmail(normalizedEmail),
    getUserByUsername(normalizedUsername),
  ]);

  if (existingUserByEmail) {
    throw new ConflictError("An account with this email already exists");
  }

  if (existingUserByUsername) {
    throw new ConflictError("This username is already taken");
  }

  // All users are now auto-approved
  const accountStatus = AccountStatus.APPROVED;

  // Create user with optional club association
  const user = await createUser(
    normalizedEmail,
    normalizedUsername,
    password,
    normalizedName,
    undefined,
    clubId || null,
    accountStatus
  );

  // Send welcome email to the new user (all users are approved)
  sendWelcomeEmail({ ...user, clubId: clubId || null }, true).catch((error) => {
    console.error("Failed to send welcome email:", error);
  });

  return NextResponse.json(
    {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        accountStatus: user.accountStatus,
      },
      message:
        "Account created successfully! You can now sign in and start using GAA Trips.",
    },
    { status: 201 }
  );
}

// Helper function to send welcome email
async function sendWelcomeEmail(
  user: {
    id: string;
    email: string;
    name: string | null;
    username: string;
    clubId?: string | null;
  },
  isApproved: boolean
) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const loginUrl = `${baseUrl}/signin`;

    // Fetch club information if user has a club
    let clubInfo = null;
    let absoluteClubImageUrl = null;
    if (user.clubId) {
      const { prisma } = await import("@/lib/prisma");
      try {
        clubInfo = await prisma.club.findUnique({
          where: { id: user.clubId },
          select: {
            name: true,
            imageUrl: true,
          },
        });

        // Convert relative URL to absolute URL for email display
        if (clubInfo?.imageUrl) {
          if (
            clubInfo.imageUrl.startsWith("http://") ||
            clubInfo.imageUrl.startsWith("https://")
          ) {
            absoluteClubImageUrl = clubInfo.imageUrl;
          } else {
            absoluteClubImageUrl = `${baseUrl}${clubInfo.imageUrl.startsWith("/") ? "" : "/"}${clubInfo.imageUrl}`;
          }
        }
      } catch (error) {
        console.error("Error fetching club info for welcome email:", error);
      }
    }

    const emailData = {
      userName: user.name || user.username,
      userEmail: user.email,
      loginUrl,
      isApproved,
      clubName: clubInfo?.name || null,
      clubImageUrl: absoluteClubImageUrl,
    };

    const { subject, html, text } = generateWelcomeEmail(emailData);

    const success = await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });

    if (success) {
      console.log(`✅ Welcome email sent to: ${user.email}`);
    } else {
      console.error("❌ Failed to send welcome email");
    }
  } catch (error) {
    console.error("Error in sendWelcomeEmail:", error);
  }
}

// Apply error handling wrapper
export const POST = withErrorHandler(registrationHandler);
