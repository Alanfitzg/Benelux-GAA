import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApprovedAnyAdmin } from '@/lib/auth-helpers';
import { ClubStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireApprovedAnyAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    // Validate status parameter
    const validStatuses: ClubStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
    const clubStatus = validStatuses.includes(status as ClubStatus) ? (status as ClubStatus) : ClubStatus.PENDING;

    const clubs = await prisma.club.findMany({
      where: {
        status: clubStatus,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ clubs });
  } catch (error) {
    console.error('Error fetching pending clubs:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}