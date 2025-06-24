import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function getPendingUsersHandler() {
  try {
    const authResult = await requireSuperAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const pendingUsers = await prisma.user.findMany({
      where: {
        accountStatus: 'PENDING'
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        club: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export const GET = withRateLimit(RATE_LIMITS.ADMIN, getPendingUsersHandler);