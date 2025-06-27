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

    // Determine which clubs this user can see inquiries for
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
      return NextResponse.json({ inquiries: [] });
    }

    // Get URL search params for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const days = parseInt(searchParams.get('days') || '30'); // Default to last 30 days

    // Calculate date range
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Fetch recent inquiries
    const inquiries = await prisma.clubInterest.findMany({
      where: {
        clubId: { in: clubIds },
        submittedAt: {
          gte: dateFrom
        }
      },
      include: {
        club: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.clubInterest.count({
      where: {
        clubId: { in: clubIds },
        submittedAt: {
          gte: dateFrom
        }
      }
    });

    return NextResponse.json({
      inquiries,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching host dashboard inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}