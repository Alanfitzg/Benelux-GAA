import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const body = await request.json();
  const event = await prisma.event.create({
    data: body,
  });
  return NextResponse.json(event);
} 