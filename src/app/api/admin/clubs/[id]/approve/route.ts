import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApprovedAnyAdmin } from '@/lib/auth-helpers';
import { revalidateTag } from 'next/cache';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const authResult = await requireApprovedAnyAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { action, rejectionReason, adminNotes } = await req.json();
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const updateData: {
      status: 'APPROVED' | 'REJECTED';
      reviewedAt: Date;
      reviewedBy: string;
      rejectionReason?: string;
      adminNotes?: string;
    } = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: authResult.user.id,
    };

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const club = await prisma.club.update({
      where: { id: params.id },
      data: updateData,
      include: {
        events: true,
      },
    });

    // Invalidate club caches
    revalidateTag('clubs');
    revalidateTag('filters');

    return NextResponse.json({ 
      club, 
      message: `Club ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error('Error updating club status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}