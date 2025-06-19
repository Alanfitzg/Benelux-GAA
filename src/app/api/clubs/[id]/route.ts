import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    return NextResponse.json(club);
  } catch {
    return NextResponse.json({ error: 'Error fetching club' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const data = await req.json();
    const club = await prisma.club.update({
      where: { id },
      data: {
        name: data.name,
        map: data.map,
        location: data.location,
        facebook: data.facebook,
        instagram: data.instagram,
        website: data.website,
        codes: data.codes,
        imageUrl: data.imageUrl,
      },
    });
    return NextResponse.json(club);
  } catch {
    return NextResponse.json({ error: 'Error updating club' }, { status: 400 });
  }
} 