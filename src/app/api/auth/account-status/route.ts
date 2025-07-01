import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/user';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function checkAccountStatusHandler(req: NextRequest) {
  try {
    let username: string;

    // Support both GET (query params) and POST (JSON body)
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      username = searchParams.get('username') || '';
    } else {
      const body = await req.json();
      username = body.username || '';
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: user.accountStatus,
      rejectionReason: user.rejectionReason,
      createdAt: user.createdAt?.toISOString(),
      approvedAt: user.approvedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Error checking account status:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(RATE_LIMITS.AUTH, checkAccountStatusHandler);
export const POST = withRateLimit(RATE_LIMITS.AUTH, checkAccountStatusHandler);