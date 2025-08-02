import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let session;
  try {
    session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received preferences data:', JSON.stringify(body, null, 2));
    
    const {
      motivations,
      competitiveLevel,
      preferredCities,
      preferredCountries,
      preferredClubs,
      activities,
      budgetRange,
      maxFlightTime,
      preferredMonths,
      onboardingCompleted,
      onboardingSkipped
    } = body;

    // Validate and sanitize data
    const sanitizedData = {
      motivations: Array.isArray(motivations) ? motivations : [],
      competitiveLevel: competitiveLevel || null,
      preferredCities: Array.isArray(preferredCities) ? preferredCities : [],
      preferredCountries: Array.isArray(preferredCountries) ? preferredCountries : [],
      preferredClubs: Array.isArray(preferredClubs) ? preferredClubs : [],
      activities: Array.isArray(activities) ? activities : [],
      budgetRange: budgetRange || null,
      maxFlightTime: typeof maxFlightTime === 'number' ? maxFlightTime : null,
      preferredMonths: Array.isArray(preferredMonths) ? preferredMonths : [],
      onboardingCompleted: Boolean(onboardingCompleted),
      onboardingSkipped: Boolean(onboardingSkipped)
    };

    console.log('Sanitized data:', JSON.stringify(sanitizedData, null, 2));

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.error('User not found:', session.user.id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', { id: user.id, email: user.email });

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...sanitizedData,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        ...sanitizedData
      }
    });

    console.log('Successfully saved preferences for user:', session.user.id);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id
    });
    return NextResponse.json(
      { 
        error: 'Failed to save preferences', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  let session;
  try {
    session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('PATCH request data:', JSON.stringify(body, null, 2));
    
    // Check if preferences exist
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingPreferences) {
      return NextResponse.json(
        { error: 'User preferences not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const preferences = await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    console.log('Successfully updated preferences for user:', session.user.id);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id
    });
    return NextResponse.json(
      { 
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}