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
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        motivations: motivations || [],
        competitiveLevel,
        preferredCities: preferredCities || [],
        preferredCountries: preferredCountries || [],
        preferredClubs: preferredClubs || [],
        activities: activities || [],
        budgetRange,
        maxFlightTime,
        preferredMonths: preferredMonths || [],
        onboardingCompleted: onboardingCompleted || false,
        onboardingSkipped: onboardingSkipped || false,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        motivations: motivations || [],
        competitiveLevel,
        preferredCities: preferredCities || [],
        preferredCountries: preferredCountries || [],
        preferredClubs: preferredClubs || [],
        activities: activities || [],
        budgetRange,
        maxFlightTime,
        preferredMonths: preferredMonths || [],
        onboardingCompleted: onboardingCompleted || false,
        onboardingSkipped: onboardingSkipped || false
      }
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const preferences = await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}