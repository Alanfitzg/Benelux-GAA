import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, message, type, clubName: visitorClubName } = body;

    // Validate required fields
    if (!name || !email || !type) {
      return NextResponse.json(
        { error: "Name, email, and type are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if club exists and get admin contact email
    const club = await prisma.club.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        contactFirstName: true,
        contactLastName: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Store the contact/interest record
    await prisma.clubInterest.create({
      data: {
        clubId: id,
        name,
        email,
        clubName: visitorClubName || null,
        message: message || null,
        type, // 'contact' or 'interest'
      },
    });

    // Send email notification to club contact if they have email configured
    if (club.contactEmail) {
      const contactName =
        [club.contactFirstName, club.contactLastName]
          .filter(Boolean)
          .join(" ") || "Club Admin";

      const subject =
        type === "contact"
          ? `New Contact Message for ${club.name}`
          : `New Interest Expression for ${club.name}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">${subject}</h2>
          <p>Hi ${contactName},</p>
          <p>You have received a new ${type === "contact" ? "contact message" : "expression of interest"} through PlayAway:</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name}</p>
            ${visitorClubName ? `<p style="margin: 0 0 10px 0;"><strong>Club:</strong> ${visitorClubName}</p>` : ""}
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${message ? `<p style="margin: 0;"><strong>Message:</strong></p><p style="margin: 5px 0 0 0; white-space: pre-wrap;">${message}</p>` : '<p style="margin: 0; color: #666;"><em>No message provided</em></p>'}
          </div>

          <p>You can reply directly to this person by emailing <a href="mailto:${email}">${email}</a>.</p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">
            This message was sent via PlayAway. If you did not expect this email, please contact support.
          </p>
        </div>
      `;

      await sendEmail({
        to: club.contactEmail,
        subject,
        html,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        type === "contact"
          ? "Your message has been sent to the club!"
          : "Your interest has been recorded! The club will be notified.",
    });
  } catch (error) {
    console.error("Error processing club contact/interest:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
