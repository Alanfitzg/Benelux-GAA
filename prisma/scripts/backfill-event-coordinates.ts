import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function geocodeLocation(location: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json() as { features?: { center: [number, number] }[] };
  if (data.features && data.features.length > 0) {
    const [lng, lat] = data.features[0].center;
    return { latitude: lat, longitude: lng };
  }
  return { latitude: null, longitude: null };
}

async function backfillEventCoordinates() {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
      ],
    },
  });

  for (const event of events) {
    if (!event.location) continue;
    const { latitude, longitude } = await geocodeLocation(event.location);
    if (latitude && longitude) {
      await prisma.event.update({
        where: { id: event.id },
        data: { latitude, longitude },
      });
      console.log(`Updated event ${event.id} (${event.title}) with lat/lng: ${latitude}, ${longitude}`);
    } else {
      console.warn(`Could not geocode location for event ${event.id} (${event.title}): ${event.location}`);
    }
  }
  console.log('Backfill complete.');
  await prisma.$disconnect();
}

backfillEventCoordinates().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 