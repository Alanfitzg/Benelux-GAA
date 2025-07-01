import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { generateUserApprovalNotificationEmail } from '@/lib/email-templates';

async function approveUserHandler(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireSuperAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;
    
    // Get the admin user ID from session
    const adminUserId = authResult.user.id;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminUserId,
        rejectionReason: null, // Clear any previous rejection reason
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        accountStatus: true,
        approvedAt: true,
      }
    });

    // Send approval notification email (don't wait for it to complete)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const emailData = {
      userName: updatedUser.name || updatedUser.username,
      userEmail: updatedUser.email,
      approved: true,
      adminName: authResult.user.name,
      loginUrl: `${baseUrl}/signin`
    };

    const { subject, html, text } = generateUserApprovalNotificationEmail(emailData);
    
    sendEmail({
      to: updatedUser.email,
      subject,
      html,
      text
    }).catch(error => {
      console.error('Failed to send approval notification email:', error);
    });

    return NextResponse.json({ 
      message: 'User approved successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export const POST = withRateLimit(RATE_LIMITS.ADMIN, approveUserHandler);