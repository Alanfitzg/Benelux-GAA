import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { sendEuropeanAdminWelcomeEmail } from "@/lib/emails/european-admin-welcome-email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const adminRequest = await prisma.clubAdminRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { email: true, name: true, username: true } },
        club: { select: { name: true } },
      },
    });

    if (!adminRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (adminRequest.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Can only resend email for approved requests" },
        { status: 400 }
      );
    }

    const result = await sendEuropeanAdminWelcomeEmail({
      to: adminRequest.user.email,
      userName: adminRequest.user.name || adminRequest.user.username,
      clubName: adminRequest.club.name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (error) {
    console.error("Error resending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to resend welcome email" },
      { status: 500 }
    );
  }
}
