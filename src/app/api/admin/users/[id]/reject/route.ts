import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { generateUserApprovalNotificationEmail } from '@/lib/email-templates';

async function rejectUserHandler(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireSuperAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;
    const { reason } = await req.json();
    
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Rejection reason is required' 
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'REJECTED',
        rejectionReason: reason.trim(),
        approvedAt: null,
        approvedBy: null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        accountStatus: true,
        rejectionReason: true,
      }
    });

    // Send rejection notification email (don't wait for it to complete)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const emailData = {
      userName: updatedUser.name || updatedUser.username,
      userEmail: updatedUser.email,
      approved: false,
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
      console.error('Failed to send rejection notification email:', error);
    });

    return NextResponse.json({ 
      message: 'User rejected successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export const POST = withRateLimit(RATE_LIMITS.ADMIN, rejectUserHandler);