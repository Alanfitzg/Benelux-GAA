import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const interest = await prisma.interest.create({
    data: body,
  });
  return NextResponse.json(interest);
} 