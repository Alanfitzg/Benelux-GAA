import { NextRequest, NextResponse } from "next/server";
import { generateWelcomeEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    // Generate test welcome email with club information
    const testData = {
      userName: "Alan",
      userEmail: "alanfitzg@gmail.com",
      loginUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      isApproved: true,
      clubName: "St. Brendans GAA Club",
      clubImageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Cork_county_colours.png/240px-Cork_county_colours.png",
    };

    const { html } = generateWelcomeEmail(testData);

    // Return the HTML for preview
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating test email:", error);
    return NextResponse.json(
      { error: "Failed to generate test email" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const emailAddress = email || "alanfitzg@gmail.com";

    // Generate test welcome email with club information
    const testData = {
      userName: "Alan",
      userEmail: emailAddress,
      loginUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      isApproved: true,
      clubName: "St. Brendans GAA Club",
      clubImageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Cork_county_colours.png/240px-Cork_county_colours.png",
    };

    const { subject, html, text } = generateWelcomeEmail(testData);

    // Send the email
    const success = await sendEmail({
      to: emailAddress,
      subject,
      html,
      text,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Welcome email sent successfully to ${emailAddress}`,
        subject,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send test welcome email" },
      { status: 500 }
    );
  }
}
