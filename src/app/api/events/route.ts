import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function geocodeLocation(location: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.features && data.features.length > 0) {
    const [lng, lat] = data.features[0].center;
    return { latitude: lat, longitude: lng };
  }
  return { latitude: null, longitude: null };
}

export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { latitude, longitude } = await geocodeLocation(body.location);

  const event = await prisma.event.create({
    data: {
      ...body,
      latitude,
      longitude,
    },
  });
  return NextResponse.json(event);
} 