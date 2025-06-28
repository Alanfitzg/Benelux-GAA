import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geocodeLocation } from '@/lib/utils';
import { withErrorHandling, parseJsonBody } from '@/lib/utils';
import { requireClubAdmin } from '@/lib/auth-helpers';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

type CreateEventBody = {
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  endDate?: string;
  cost?: number;
  description?: string;
  isRecurring?: boolean;
  imageUrl?: string;
  clubId?: string;
  // Tournament-specific fields
  minTeams?: number;
  maxTeams?: number;
  acceptedTeamTypes?: string[];
};

async function getEventsHandler() {
  try {
    const events = await prisma.event.findMany({
      include: {
        club: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          }
        }
      }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' }, 
      { status: 500 }
    );
  }
}

async function createEventHandler(request: NextRequest) {
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  return withErrorHandling(async () => {
    const body = await parseJsonBody<CreateEventBody>(request);
    console.log('Creating event with data:', JSON.stringify(body, null, 2));
    
    const { latitude, longitude } = await geocodeLocation(body.location);

    const eventData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      latitude,
      longitude,
      // Ensure acceptedTeamTypes is always an array (empty if not provided)
      acceptedTeamTypes: body.acceptedTeamTypes || [],
    };

    console.log('Event data for database:', JSON.stringify(eventData, null, 2));

    try {
      const event = await prisma.event.create({
        data: eventData,
      });
      console.log('Event created successfully:', event.id);
      return event;
    } catch (dbError) {
      console.error('Database error creating event:', dbError);
      throw dbError;
    }
  });
}

// Apply rate limiting to endpoints
export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getEventsHandler);
export const POST = withRateLimit(RATE_LIMITS.ADMIN, createEventHandler); 