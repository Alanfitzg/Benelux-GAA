import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApprovedSuperAdmin } from '@/lib/auth-helpers';

export async function POST() {
  try {
    const authResult = await requireApprovedSuperAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Update all existing clubs (that have PENDING status) to APPROVED
    // This is a one-time migration for existing clubs
    const result = await prisma.club.updateMany({
      where: {
        status: 'PENDING',
        createdAt: {
          // Only update clubs created before today (existing clubs)
          lt: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: authResult.user.id,
        adminNotes: 'Auto-approved during migration - existing club'
      }
    });

    return NextResponse.json({ 
      message: `Updated ${result.count} existing clubs to APPROVED status`,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Error migrating club status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}