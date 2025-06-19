import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
  });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  return NextResponse.json(event);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    let startDate = body.startDate;
    if (startDate && typeof startDate === 'string' && !startDate.includes('T')) {
      startDate = new Date(startDate).toISOString();
    }
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...body,
        startDate,
      },
    });
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: 'Error updating event' }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.event.delete({
    where: { id },
  });
  return NextResponse.json({ message: 'Event deleted' });
} 