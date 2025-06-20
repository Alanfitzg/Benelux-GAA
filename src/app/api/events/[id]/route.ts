import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { MESSAGES } from '@/lib/constants';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
  });
  if (!event) {
    return NextResponse.json({ error: MESSAGES.ERROR.EVENT_NOT_FOUND }, { status: 404 });
  }
  return NextResponse.json(event);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    console.log('Update event body:', body);
    
    let startDate = body.startDate;
    if (startDate && typeof startDate === 'string' && !startDate.includes('T')) {
      startDate = new Date(startDate).toISOString();
    }
    
    let endDate = body.endDate;
    if (endDate && typeof endDate === 'string' && !endDate.includes('T')) {
      endDate = new Date(endDate).toISOString();
    }
    
    // Clean the data to only include valid fields
    const cost = body.cost !== undefined && body.cost !== null && body.cost !== '' 
      ? (typeof body.cost === 'number' ? body.cost : parseFloat(body.cost))
      : null;
    
    // Validate cost is not NaN
    if (cost !== null && isNaN(cost)) {
      throw new Error('Invalid cost value');
    }
    
    const cleanData = {
      title: body.title,
      eventType: body.eventType,
      location: body.location,
      startDate,
      endDate: endDate || null,
      cost,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
    };
    
    console.log('Clean data:', cleanData);
    
    const event = await prisma.event.update({
      where: { id },
      data: cleanData,
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: MESSAGES.ERROR.GENERIC, details: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.event.delete({
    where: { id },
  });
  return NextResponse.json({ message: MESSAGES.SUCCESS.EVENT_DELETED });
} 