import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { passwordSchema } from "@/lib/validation/schemas";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Hash the token to match what's in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: {
          gt: new Date(),
        },
        used: false,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    // Send confirmation email
    const { sendEmail } = await import("@/lib/email");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Successful</h2>
        <p>Hi ${resetToken.user.name || resetToken.user.username},</p>
        <p>Your password has been successfully reset. You can now sign in with your new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/signin" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Sign In
          </a>
        </div>
        <p>If you didn't make this change, please contact support immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">GAA Trips - Connecting GAA clubs worldwide</p>
      </div>
    `;

    const emailText = `
Password Reset Successful

Hi ${resetToken.user.name || resetToken.user.username},

Your password has been successfully reset. You can now sign in with your new password.

Sign in at: ${process.env.NEXTAUTH_URL}/signin

If you didn't make this change, please contact support immediately.

GAA Trips - Connecting GAA clubs worldwide
    `;

    await sendEmail({
      to: resetToken.user.email,
      subject: "Password Reset Successful - GAA Trips",
      html: emailHtml,
      text: emailText,
    }).catch(console.error); // Don't fail if email fails

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
