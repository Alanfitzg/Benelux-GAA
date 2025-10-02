import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/emails/welcome-email";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, testEmail } = body;

    // Get user and club information
    const user = await prisma.user.findUnique({
      where: { id: userId || session.user.id },
      include: {
        club: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert relative URL to absolute URL for email display
    let absoluteClubCrestUrl: string | undefined = undefined;
    if (user.club?.imageUrl) {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      if (
        user.club.imageUrl.startsWith("http://") ||
        user.club.imageUrl.startsWith("https://")
      ) {
        absoluteClubCrestUrl = user.club.imageUrl;
      } else {
        absoluteClubCrestUrl = `${baseUrl}${user.club.imageUrl.startsWith("/") ? "" : "/"}${user.club.imageUrl}`;
      }
    }

    // Send welcome email
    const result = await sendWelcomeEmail({
      to: testEmail || user.email,
      userName: user.name || user.email.split("@")[0],
      clubName: user.club?.name,
      clubCrestUrl: absoluteClubCrestUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      message: "Welcome email sent successfully",
    });
  } catch (error) {
    console.error("Error in welcome email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
