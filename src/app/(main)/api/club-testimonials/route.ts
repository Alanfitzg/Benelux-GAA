import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

// GET: Fetch testimonials for a club
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const status = searchParams.get("status");

    if (!clubId) {
      return NextResponse.json(
        { error: "clubId is required" },
        { status: 400 }
      );
    }

    const where: { clubId: string; status?: string } = { clubId };
    if (status) {
      where.status = status;
    }

    const testimonials = await prisma.clubTestimonialRequest.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        email: true,
        name: true,
        memberClubName: true,
        content: true,
        status: true,
        displayOrder: true,
        createdAt: true,
        submittedAt: true,
      },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST: Create a new testimonial request (admin sends invite)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clubId, email } = body;

    if (!clubId || !email) {
      return NextResponse.json(
        { error: "clubId and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if user is admin (SUPER_ADMIN or ClubSiteAdmin)
    const isSuper = session.user.role === "SUPER_ADMIN";
    const isClubAdmin = await prisma.clubSiteAdmin.findFirst({
      where: {
        clubId,
        email: session.user.email ?? "",
      },
    });

    if (!isSuper && !isClubAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create testimonial request
    const testimonialRequest = await prisma.clubTestimonialRequest.create({
      data: {
        clubId,
        email: email.toLowerCase().trim(),
        token,
        expiresAt,
      },
    });

    // Send email with invitation link
    const baseUrl = process.env.NEXTAUTH_URL || "https://gge-social.com";
    const submitUrl = `${baseUrl}/demo/${clubId}/testimonial/${token}`;

    // Club-specific theming
    const clubConfig: Record<
      string,
      { name: string; color: string; tagline: string; crest: string }
    > = {
      "rome-hibernia": {
        name: "Rome Hibernia GAA",
        color: "#c41e3a",
        tagline: "The Home of Gaelic Games in Rome",
        crest: "https://gge-social.com/club-crests/rome-hibernia-NEW.png",
      },
    };

    const club = clubConfig[clubId] || {
      name: clubId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase()),
      color: "#2d5a3d",
      tagline: "GAA Club",
      crest: "",
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header with club branding -->
                <tr>
                  <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-family: Georgia, serif; letter-spacing: 1px;">${club.name}</h1>
                    <div style="width: 60px; height: 3px; background-color: ${club.color}; margin: 15px auto 0;"></div>
                  </td>
                </tr>
                <!-- Main content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px; font-family: Arial, sans-serif;">We'd Love Your Testimonial!</h2>
                    <p style="color: #4a4a4a; line-height: 1.7; font-size: 16px; margin: 0 0 15px; font-family: Arial, sans-serif;">
                      You've been invited to share your experience with <strong>${club.name}</strong>. Your testimonial will help others discover our community and inspire new members to join.
                    </p>
                    <p style="color: #4a4a4a; line-height: 1.7; font-size: 16px; margin: 0 0 30px; font-family: Arial, sans-serif;">
                      It only takes a minute - just click the button below:
                    </p>
                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding: 10px 0 30px;">
                          <a href="${submitUrl}" style="background-color: ${club.color}; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(196, 30, 58, 0.3);">
                            Share Your Experience
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #888888; font-size: 14px; margin: 0; font-family: Arial, sans-serif; text-align: center;">
                      This link will expire in 7 days.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a1a; padding: 25px 30px; text-align: center;">
                    <p style="color: #888888; font-size: 13px; margin: 0; font-family: Arial, sans-serif;">
                      ${club.name} - ${club.tagline}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailText = `
${club.name} - Testimonial Request

We'd Love Your Testimonial!

You've been invited to share your experience with ${club.name}. Your testimonial will help others discover our community and inspire new members to join.

Click here to share your experience: ${submitUrl}

This link will expire in 7 days.

${club.name} - ${club.tagline}
    `;

    await sendEmail({
      to: email,
      subject: "Share Your Rome Hibernia Experience",
      html: emailHtml,
      text: emailText,
    });

    return NextResponse.json({
      success: true,
      message: "Testimonial request sent successfully",
      id: testimonialRequest.id,
    });
  } catch (error) {
    console.error("Error creating testimonial request:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial request" },
      { status: 500 }
    );
  }
}
