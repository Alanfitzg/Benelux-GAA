import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const prisma = new PrismaClient();

async function createInterestHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const interest = await prisma.interest.create({
      data: body,
    });
    return NextResponse.json(interest);
  } catch (error) {
    console.error('Error creating interest:', error);
    return NextResponse.json(
      { error: 'Failed to submit interest' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to interest form
export const POST = withRateLimit(RATE_LIMITS.FORMS, createInterestHandler); 