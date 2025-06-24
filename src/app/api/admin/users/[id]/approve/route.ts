import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

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