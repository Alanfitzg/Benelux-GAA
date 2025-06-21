import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireClubAdmin } from '@/lib/auth-helpers';

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
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
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
        teamTypes: data.teamTypes || [],
      },
    });
    return NextResponse.json(club);
  } catch {
    return NextResponse.json({ error: 'Error updating club' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { id } = await context.params;
  try {
    await prisma.club.delete({ where: { id } });
    return NextResponse.json({ message: 'Club deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Error deleting club' }, { status: 400 });
  }
} 