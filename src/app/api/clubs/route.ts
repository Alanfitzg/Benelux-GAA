import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const club = await prisma.club.create({
      data: {
        name: data.name,
        region: data.region || null,
        subRegion: data.subRegion || null,
        map: data.map || null,
        location: data.location || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        website: data.website || null,
        codes: data.codes || null,
        imageUrl: data.imageUrl || null,
      },
    });
    return NextResponse.json({ club }, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 