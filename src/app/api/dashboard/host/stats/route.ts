import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    // Determine which clubs this user can see stats for
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
      return NextResponse.json({
        totalEarnings: 0,
        monthlyEarnings: 0,
        totalBookings: 0,
        activeBookings: 0,
        inquiries: 0,
        packages: 0
      });
    }

    // Get current month start/end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch all stats in parallel
    const [
      totalEarningsResult,
      monthlyEarningsResult,
      totalBookingsCount,
      activeBookingsCount,
      inquiriesCount,
      packagesCount
    ] = await Promise.all([
      // Total earnings (all time)
      prisma.booking.aggregate({
        where: {
          clubId: { in: clubIds },
          status: { in: ['COMPLETED', 'FULL_PAID'] }
        },
        _sum: { clubEarnings: true }
      }),
      
      // Monthly earnings
      prisma.booking.aggregate({
        where: {
          clubId: { in: clubIds },
          status: { in: ['COMPLETED', 'FULL_PAID'] },
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { clubEarnings: true }
      }),
      
      // Total bookings count
      prisma.booking.count({
        where: {
          clubId: { in: clubIds }
        }
      }),
      
      // Active bookings (confirmed, paid, etc.)
      prisma.booking.count({
        where: {
          clubId: { in: clubIds },
          status: { in: ['CONFIRMED', 'DEPOSIT_PAID', 'FULL_PAID'] },
          arrivalDate: { gte: new Date() }
        }
      }),
      
      // Recent inquiries
      prisma.clubInterest.count({
        where: {
          clubId: { in: clubIds },
          submittedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      
      // Active packages
      prisma.hostingPackage.count({
        where: {
          clubId: { in: clubIds },
          isActive: true
        }
      })
    ]);

    return NextResponse.json({
      totalEarnings: totalEarningsResult._sum.clubEarnings || 0,
      monthlyEarnings: monthlyEarningsResult._sum.clubEarnings || 0,
      totalBookings: totalBookingsCount,
      activeBookings: activeBookingsCount,
      inquiries: inquiriesCount,
      packages: packagesCount
    });

  } catch (error) {
    console.error('Error fetching host dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}