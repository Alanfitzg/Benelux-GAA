import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin, getServerSession } from '@/lib/auth-helpers';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Check if user is super admin
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, rejectionReason, adminNotes } = await req.json();
    const clubId = params.id;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        rejectionReason: action === 'reject' ? rejectionReason : null,
        adminNotes: adminNotes || null
      }
    });

    return NextResponse.json({
      success: true,
      club: updatedClub
    });
  } catch (error) {
    console.error('Error updating club status:', error);
    return NextResponse.json(
      { error: 'Failed to update club status' },
      { status: 500 }
    );
  }
}