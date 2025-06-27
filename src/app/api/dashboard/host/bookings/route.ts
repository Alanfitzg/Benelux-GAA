import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and their club admin permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        adminOfClubs: true,
        club: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine which clubs this user can see bookings for
    let clubIds: string[] = [];
    
    if (user.role === 'SUPER_ADMIN') {
      // Super admin can see all clubs
      const allClubs = await prisma.club.findMany({ select: { id: true } });
      clubIds = allClubs.map(club => club.id);
    } else if (user.role === 'CLUB_ADMIN') {
      // Club admin can see their administered clubs
      clubIds = user.adminOfClubs.map(club => club.id);
    } else if (user.clubId) {
      // Regular user can only see their own club if they're a member
      clubIds = [user.clubId];
    }

    if (clubIds.length === 0) {
      return NextResponse.json({ bookings: [] });
    }

    // Get URL search params for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build where clause
    const where: Record<string, unknown> = {
      clubId: { in: clubIds }
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    // Fetch recent bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        package: {
          select: {
            name: true
          }
        },
        club: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.booking.count({ where });

    return NextResponse.json({
      bookings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching host dashboard bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}