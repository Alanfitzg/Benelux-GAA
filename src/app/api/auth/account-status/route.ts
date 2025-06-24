import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/user';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function checkAccountStatusHandler(req: NextRequest) {
  try {
    const { username } = await req.json();

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
      accountStatus: user.accountStatus,
      rejectionReason: user.rejectionReason,
    });
  } catch (error) {
    console.error('Error checking account status:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(RATE_LIMITS.AUTH, checkAccountStatusHandler);