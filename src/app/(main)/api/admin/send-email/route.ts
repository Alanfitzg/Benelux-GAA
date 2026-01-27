import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { sendEmail } from "@/lib/email";
import { generateBroadcastEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, name, subject, message } = await req.json();

    // Validate email
    if (!to || typeof to !== "string" || to.trim().length === 0) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (
      !subject ||
      typeof subject !== "string" ||
      subject.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate email content using the broadcast template
    const baseUrl = process.env.NEXTAUTH_URL || "https://playaway.ie";
    const emailData = generateBroadcastEmail({
      subject: subject.trim(),
      message: message.trim(),
      senderName: session.user.name || "PlayAway Team",
      baseUrl,
    });

    // Replace placeholder with recipient name
    const recipientName = name?.trim() || "there";
    const personalizedHtml = emailData.html.replace(
      /\{\{recipientName\}\}/g,
      recipientName
    );
    const personalizedText = emailData.text.replace(
      /\{\{recipientName\}\}/g,
      recipientName
    );

    // Send the email
    const success = await sendEmail({
      to: to.trim(),
      subject: emailData.subject,
      html: personalizedHtml,
      text: personalizedText,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Email sent successfully",
      sentTo: to.trim(),
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
