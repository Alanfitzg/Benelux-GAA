import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geocodeLocation } from '@/lib/utils';
import { withErrorHandling, parseJsonBody } from '@/lib/utils';
import { requireClubAdmin } from '@/lib/auth-helpers';

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
};

export async function GET() {
  try {
    const events = await prisma.event.findMany();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  return withErrorHandling(async () => {
    const body = await parseJsonBody<CreateEventBody>(request);
    const { latitude, longitude } = await geocodeLocation(body.location);

    const eventData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      latitude,
      longitude,
    };

    const event = await prisma.event.create({
      data: eventData,
    });
    return event;
  });
} 