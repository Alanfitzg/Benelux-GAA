import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

async function submitClubHandler(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      internationalUnitId,
      countryId,
      regionId,
      countryName,
      regionName,
      sportsSupported,
      website,
      email,
    } = body;

    // Validate required fields
    if (!name || (!countryId && !countryName)) {
      return NextResponse.json({ 
        error: 'Club name and country are required' 
      }, { status: 400 });
    }

    // Check for duplicate submissions
    const existingSubmission = await prisma.clubSubmission.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        status: 'PENDING',
      },
    });

    if (existingSubmission) {
      return NextResponse.json({ 
        error: 'A submission for this club is already pending review' 
      }, { status: 409 });
    }

    // Create the submission
    const submission = await prisma.clubSubmission.create({
      data: {
        name,
        internationalUnitId,
        countryId,
        regionId,
        countryName: countryName || undefined,
        regionName: regionName || undefined,
        sportsSupported: sportsSupported || [],
        website: website || undefined,
        email: email || undefined,
        submittedBy: session.user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Club submission received. It will be reviewed by our admin team.',
      submissionId: submission.id,
    });

  } catch (error) {
    console.error('Error submitting club:', error);
    return NextResponse.json({ 
      error: 'Failed to submit club. Please try again.' 
    }, { status: 500 });
  }
}

export const POST = withRateLimit(RATE_LIMITS.FORMS, submitClubHandler);